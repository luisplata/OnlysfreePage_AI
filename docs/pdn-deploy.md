# Release a PDN (onlysfree.com)

Plan de despliegue del export estático a producción. Reutiliza todo lo aprendido en QA
(`docs/qa-release.md`) y agrega lo específico de producción.

## Estado de partida (verificado 2026-11-27)

| Cosa | Valor |
|---|---|
| Dominio | `https://onlysfree.com` (`www` es symlink a `public_html`) |
| Docroot | `/home/onlysfre/public_html` (2.8 MB) |
| Build publicado | `2025-05-26T01-53-23.916Z` (mayo 2025) |
| `.htaccess` | Ya es el del repo: `/path → /path.html`, `ErrorDocument 404`, `no-store` en HTML |
| API | `https://admin.onlysfree.com/api` → `200`, CORS `*` |
| Endpoints de ads | `placements/*` y `ads/impression` → **404 en producción** (solo existen en QA) |
| Contenido | `/api/packs`, `/api/ppv`, `/api/search` responden con datos reales |
| Cache | nginx delante del docroot; la URL limpia puede tardar en reflejar un deploy |

## Qué cambia respecto de QA

| | QA | PDN |
|---|---|---|
| Dominio | `ai.onlysfree.com` | `onlysfree.com` |
| Docroot | `~/ai.onlysfree.com` | `~/public_html` |
| API | `https://test.onlysfree.com/api` | `https://admin.onlysfree.com/api` |
| Disparador | push a `main` + manual | **manual** (+ tag), con aprobación |
| Ads | endpoints existen | **no existen todavía** |
| Costo de un error | se re-deploya | visitantes reales + SEO |

## Fases

### 0. Pre-flight (bloqueantes)

- [ ] **Ads**: decidir si se publica con el slot mostrando "Ad Error" o se espera al backend.
- [ ] **Cache**: pedir al hosting la purga de `onlysfree.com` antes del primer deploy, o aceptar
      que el HTML viejo siga visible hasta que expire.
- [ ] `npm test` y `npm run typecheck` verdes en `main` (el build ignora errores de tipos).
- [ ] Verificar el ZIP del run en local (Docker: `docs/local-preview.md`).

### 1. Infra (una sola vez)

- [ ] Llave SSH dedicada `onlysfree_gha_pdn` → `authorized_keys` con
      `no-pty,no-port-forwarding,no-agent-forwarding,no-user-rc,no-X11-forwarding`.
- [ ] Secretos: `PDN_SSH_KEY`, `PDN_SSH_KNOWN_HOSTS` (host key pineada, nunca
      `StrictHostKeyChecking=no`).
- [ ] Variables: `PDN_SSH_HOST`, `PDN_SSH_PORT`, `PDN_SSH_USER`, `PDN_DEPLOY_PATH=public_html`,
      `PDN_API_URL=https://admin.onlysfree.com/api`, `PDN_WEB_URL=https://onlysfree.com`.
- [ ] Environment `production` en GitHub con required reviewers (el job espera aprobación).

### 2. Workflow `pdn-release.yml`

Copiar la estructura de `qa-build.yml` cambiando:

| Paso | Cambio para PDN |
|---|---|
| Triggers | `workflow_dispatch` (+ `push` de tags `v*`), **nunca** push a `main` |
| `environment` | `production` (aprobación manual) |
| Build env | `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WEB_URL` desde `PDN_*` |
| Guardas | invertidas: falla si aparece `test.onlysfree.com` o `ai.onlysfree.com` |
| Backup | tar.gz en `~/pdn_backup/` **y** ZIP como artefacto con retención 90 días |
| Sync | **primera pasada sin `--delete`**; ver abajo |
| Smoke | `/`, `/products/detail?id=<id real>`, `/deals/daily`, `/search/query`, `/streamings`, 404 real |
| buildId | igual que QA: cache-buster obligatorio, URL limpia como warning |

### 3. Primer deploy — aditivo, no destructivo

`rsync --delete` borra los assets viejos; un HTML todavía cacheado que los referencia quedaría
roto (CSS/JS 404). Por eso el primer deploy va en dos tiempos:

```bash
# 1) copiar sin borrar: conviven el build viejo y el nuevo
rsync -az \
  --exclude '.well-known/' --exclude 'out.zip' --exclude 'copia-sitio-web.zip' \
  -e "ssh -i ~/.ssh/pdn_deploy -p $PORT -o IdentitiesOnly=yes" \
  out/ "$USER@$HOST:~/public_html/"

# 2) cuando el cache ya sirve el build nuevo, limpiar los archivos viejos
rsync -az --delete \
  --exclude '.well-known/' --exclude 'out.zip' --exclude 'copia-sitio-web.zip' \
  -e "ssh -i ~/.ssh/pdn_deploy -p $PORT -o IdentitiesOnly=yes" \
  out/ "$USER@$HOST:~/public_html/"
```

El paso 2 se corre como `workflow_dispatch` con el input `cleanup=true`, días después, no en el
mismo deploy.

### 4. Verificación post-deploy

```bash
curl -s https://onlysfree.com/?cb=$$ | grep -o '"buildId":"[^"]*"'   # debe ser el build nuevo
curl -s https://onlysfree.com/        | grep -o '"buildId":"[^"]*"'   # puede tardar (cache)
curl -s -o /dev/null -w '%{http_code}\n' https://onlysfree.com/products/detail?id=<id>
curl -s -o /dev/null -w '%{http_code}\n' https://onlysfree.com/no-existe   # 404 real
```

Revisar en el navegador: home, detalle, search, streamings, y que no haya requests a
`test.onlysfree.com`.

### 5. Rollback

```bash
ssh ... "tar xzf ~/pdn_backup/pdn-<sha7>-<ts>.tar.gz -C ~/public_html"
```

El tar.gz se toma **antes** de tocar el docroot. Si el problema es el cache y no el build, el
rollback no se ve hasta que expire: no hacer cambios a ciegas.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cache sirviendo HTML viejo con assets borrados | Deploy aditivo (paso 3.1) y limpieza diferida (3.2) |
| Ads sin backend en producción | Decisión de fase 0; el slot degrada a "Ad Error", no rompe la página |
| Build "verde" con tipos rotos | `typecheck` antes del build (ya está) |
| Deploy accidental | Solo `workflow_dispatch`/tag + environment con aprobación |
| Pérdida del sitio actual | Backup tar.gz previo + ZIP con 90 días de retención |

## Orden sugerido

1. Resolver la decisión de ads.
2. Crear llave/secrets/vars y el environment.
3. Escribir `pdn-release.yml` sin el paso de rsync (dry run: build + guardas + ZIP).
4. Un run real con `cleanup=false` en horario de bajo tráfico.
5. Verificar, monitorear 24 h, y recién ahí correr `cleanup=true`.
