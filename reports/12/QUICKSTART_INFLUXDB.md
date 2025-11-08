# ⚡ Quick Start: GitHub Actions + InfluxDB + Grafana

## 🎯 Setup en 5 Minutos

### 1️⃣ Crear cuenta InfluxDB Cloud (GRATIS)

```bash
1. Ve a: https://cloud2.influxdata.com/signup
2. Regístrate (gratis)
3. Crea un bucket llamado "k6"
4. Genera un API token
5. Copia: Organization, Bucket, Token
```

### 2️⃣ Configurar GitHub Secrets

En tu repo → **Settings** → **Secrets and variables** → **Actions**

Agrega estos 4 secrets:

| Secret Name | Valor Ejemplo |
|-------------|---------------|
| `INFLUXDB_URL` | `https://us-east-1-1.aws.cloud2.influxdata.com` |
| `INFLUXDB_ORG` | `tu-email@ejemplo.com` |
| `INFLUXDB_BUCKET` | `k6` |
| `INFLUXDB_TOKEN` | `tu-token-largo-aqui` |

### 3️⃣ Push tu código

```bash
git add .
git commit -m "Add k6 tests with InfluxDB integration"
git push origin main
```

### 4️⃣ Ejecutar test

Ve a **Actions** → **k6 load + browser** → **Run workflow**

### 5️⃣ Ver resultados

**En GitHub:**
- Artifacts: report.html, screenshots, summary.json

**En InfluxDB Cloud:**
- Data Explorer → bucket "k6" → Ver métricas

**En Grafana:**
1. Crear cuenta: https://grafana.com/auth/sign-up
2. Add data source → InfluxDB
3. Import dashboard ID: **2587**

---

## 📊 ¿Qué se envía a InfluxDB?

```javascript
✓ carga_pagina_home_ms        // Tiempo de carga inicial
✓ tiempo_seleccion_ciudad_ms   // Búsqueda y selección
✓ tiempo_carga_resultados_ms   // Espera de resultados
✓ tiempo_total_flujo_ms        // Flujo completo
✓ tasa_errores                 // % de errores
✓ checks                       // Validaciones exitosas
✓ browser_web_vital_lcp        // Largest Contentful Paint
✓ browser_web_vital_fcp        // First Contentful Paint
✓ browser_web_vital_cls        // Cumulative Layout Shift
```

---

## 🔍 Ver Datos en InfluxDB

```sql
-- Últimos 100 resultados
SELECT * FROM "tiempo_total_flujo_ms" LIMIT 100

-- Promedio última hora
SELECT mean("value") FROM "carga_pagina_home_ms" 
WHERE time > now() - 1h

-- Tasa de errores
SELECT mean("value") * 100 as "error_rate" 
FROM "tasa_errores" 
WHERE time > now() - 24h
```

---

## 📈 Dashboard en Grafana

### Query para panel de Tiempo Total:

```sql
SELECT mean("value") / 1000 as "segundos"
FROM "tiempo_total_flujo_ms" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

### Query para Web Vitals:

```sql
SELECT 
  mean("value") / 1000 as "LCP"
FROM "browser_web_vital_lcp" 
WHERE $timeFilter 
GROUP BY time($__interval)
```

---

## 🚨 Troubleshooting

### Error: "Can't connect to InfluxDB"

✅ Verifica que los secrets están correctamente configurados
✅ Asegúrate que el token tiene permisos de escritura
✅ Confirma que el bucket "k6" existe

### No veo datos en Grafana

✅ Espera 1-2 minutos después del test
✅ Ajusta el time range (últimas 24 horas)
✅ Verifica que el data source apunta al bucket correcto

### Test falla en GitHub Actions

✅ Revisa los logs en la pestaña Actions
✅ Verifica que los secrets no tengan espacios extra
✅ Asegúrate que INFLUXDB_URL no tiene `/` al final

---

## 📚 Documentación Completa

Para setup avanzado y self-hosted: **[GITHUB_ACTIONS_INFLUXDB_GRAFANA.md](./GITHUB_ACTIONS_INFLUXDB_GRAFANA.md)**

---

## 💡 Ejemplo de Dashboard

```
┌─────────────────────────────────────────┐
│  K6 Browser Test - Holisteek            │
├─────────────────────────────────────────┤
│                                         │
│  Tasa de Éxito:  100%  ▲               │
│  Tests Hoy:      24     →               │
│  Tiempo Prom:    24.2s  ▼               │
│                                         │
├─────────────────────────────────────────┤
│  📊 Tiempo por Paso (últimas 24h)      │
│                                         │
│  ━━━━━━━━━━ Carga Home: 4.8s           │
│  ━━━━ Selección Ciudad: 2.9s           │
│  ━━━━━━━━━━━━━━ Resultados: 15.7s      │
│                                         │
├─────────────────────────────────────────┤
│  🌐 Web Vitals                          │
│                                         │
│  LCP: 3.06s  [████████░░] 75%          │
│  FCP: 2.87s  [████████░░] 72%          │
│  CLS: 0.0    [██████████] 100%         │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [ ] InfluxDB Cloud cuenta creada
- [ ] Bucket "k6" creado
- [ ] API Token generado
- [ ] 4 GitHub Secrets configurados
- [ ] Código pusheado a GitHub
- [ ] Primer test ejecutado
- [ ] Datos visibles en InfluxDB
- [ ] Grafana Cloud cuenta creada
- [ ] Data source InfluxDB configurado
- [ ] Dashboard importado
- [ ] Alertas configuradas (opcional)

---

**¿Necesitas ayuda?** Revisa la documentación completa o abre un issue.
