# Preview local con Docker

Levantá el export estático en `http://localhost:8081` con un comando:

```bash
docker compose -f docker-compose.qa.yml up --build
```

Es un preview de un solo servicio (nginx), no un deploy. No comparte nada con
los contenedores del backend.

## Para qué sirve

Ver el sitio tal como queda después de `next build` (`out/`), con las mismas
reglas de ruteo que `app/.htaccess`, sin tocar Apache ni el servidor de QA.

## Requisitos

- Docker con Compose v2 (`docker compose version`).
- Puerto **8081** libre en el host.
- Red para el build: `npm ci` baja dependencias y `next/font/google` baja las
  fuentes.

## Puertos y aislamiento

| Qué | Valor |
|---|---|
| URL del preview | `http://localhost:8081` |
| Puerto del contenedor | `80` (interno) |
| Otro puerto en el host | `QA_PREVIEW_PORT=9090 docker compose -f docker-compose.qa.yml up --build` |
| Red | Propia del proyecto (`onlysfree-qa-preview`), sin redes externas |

El stack del backend ya publica 80, 443 y 3306 desde otro compose. Este archivo
no los usa, no define `external: true` ni `depends_on`, y no menciona ningún
servicio de backend. Podés tener los dos levantados a la vez.

## Variables de build

`NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_WEB_URL` se inlinean en el JS **en tiempo
de build**. Cambiarlas exige reconstruir la imagen (`--build`).

| Variable del compose | Default | Qué controla |
|---|---|---|
| `QA_API_URL` | `http://localhost/api` | API que consume el navegador |
| `QA_WEB_URL` | `http://localhost` | URL pública del sitio |

```bash
QA_API_URL=http://127.0.0.1:8000/api \
QA_WEB_URL=http://localhost:8000 \
docker compose -f docker-compose.qa.yml up --build
```

El default apunta al backend local del **puerto 80**, el que publica el
`webserver`: `curl http://localhost/api/tags` responde 200. Si tu backend no
escucha ahí, cambiá la variable: `php artisan serve` usa
`http://127.0.0.1:8000/api`, QA usa `https://test.onlysfree.com/api`.

Para un override persistente, creá un `.env` junto al compose con
`QA_API_URL=...`; el shell también sirve. No hace falta editar archivos.

> Las resuelve el **navegador**, no el contenedor: son URLs del host, nunca el
> nombre de un servicio de Docker.

El `.env.local` del host no entra a la imagen (`.dockerignore` lo excluye) y el
compose no lo lee.

## Cómo funciona

1. Etapa `builder` (`node:22-alpine`): `npm ci` y `npm run build` generan `out/`.
2. Etapa `runtime` (`nginx:1.27-alpine`): copia `out/` a `/usr/share/nginx/html`
   y usa `docker/nginx.conf`.
3. La imagen final no tiene Node ni `node_modules`.

Equivalencia con `app/.htaccess`:

| Pedido | Respuesta |
|---|---|
| Archivo o directorio existente | Se sirve tal cual |
| `/products/detail` | `/products/detail.html` con 200 |
| Ruta inexistente | `/404.html` con 404 real |

## Troubleshooting

| Síntoma | Causa | Arreglo |
|---|---|---|
| `port is already allocated` en 8081 | Otro proceso usa el puerto | `QA_PREVIEW_PORT=9090` o liberar el 8081 |
| El build falla en `npm ci` | Sin red, o `package-lock.json` desincronizado con `package.json` | Revisar la red; correr `npm install` y commitear el lock |
| El build falla en `next/font/google` | Sin salida a internet | Reintentar con red; es el mismo fallo intermitente que en CI |
| El sitio carga pero no hay datos | El backend no responde en la URL inlineada | `curl http://localhost/api/tags`; reconstruir con `QA_API_URL=...` |
| El HTML apunta a producción | No pasaste `QA_API_URL`/`QA_WEB_URL` y el default no es el que querés | Reconstruir con `--build` y las variables correctas |
| Clean URL da 404 | Falta `try_files` en `docker/nginx.conf` | Revisar la línea `try_files $uri $uri.html $uri/ =404;` |
| Ruta inexistente devuelve 200 | `index.html` atajando todo | Revisar `error_page 404 /404.html` y el `location = /404.html { internal; }` |
| `unhealthy` en `docker compose ps` | nginx no responde en `/` | `docker compose -f docker-compose.qa.yml logs web` |
| Cambios de código no aparecen | Imagen cacheada | `docker compose -f docker-compose.qa.yml up --build --force-recreate` |

## Detener y limpiar

```bash
# Detener (los datos no existen: es estático)
docker compose -f docker-compose.qa.yml down

# Además borrar la imagen construida
docker compose -f docker-compose.qa.yml down --rmi local
```

El contenedor tiene `restart: unless-stopped`: sobrevive a reinicios de Docker
hasta que lo bajes con `down`.

## Verificación rápida

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/products/detail
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/no-existe
docker compose -f docker-compose.qa.yml ps
```

Esperado: `200`, `200`, `404` y `healthy`.

## Qué NO es

- No es un deploy: nada de esto llega a `test.onlysfree.com`.
- No valida Apache ni `.htaccess`: nginx imita su comportamiento, no lo ejecuta.
- No reemplaza el flujo de release; ver [Release a QA](qa-release.md).
