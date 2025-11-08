# 🚀 Configuración de GitHub Actions + InfluxDB + Grafana

## 📋 Tabla de Contenidos
1. [Opción 1: InfluxDB Cloud (Recomendado)](#opción-1-influxdb-cloud)
2. [Opción 2: Self-Hosted con Docker](#opción-2-self-hosted-con-docker)
3. [Configuración de GitHub Secrets](#configuración-de-github-secrets)
4. [Configuración de Grafana](#configuración-de-grafana)
5. [Verificación](#verificación)

---

## Opción 1: InfluxDB Cloud ⭐ (Recomendado - Más Fácil)

### Paso 1: Crear cuenta en InfluxDB Cloud

1. Ve a https://cloud2.influxdata.com/signup
2. Crea una cuenta gratuita
3. Selecciona la región más cercana

### Paso 2: Obtener credenciales

```bash
# En InfluxDB Cloud UI:
# 1. Ve a "Data" → "API Tokens"
# 2. Genera un nuevo token con permisos de escritura
# 3. Copia el token (solo se muestra una vez)

# 4. Ve a "Load Data" → "Buckets"
# 5. Crea un bucket llamado "k6" o usa el default

# 6. Nota tu Organization (en Settings)
```

### Paso 3: Configurar GitHub Secrets

En tu repositorio de GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

Agrega estos secrets:

```yaml
INFLUXDB_URL: https://us-east-1-1.aws.cloud2.influxdata.com
INFLUXDB_ORG: tu-organizacion-aqui
INFLUXDB_BUCKET: k6
INFLUXDB_TOKEN: tu-token-super-secreto-aqui
```

### Paso 4: Conectar Grafana Cloud

1. Ve a https://grafana.com/auth/sign-up/create-user
2. Crea una cuenta gratuita de Grafana Cloud
3. En Grafana Cloud:
   - Ve a "Connections" → "Add data source"
   - Selecciona "InfluxDB"
   - Configura:
     ```
     URL: https://us-east-1-1.aws.cloud2.influxdata.com
     Organization: tu-org
     Token: tu-token
     Default Bucket: k6
     ```

---

## Opción 2: Self-Hosted con Docker 🐳

### Paso 1: Servidor VPS o Local

Necesitas un servidor accesible desde GitHub Actions (IP pública o túnel).

**Proveedores recomendados:**
- DigitalOcean ($6/mes)
- AWS EC2 t3.micro (Free tier)
- Railway.app (Free tier con limitaciones)

### Paso 2: Instalar InfluxDB + Grafana

```bash
# Conectar a tu servidor
ssh usuario@tu-servidor.com

# Clonar configuración
git clone tu-repo
cd tu-repo

# Iniciar servicios
docker-compose -f docker-compose-monitoring.yml up -d
```

### Paso 3: Configurar InfluxDB

```bash
# Acceder a InfluxDB
docker exec -it k6-influxdb influx

# Crear base de datos
CREATE DATABASE k6

# Verificar
SHOW DATABASES

# Salir
exit
```

### Paso 4: Exponer InfluxDB (Opción A - Con Nginx)

```nginx
# /etc/nginx/sites-available/influxdb
server {
    listen 80;
    server_name influx.tudominio.com;
    
    location / {
        proxy_pass http://localhost:8086;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Paso 4: Exponer InfluxDB (Opción B - Túnel con ngrok)

```bash
# Instalar ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz

# Autenticar (obtener token en https://dashboard.ngrok.com)
./ngrok config add-authtoken tu-token-ngrok

# Crear túnel para InfluxDB
./ngrok http 8086

# Copiar la URL (ejemplo: https://abc123.ngrok-free.app)
```

### Paso 5: GitHub Secrets (Self-Hosted)

```yaml
INFLUXDB_URL: http://tu-servidor.com:8086/k6
# O si usas ngrok:
INFLUXDB_URL: https://abc123.ngrok-free.app/k6

INFLUXDB_ORG: ""  # Dejar vacío para InfluxDB v1.x
INFLUXDB_BUCKET: k6
INFLUXDB_TOKEN: ""  # Dejar vacío si no hay autenticación
INFLUXDB_INSECURE: "true"  # Solo para testing
```

---

## Configuración de GitHub Secrets 🔐

### Agregar Secrets paso a paso:

1. **Ve a tu repositorio en GitHub**
2. **Click en "Settings"** (⚙️)
3. **En el menú lateral:** "Secrets and variables" → "Actions"
4. **Click en "New repository secret"**
5. **Agrega cada secret:**

```
Nombre: INFLUXDB_URL
Valor: https://us-east-1-1.aws.cloud2.influxdata.com
```

```
Nombre: INFLUXDB_ORG
Valor: tu-organizacion
```

```
Nombre: INFLUXDB_BUCKET
Valor: k6
```

```
Nombre: INFLUXDB_TOKEN
Valor: tu-token-super-largo
```

```
Nombre: GRAFANA_URL (opcional)
Valor: https://tuorg.grafana.net
```

---

## Configuración de Grafana 📊

### Importar Dashboard de k6

1. **Accede a Grafana:**
   - Cloud: https://tuorg.grafana.net
   - Local: http://localhost:3000

2. **Importar Dashboard:**
   - Click en "+" → "Import Dashboard"
   - ID del dashboard: **2587** (k6 Load Testing Results)
   - Click "Load"
   - Selecciona tu InfluxDB data source
   - Click "Import"

### Dashboard Personalizado para Holisteek

Crea un nuevo dashboard con estos queries:

```sql
-- Carga de Página Home
SELECT mean("value") 
FROM "carga_pagina_home_ms" 
WHERE $timeFilter 
GROUP BY time($__interval)

-- Tiempo Selección Ciudad
SELECT mean("value") 
FROM "tiempo_seleccion_ciudad_ms" 
WHERE $timeFilter 
GROUP BY time($__interval)

-- Carga de Resultados
SELECT mean("value") 
FROM "tiempo_carga_resultados_ms" 
WHERE $timeFilter 
GROUP BY time($__interval)

-- Tiempo Total
SELECT mean("value") 
FROM "tiempo_total_flujo_ms" 
WHERE $timeFilter 
GROUP BY time($__interval)

-- Tasa de Errores
SELECT mean("value") * 100 as "error_rate"
FROM "tasa_errores" 
WHERE $timeFilter 
GROUP BY time($__interval)

-- Checks Rate
SELECT mean("rate") * 100 as "success_rate"
FROM "checks" 
WHERE $timeFilter 
GROUP BY time($__interval)
```

### Paneles Recomendados:

1. **Time Series:**
   - Tiempos de carga (líneas)
   - Web Vitals (LCP, FCP, CLS)

2. **Stat:**
   - Tasa de éxito actual
   - Tasa de errores
   - Tiempo promedio de flujo

3. **Gauge:**
   - P95 de cada métrica vs threshold

4. **Table:**
   - Últimas ejecuciones con detalles

---

## Estructura del Workflow Final

```yaml
jobs:
  k6-browser:
    runs-on: ubuntu-latest
    steps:
      - Checkout código
      - Crear directorio screenshots
      - Ejecutar k6 con --out influxdb
      - Subir artifacts (HTML, JSON, screenshots)
      - Comentar en PR con resultados
```

---

## Verificación ✅

### 1. Verificar que InfluxDB recibe datos

**InfluxDB Cloud:**
```
Data Explorer → Select bucket "k6" → Ver métricas
```

**InfluxDB Local:**
```bash
docker exec -it k6-influxdb influx

USE k6
SHOW MEASUREMENTS
SELECT * FROM carga_pagina_home_ms LIMIT 10
```

### 2. Ejecutar test manual

```bash
# En GitHub:
Actions → k6 load + browser → Run workflow
```

### 3. Ver resultados

- **Artifacts:** En la página del workflow
- **InfluxDB:** Queries en Data Explorer
- **Grafana:** Dashboard importado

---

## Troubleshooting 🔧

### Error: "Connection refused to InfluxDB"

```bash
# Verificar que InfluxDB está corriendo
docker ps | grep influxdb

# Ver logs
docker logs k6-influxdb

# Verificar puerto
curl http://localhost:8086/ping
```

### Error: "Invalid token"

```bash
# Regenerar token en InfluxDB Cloud UI
# O crear nuevo token local:
docker exec -it k6-influxdb influx auth create \
  --org tu-org \
  --read-bucket k6 \
  --write-bucket k6
```

### No aparecen datos en Grafana

```bash
# 1. Verificar data source configuration
# 2. Ver query en Explore
# 3. Verificar time range
# 4. Ver logs de Grafana:
docker logs k6-grafana
```

---

## Costos Estimados 💰

### ⭐ Opción Recomendada (Cloud):

```
InfluxDB Cloud Free Tier:
- Lecturas ilimitadas
- 30 días de retención
- Rate limits: 10,000 writes/min
✅ GRATIS

Grafana Cloud Free Tier:
- 10,000 series
- 14 días retención
- 3 usuarios
✅ GRATIS

Total: $0/mes
```

### Opción Self-Hosted:

```
DigitalOcean Droplet:
- 1 GB RAM, 1 CPU
- 25 GB SSD
💰 $6/mes

O Railway.app:
- 500 horas/mes
- $0.000231/GB RAM/min
✅ GRATIS (con límites)
```

---

## Dashboards Recomendados

### 1. Overview General
- Total de tests ejecutados
- Tasa de éxito global
- Tendencia de performance

### 2. Performance por Paso
- Gráficos separados por cada paso del flujo
- Comparación con thresholds

### 3. Web Vitals
- LCP, FCP, CLS en gráficos separados
- Comparación con estándares de Google

### 4. Alertas
- Email si tasa de errores > 5%
- Slack si P95 excede thresholds

---

## Próximos Pasos

1. ✅ Configurar secrets en GitHub
2. ✅ Ejecutar primer test
3. ✅ Verificar datos en InfluxDB
4. ✅ Importar dashboard en Grafana
5. ✅ Configurar alertas
6. 🎯 Ejecutar tests programados

---

## Scripts de Utilidad

### Limpiar datos antiguos (InfluxDB)

```bash
# Retener solo últimos 30 días
docker exec -it k6-influxdb influx

USE k6
DELETE FROM /.*/ WHERE time < now() - 30d
```

### Exportar dashboard de Grafana

```bash
# Backup del dashboard
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://tuorg.grafana.net/api/dashboards/uid/DASHBOARD_UID \
  > dashboard-backup.json
```

### Test local antes de push

```bash
# Ejecutar con InfluxDB local
./run-browser-test.sh

# O con Docker enviando a InfluxDB
docker run --rm \
  --network host \
  -v "$PWD:/work" -w /work \
  grafana/k6:master-with-browser \
  run --out influxdb=http://localhost:8086/k6 \
  scripts/browser/holisteek_flow.browser.js
```
