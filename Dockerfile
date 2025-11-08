# Dockerfile para k6 con soporte de Browser y extensión xk6-output-influxdb
FROM golang:1.21-alpine AS builder

# Instalar dependencias de compilación
RUN apk add --no-cache git

# Instalar xk6
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Construir k6 con extensiones
RUN xk6 build \
    --with github.com/grafana/xk6-browser@latest \
    --with github.com/grafana/xk6-output-influxdb@latest

# Imagen final
FROM alpine:3.19

# Instalar Chromium y dependencias necesarias para k6 browser
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    ca-certificates \
    dumb-init

# Configurar variables de entorno para Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    CHROMIUM_FLAGS="--disable-software-rasterizer --disable-dev-shm-usage"

# Copiar el binario de k6 desde el builder
COPY --from=builder /go/k6 /usr/bin/k6

# Crear usuario no-root
RUN adduser -D -u 12345 k6
USER k6

WORKDIR /home/k6

ENTRYPOINT ["k6"]
