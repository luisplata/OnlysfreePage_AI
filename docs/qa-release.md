# Release a QA (ZIP de 1 día)

## Qué hace

El workflow **QA build** (`.github/workflows/qa-build.yml`) compila el export estático y entrega
un único ZIP listo para Apache: `onlysfree-qa-<sha7>-run<N>.zip`.

Corre los gates de tipos y tests antes del build, inyecta las URLs de QA y no publica nada si
algo falla. Usalo cuando necesites mostrar el sitio en `test.onlysfree.com` sin tocar producción.

## Cómo dispararlo

| Disparador | Cuándo |
|---|---|
| Actions → **QA build** → **Run workflow** | Manual. El workflow debe existir en la rama default para que aparezca el botón; después podés elegir otra rama |
| `push` a `main` | Automático; `main` siempre tiene un QA fresco |

El run tarda ~2 minutos. Los gates (`typecheck`, `test`) cortan antes del build: un job verde
significa que el ZIP ya está publicado como artefacto.

## Cómo descargar

1. Abrí el repo en GitHub → **Actions** → **QA build**.
2. Entrá al run más reciente con tilde verde.
3. Abajo, en **Artifacts**, descargá `onlysfree-qa-<sha7>-run<N>.zip`.
4. Descomprimilo **una sola vez**: ya es el sitio, no hay ZIP dentro del ZIP.

## Cómo subir al servidor QA

1. Descomprimí el ZIP en el web root de QA (el contenido del ZIP **es** el web root).
2. Verificá que `.htaccess` esté en esa raíz (es un archivo oculto: activá "mostrar ocultos").
3. Verificá que `_next/` haya llegado completo junto a `index.html` y `404.html`.
4. Probá `https://test.onlysfree.com/products/detail` (clean URL) y una ruta inexistente
   (debe servir `404.html`).

Si la clean URL da 404, falta `.htaccess` o el servidor no tiene `mod_rewrite`.

## Caducidad

> El artefacto expira a las **24 horas**. Si ya no aparece en **Artifacts**, relanzá el workflow.

## Troubleshooting

| Síntoma | Causa | Arreglo |
|---|---|---|
| Step `Typecheck` rojo | Error de tipos que `next build` habría ignorado (`ignoreBuildErrors: true`) | Corregir el tipo y relanzar |
| Step `Tests` rojo | Un test de vitest falla | Arreglar el test; el artefacto no se publica |
| Step `Build con URLs de QA` rojo por fuentes | `next/font/google` no pudo descargar en CI | Re-lanzar el run |
| `::error::El export contiene admin.onlysfree.com` | El bundle quedó con la URL de producción | Definir `QA_API_URL`/`QA_WEB_URL` en Settings → Variables, o quitar el host de producción del contenido cliente-visible |
| `find` del guard sin salida | El export quedó vacío o sin `_next/` | Revisar el log del build; el run no publica |
| Falla `test -f out/.htaccess` o `out/index.html` | Se perdió la copia desde `app/` o cambió el layout | Revisar el step "Copiar .htaccess al export" |
| El paso de ZIP falla en `unzip -l` | El empaquetado no incluyó `.htaccess` | Confirmar que el `zip` usa `.` y no `*` |
| Upload: "no files found" o "multiple files" | No se generó el ZIP, o hay más de uno en `path` | Revisar el step de empaquetado; con `archive: false` el `path` debe apuntar a un solo archivo |

## Notas

- Las variables `QA_API_URL` y `QA_WEB_URL` son **opcionales**: sin ellas, el build apunta a
  `test.onlysfree.com`. Se configuran en Settings → Secrets and variables → Actions → **Variables**.
- Nunca pongas secretos en `QA_*`: se inlinean en el JS público del bundle.
- El deploy al servidor es manual. El workflow no escribe nada fuera de GitHub.
