# syntax=docker/dockerfile:1

# =============================================================================
# Preview local del export estático de Next.js.
# Etapa 1 compila con Node, etapa 2 sirve los archivos con nginx.
# La imagen final NO contiene Node ni node_modules.
# =============================================================================

# --- Etapa 1: builder --------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Dependencias primero: si package-lock no cambia, la capa de npm ci se reusa.
COPY package.json package-lock.json ./
RUN npm ci

# Código fuente. Lo que no hace falta se filtra en .dockerignore.
COPY . .

# NEXT_PUBLIC_* se inlinea en el bundle durante el build, así que tiene que
# llegar como ARG y estar en el entorno antes de `npm run build`.
# Los valores los resuelve el NAVEGADOR del usuario, no el contenedor: por eso
# son URLs del host, nunca el nombre de un servicio de Docker.
# Default: el backend local que publica el puerto 80 (curl http://localhost/api/tags).
# Si usás `php artisan serve` en el 8000, o apuntás a test.onlysfree.com,
# pasá los build args correspondientes.
ARG NEXT_PUBLIC_API_URL=http://localhost/api
ARG NEXT_PUBLIC_WEB_URL=http://localhost
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL

# Genera out/ (next.config.ts tiene output: 'export').
RUN npm run build

# --- Etapa 2: runtime --------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Config propia: replica app/.htaccess. Ese archivo NO se copia a la imagen,
# nginx lo reemplaza.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# El export estático es el web root.
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
