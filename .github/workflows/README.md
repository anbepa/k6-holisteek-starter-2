# GitHub Actions - k6 Browser Tests

## 🚀 Cómo ejecutar

### Opción 1: Ejecución Manual
1. Ve a la pestaña **Actions** en GitHub
2. Selecciona el workflow **"k6 load + browser"**
3. Haz clic en **"Run workflow"**
4. Configura los parámetros:
   - `BASE_URL`: URL del sitio (por defecto: `https://www.holisteek.com`)
   - `CITY_QUERY`: Ciudad a buscar (por defecto: `London`)
   - `run_browser`: `true` para ejecutar tests de browser, `false` para solo HTTP
5. Haz clic en **"Run workflow"**

### Opción 2: Ejecución Programada (Cron)
Descomenta las líneas de `schedule` en `k6-ci.yml` para ejecutar automáticamente:

```yaml
schedule:
  - cron: "0 12 * * 1-5"   # 12:00 UTC (mañana) - Lun-Vie
  - cron: "0 20 * * 1-5"   # 20:00 UTC (tarde) - Lun-Vie
  - cron: "0 2 * * 2-6"    # 02:00 UTC (noche) - Mar-Sáb
```

## 📊 Ver Resultados

1. Una vez que termine la ejecución, ve a la página del workflow
2. En la sección **Artifacts**, descarga:
   - `k6-http-report` - Reporte de pruebas HTTP
   - `k6-browser-report` - Reporte de pruebas de navegador
3. Abre `report.html` en tu navegador

## 🔧 Configuración

El workflow ejecuta dos jobs en paralelo:

### Job 1: k6-http
- Pruebas de carga HTTP/API
- Mide tiempos de respuesta de endpoints
- Configuración:
  - VUs: 20 usuarios virtuales
  - Duración: 1 minuto

### Job 2: k6-browser
- Pruebas de navegador real (Chromium)
- Mide experiencia de usuario completa
- Ejecuta:
  - Carga de página home
  - Flujo de búsqueda
  - Validación de resultados
- Solo se ejecuta si `run_browser=true`

## 📝 Notas Importantes

- **Imagen de Docker**: `grafana/k6:master-with-browser` (incluye Chromium)
- **Script actualizado**: Usa `k6/browser` en lugar de `k6/experimental/browser`
- **Permisos**: El job de browser necesita `--cap-add=SYS_ADMIN` para ejecutar Chromium
- **Artefactos**: Los reportes se guardan automáticamente y están disponibles por 90 días

## 🐛 Troubleshooting

### El workflow falla con "browser executable not found"
- Asegúrate de usar la imagen `grafana/k6:master-with-browser`
- Verifica que `--cap-add=SYS_ADMIN` esté configurado

### Los selectores no encuentran elementos
- El sitio puede haber cambiado su estructura
- Revisa y actualiza los selectores en `scripts/browser/holisteek_flow.browser.js`
- Ejecuta localmente con `headless: false` para depurar

### Los thresholds fallan
- Ajusta los valores en `options.thresholds` del script
- Los valores actuales:
  - `ui_home_load_ms`: p(95) < 2000ms
  - `ui_search_flow_ms`: p(95) < 3000ms
  - `ui_results_load_ms`: p(95) < 4000ms
  - `ui_errors`: rate < 2%
