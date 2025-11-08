# Dockerfile simplificado para k6 con soporte de Browser y extensión xk6-output-influxdb
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Instalar dependencias
RUN apk add --no-cache git gcc musl-dev

# Instalar xk6
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Construir k6 con extensiones
RUN xk6 build v0.54.0 \
    --with github.com/grafana/xk6-browser@latest \
    --with github.com/grafana/xk6-output-influxdb@latest

# Imagen final
FROM grafana/k6:master-with-browser

# Copiar el binario personalizado de k6
COPY --from=builder /build/k6 /usr/bin/k6

# Mantener el resto de la configuración de la imagen original
USER root
RUN chmod +x /usr/bin/k6
USER 12345

WORKDIR /home/k6

ENTRYPOINT ["k6"]
