# 📊 Cómo Ver Resultados en Grafana

## ✅ Configuración Actual

Tu workflow de GitHub Actions **YA está enviando datos a InfluxDB** automáticamente con cada ejecución.

### Credenciales configuradas:
- ✅ `INFLUXDB_URL` - URL de tu InfluxDB
- ✅ `INFLUXDB_ORG` - Organización
- ✅ `INFLUXDB_BUCKET` - Bucket donde se guardan los datos
- ✅ `INFLUXDB_TOKEN` - Token de autenticación

---

## 🎯 Pasos para Ver en Grafana

### 1️⃣ Acceder a Grafana

**Si usas Grafana Cloud:**
```
https://tu-organizacion.grafana.net
```

**Si es local (Docker):**
```bash
# Iniciar servicios
docker-compose -f docker-compose-monitoring.yml up -d

# Acceder a Grafana
http://localhost:3000
# Usuario: admin
# Password: admin
```

---

### 2️⃣ Conectar InfluxDB como Data Source

1. En Grafana, ve a: **⚙️ Configuration → Data Sources**
2. Click en **"Add data source"**
3. Selecciona **"InfluxDB"**
4. Configura:

```yaml
Name: InfluxDB-K6
Query Language: Flux  # ← IMPORTANTE si usas InfluxDB 2.x

URL: https://us-east-1-1.aws.cloud2.influxdata.com  # Tu INFLUXDB_URL
Auth: 
  ✓ Basic auth (desactivado)
  ✓ With Credentials (desactivado)

InfluxDB Details:
  Organization: [tu INFLUXDB_ORG]
  Token: [tu INFLUXDB_TOKEN]
  Default Bucket: [tu INFLUXDB_BUCKET]
```

5. Click en **"Save & Test"** → Debe aparecer "✅ Data source is working"

---

### 3️⃣ Importar Dashboard de k6

1. Ve a: **➕ Create → Import**
2. Usa uno de estos dashboards:

#### Opción A: Dashboard oficial de k6
```
Dashboard ID: 2587
```
Pega el ID y click "Load"

#### Opción B: Dashboard k6 Browser (más completo)
```
Dashboard ID: 18030
```

#### Opción C: Dashboard personalizado
```
Dashboard ID: 10660
```

3. Selecciona tu data source **"InfluxDB-K6"**
4. Click en **"Import"**

---

### 4️⃣ Explorar tus Métricas

Después de ejecutar un test desde GitHub Actions, verás estas métricas en Grafana:

#### 📈 Métricas Personalizadas (las que creaste):
- `carga_pagina_home_ms` - Tiempo de carga página principal
- `tiempo_seleccion_ciudad_ms` - Tiempo selección de ciudad
- `tiempo_carga_resultados_ms` - Tiempo de carga de resultados
- `tiempo_total_flujo_ms` - Tiempo total del flujo
- `tasa_errores` - Tasa de errores

#### 🌐 Core Web Vitals:
- `browser_web_vital_lcp` - Largest Contentful Paint
- `browser_web_vital_fcp` - First Contentful Paint
- `browser_web_vital_cls` - Cumulative Layout Shift
- `browser_web_vital_fid` - First Input Delay
- `browser_web_vital_inp` - Interaction to Next Paint
- `browser_web_vital_ttfb` - Time to First Byte

#### 🔍 Métricas de Browser:
- `browser_http_req_duration` - Duración de requests
- `browser_http_req_failed` - Requests fallidos
- `browser_data_sent` - Datos enviados
- `browser_data_received` - Datos recibidos

#### ✅ Validaciones:
- `checks` - Resultado de validaciones (pass/fail)

---

## 🔧 Query de Ejemplo en Grafana

Para crear un panel personalizado, usa queries Flux como esta:

```flux
from(bucket: "k6")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "tiempo_total_flujo_ms")
  |> filter(fn: (r) => r["_field"] == "value")
  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
  |> yield(name: "mean")
```

O para InfluxQL (InfluxDB 1.x):

```sql
SELECT mean("value") 
FROM "tiempo_total_flujo_ms" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

---

## 🎨 Personalizar Dashboard

### Crear un Panel Nuevo:

1. Click en **"Add panel"** en tu dashboard
2. Selecciona tu data source **"InfluxDB-K6"**
3. Escribe tu query (ver ejemplos arriba)
4. Personaliza:
   - **Visualization:** Graph, Stat, Gauge, Table, etc.
   - **Title:** Nombre descriptivo
   - **Unit:** milliseconds (ms), seconds (s), percent (0-100)
   - **Thresholds:** Valores que disparan colores (verde, amarillo, rojo)

### Ejemplo: Panel de Tiempo Total

```
Panel Type: Stat
Query: SELECT mean("value") FROM "tiempo_total_flujo_ms"
Unit: milliseconds (ms)
Thresholds:
  - Green: < 30000 (30s)
  - Yellow: 30000 - 45000
  - Red: > 45000
```

---

## 📅 Ver Histórico de Tests

En Grafana puedes:

1. **Seleccionar rango de tiempo** (arriba a la derecha)
   - Last 5 minutes
   - Last 24 hours
   - Last 7 days
   - Custom range

2. **Comparar ejecuciones**
   - Ver tendencias a lo largo del tiempo
   - Identificar degradación de performance
   - Detectar mejoras después de cambios

3. **Filtrar por tags** (si los agregas en k6)

---

## 🚨 Alertas en Grafana

Puedes configurar alertas para ser notificado cuando:

1. Ve a tu panel → Edit → Alert
2. Configura condiciones:
   ```
   WHEN avg() OF query(tiempo_total_flujo_ms, 5m)
   IS ABOVE 45000
   ```
3. Agrega canal de notificación:
   - Email
   - Slack
   - Discord
   - Webhook

---

## 🔍 Verificar que Llegaron los Datos

### En InfluxDB Cloud UI:

1. Ve a **Data Explorer**
2. Selecciona tu bucket: `k6`
3. Selecciona measurement: `tiempo_total_flujo_ms`
4. Click **Submit** → Deberías ver datos

### En Grafana (Query Inspector):

1. Abre cualquier panel
2. Panel menu → Inspect → Data
3. Verás los datos crudos que llegaron

---

## ❓ Troubleshooting

### No veo datos en Grafana:

1. ✅ Verifica que el workflow de GitHub Actions se ejecutó exitosamente
2. ✅ Revisa los logs del step "Run k6 Browser Test" - debe decir:
   ```
   output: InfluxDB (https://...)
   ```
3. ✅ Verifica conexión del data source en Grafana (Save & Test)
4. ✅ Asegúrate de estar viendo el rango de tiempo correcto (últimos 15 min)
5. ✅ Verifica en InfluxDB que hay datos en el bucket

### Error de conexión:

```bash
# Verificar que INFLUXDB_URL es accesible
curl -I https://tu-influxdb-url.com

# Debe retornar: HTTP/2 200 o 204
```

---

## 🎯 Dashboard Recomendado

Crea un dashboard con estos paneles:

### Fila 1: Overview
- **Total Tests** (Stat) - Contador de ejecuciones
- **Success Rate** (Gauge) - % de checks pasados
- **Error Rate** (Stat) - % de errores

### Fila 2: Tiempos (Time Series Graph)
- **Carga Página Home** 
- **Selección Ciudad**
- **Carga Resultados**
- **Flujo Completo**

### Fila 3: Core Web Vitals (Bar Gauge)
- **LCP** (threshold: <2.5s)
- **FCP** (threshold: <1.8s)
- **CLS** (threshold: <0.1)
- **FID** (threshold: <100ms)

### Fila 4: Browser Performance
- **HTTP Request Duration** (Heatmap)
- **Failed Requests** (Graph)
- **Data Transferred** (Graph)

---

## 📚 Recursos Adicionales

- [k6 + InfluxDB docs](https://grafana.com/docs/k6/latest/results-output/real-time/influxdb/)
- [Grafana Dashboards para k6](https://grafana.com/grafana/dashboards/?search=k6)
- [Flux Query Language](https://docs.influxdata.com/influxdb/v2/query-data/flux/)
- [Crear alertas en Grafana](https://grafana.com/docs/grafana/latest/alerting/)

---

## ✅ Resumen

Ahora cada vez que ejecutes el workflow de GitHub Actions:

1. ✅ k6 ejecuta el test browser
2. ✅ Los datos se envían **automáticamente** a InfluxDB
3. ✅ Puedes verlos **en tiempo real** en Grafana
4. ✅ Se mantiene **histórico** para análisis de tendencias
5. ✅ **NO se genera** reporte HTML (todo está en Grafana)

**🎉 ¡Listo para visualizar tus tests en Grafana!**
