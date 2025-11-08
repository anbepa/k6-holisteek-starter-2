# 📊 Guía de Visualización y Reportes

## Opciones para Ver los Resultados de k6

### 1️⃣ **Reporte HTML** (Ya Configurado) ⭐ **RECOMENDADO**

**Qué es:** Un reporte HTML interactivo y visual que se genera automáticamente después de cada test.

**Cómo verlo:**
```bash
./run-browser-test.sh
open report.html
```

**Ventajas:**
- ✅ No requiere instalación extra
- ✅ Fácil de compartir (solo un archivo HTML)
- ✅ Gráficos y métricas visuales
- ✅ Se puede ver offline
- ✅ Perfecto para reportes a stakeholders

**Archivos generados:**
- `report.html` - Reporte visual completo
- `summary.json` - Datos en formato JSON
- `screenshots/*.png` - Capturas de pantalla del test

---

### 2️⃣ **Grafana + InfluxDB** (Para Monitoreo Continuo)

**Qué es:** Stack profesional para dashboards en tiempo real y análisis histórico.

**Cuándo usarlo:**
- Tests de carga continuos
- Comparación de resultados en el tiempo
- Monitoreo de performance en CI/CD
- Dashboards compartidos con el equipo

**Setup con Docker Compose:**

```yaml
# docker-compose-monitoring.yml
version: '3.8'

services:
  influxdb:
    image: influxdb:1.8
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_DB=k6
    volumes:
      - influxdb-data:/var/lib/influxdb

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana-dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - influxdb

volumes:
  influxdb-data:
  grafana-data:
```

**Comandos:**
```bash
# 1. Iniciar Grafana + InfluxDB
docker-compose -f docker-compose-monitoring.yml up -d

# 2. Ejecutar test enviando datos a InfluxDB
docker run --rm \
  -e K6_BROWSER_HEADLESS=true \
  -e K6_BROWSER_ARGS='--no-sandbox --disable-dev-shm-usage' \
  -v "$PWD:/work" -w /work \
  --network host \
  --cap-add=SYS_ADMIN \
  --security-opt seccomp=unconfined \
  grafana/k6:master-with-browser \
  run --out influxdb=http://localhost:8086/k6 \
  scripts/browser/holisteek_flow.browser.js

# 3. Abrir Grafana
open http://localhost:3000
```

**Dashboard recomendado:**
- Importar dashboard ID: **2587** (k6 Load Testing Results)

---

### 3️⃣ **k6 Cloud** (SaaS - Más Simple)

**Qué es:** Plataforma cloud de Grafana para k6, con dashboards automáticos.

**Ventajas:**
- ✅ Sin configuración de infraestructura
- ✅ Dashboards profesionales automáticos
- ✅ Comparación de tests
- ✅ Alertas y notificaciones

**Cómo usarlo:**
```bash
# 1. Crear cuenta en https://app.k6.io/

# 2. Obtener token
export K6_CLOUD_TOKEN=your_token_here

# 3. Ejecutar test
k6 cloud scripts/browser/holisteek_flow.browser.js
```

**Precio:** 
- Free tier: 50 VU horas/mes
- Pro: Desde $49/mes

---

### 4️⃣ **CSV Export** (Para Excel/Análisis)

**Agregar al script:**

```javascript
export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
    'summary.json': JSON.stringify(data, null, 2),
    'summary.csv': generateCSV(data), // Agregar esta línea
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function generateCSV(data) {
  const metrics = data.metrics;
  let csv = 'Metric,Avg,Min,Max,P90,P95\n';
  
  Object.keys(metrics).forEach(key => {
    const m = metrics[key];
    if (m.values) {
      csv += `${key},${m.values.avg || ''},${m.values.min || ''},${m.values.max || ''},${m.values['p(90)'] || ''},${m.values['p(95)'] || ''}\n`;
    }
  });
  
  return csv;
}
```

---

### 5️⃣ **Prometheus + Grafana** (Para DevOps)

**Mejor para:**
- Integración con ecosistema Prometheus existente
- Alertas avanzadas
- Métricas de múltiples fuentes

**Setup:**
```bash
# 1. Ejecutar test con output Prometheus
k6 run --out experimental-prometheus-rw \
  scripts/browser/holisteek_flow.browser.js

# 2. Configurar Prometheus para scraping
# prometheus.yml
scrape_configs:
  - job_name: 'k6'
    static_configs:
      - targets: ['localhost:5656']
```

---

## 🎯 Recomendaciones por Caso de Uso

### ✅ **Para reportes rápidos a stakeholders**
→ **HTML Report** (ya configurado)

### ✅ **Para análisis de tendencias en el tiempo**
→ **Grafana + InfluxDB**

### ✅ **Para tests en CI/CD**
→ **k6 Cloud** o **Grafana Cloud**

### ✅ **Para integración con herramientas de análisis**
→ **CSV Export** + Excel/Google Sheets

### ✅ **Para monitoreo 24/7**
→ **Prometheus + Grafana**

---

## 📈 Métricas Importantes a Monitorear

### Browser Metrics
- `browser_web_vital_lcp` - Largest Contentful Paint
- `browser_web_vital_fid` - First Input Delay
- `browser_web_vital_cls` - Cumulative Layout Shift
- `browser_http_req_duration` - Duración de requests

### Custom Metrics
- `ui_home_load_ms` - Tiempo de carga del home
- `ui_search_flow_ms` - Tiempo del flujo de búsqueda
- `ui_results_load_ms` - Tiempo de carga de resultados
- `ui_errors` - Tasa de errores

---

## 🚀 Quick Start Actual

**Con HTML Report (ya funciona):**
```bash
./run-browser-test.sh
open report.html
```

**Si quieres Grafana:**
```bash
# Crear docker-compose-monitoring.yml (ver arriba)
docker-compose -f docker-compose-monitoring.yml up -d
# Modificar run-browser-test.sh para enviar datos a InfluxDB
```

---

## 📁 Estructura de Archivos de Reportes

```
k6-holisteek-starter/
├── report.html          # Reporte HTML visual ⭐
├── summary.json         # Datos JSON completos
├── screenshots/         # Screenshots del test
│   ├── 01-home.png
│   ├── 02-location-clicked.png
│   ├── 03-lond-typed.png
│   ├── 04-london-selected.png
│   ├── 05-results.png
│   └── 06-final.png
└── logs/               # (opcional) Logs detallados
```
