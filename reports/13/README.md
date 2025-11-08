# k6 + k6-browser (Playwright engine) — Starter for Holisteek

Este proyecto trae **dos tipos de pruebas**:
1) **HTTP (API/Requests)** con `k6` tradicional — ideal para medir tiempo de respuesta de endpoints y throughput.
2) **Navegador real** con `k6-browser` (motor estilo Playwright) — ideal para medir UX percibida (teclear en buscadores, navegación, etc.).

Incluye:
- Scripts base listos para editar.
- Reporte HTML automático vía `handleSummary`.
- Workflow de **GitHub Actions** que ejecuta ambas suites y sube el `report.html` como artefacto.
- Utilidad para **grabar** escenarios vía **HAR** y convertirlos a script de k6.

> **Requisitos locales** (opcional): Docker o binarios de k6 / xk6-browser.
> En CI no necesitas nada: el workflow usa contenedores oficiales.

---

## 1) Estructura

```
k6-holisteek-starter/
├─ scripts/
│  ├─ http/
│  │  └─ home_search_city.http.js
│  └─ browser/
│     └─ holisteek_flow.browser.js
├─ summary.js
├─ docker-compose.yml
├─ package.json
├─ README.md
└─ .github/workflows/k6-ci.yml
```

---

## 2) Variables de entorno comunes

- `BASE_URL` (ej: `https://www.holisteek.com`)
- `CITY_QUERY` (ej: `London`)
- `VU` (usuarios virtuales para HTTP), `DURATION` (duración), `RPS` (objetivo RPS opcional)
- `RUN_BROWSER` (`true|false`) para activar/desactivar suite del navegador en CI

> En local puedes exportarlas o crear un `.env` y pasarlas con `--env`, pero en CI ya se definen por defecto.

---

## 3) Ejecutar con Docker (local)

### 3.1 Solo HTTP
```bash
docker run --rm -i   -e BASE_URL="https://www.holisteek.com"   -e CITY_QUERY="London"   -e VU=20 -e DURATION=1m   -v "$PWD:/work" -w /work   grafana/k6:latest   run --summary-trend-stats="avg,p(90),p(95),max"   scripts/http/home_search_city.http.js
```

### 3.2 Navegador (k6-browser)
```bash
docker run --rm \
  -e K6_BROWSER_HEADLESS=true \
  -e K6_BROWSER_ARGS='--no-sandbox --disable-dev-shm-usage' \
  -v "$PWD:/work" -w /work \
  --cap-add=SYS_ADMIN \
  --security-opt seccomp=unconfined \
  grafana/k6:master-with-browser \
  run --summary-trend-stats="avg,p(90),p(95),max" \
  scripts/browser/holisteek_flow.browser.js
```

> **Nota**: Usa la imagen `grafana/k6:master-with-browser` que incluye Chromium. Los flags `--no-sandbox --disable-dev-shm-usage` son necesarios para ejecutar en Docker sin D-Bus.

### 3.3 Reporte HTML
Ambos scripts usan `handleSummary` definido en `summary.js`. Para generar `report.html`:

```bash
docker run --rm -i   -e BASE_URL="https://www.holisteek.com"   -e CITY_QUERY="London"   -v "$PWD:/work" -w /work   grafana/k6:latest   run scripts/http/home_search_city.http.js

# El reporte se guarda como report.html en el directorio raíz
```

---

## 4) Grabación del script (paso a paso)

### Opción A — **Grabando un HAR** con el navegador y convirtiendo a k6
1. Abre Chrome/Edge en modo incógnito y ejecuta la navegación real (home, buscadores, resultados).
2. Abre **DevTools → Network** y marca “Preserve log”.
3. Repite la navegación (escribe `London` en el buscador de ciudad, etc.).
4. En la pestaña Network, haz clic derecho y **Save all as HAR**.
5. Convierte el HAR a script de k6 (HTTP) con la utilidad:
   ```bash
   npx @grafana/har-to-k6 holisteek.har -o scripts/http/holisteek_from_har.http.js
   ```
6. Revisa el archivo generado y parametriza `BASE_URL`, cabeceras y datos sensibles.

> Ventaja: captura peticiones “por debajo” (XHR/fetch) para test **HTTP**.
> Si necesitas interacción de **teclado/clics** y métricas UX, usa la **Opción B**.

### Opción B — **k6-browser** (navegador real)
- Parte del script `scripts/browser/holisteek_flow.browser.js` ya emula las acciones: ir al home, escribir en buscadores, esperar sugerencias/resultados y medir tiempos con métricas `Trend`.
- Ajusta `selectors` y los pasos de acuerdo con tu DOM real (IDs/clases de los buscadores).

> **Tip**: Puedes inspeccionar tu página, copiar selectores robustos, y pegarlos en el script.  
> **Cómo sé qué pasa por debajo?** Ejecuta **ambas suites**:  
> - `HTTP`: mide las APIs subyacentes (endpoints, latencias, errores).  
> - `Browser`: valida la **experiencia completa** (render, JS, red, inputs).

---

## 5) Ejecutar en diferentes horas (mañana/tarde/noche)

- Programa el workflow de GitHub (cron) o ejecútalo manualmente 3 veces al día.
- En cada corrida, el reporte `report.html` mostrará percentiles/tiempos. Compara p(95) entre franjas para ver si empeora.

Ejemplo de cron (en `k6-ci.yml` ya hay plantilla comentada):
```
schedule:
  - cron: "0 12 * * 1-5"   # 12:00 UTC (mañana COL)
  - cron: "0 20 * * 1-5"   # 20:00 UTC (tarde COL aprox.)
  - cron: "0 2 * * 2-6"    # 02:00 UTC (noche COL aprox.)
```

---

## 6) GitHub Actions

- Subirá el **`report.html`** como artefacto de cada run.
- Puedes activar/desactivar el navegador con `RUN_BROWSER` (por defecto `true`).

---

## 7) Interpretación rápida del reporte

- **p(95)**: el 95% de las solicitudes son **más rápidas** que este valor. Úsalo para “tiempo percibido con cola alta”.
- **avg** y **max** complementan el panorama; si **max** es muy alto, hay picos intermitentes.
- Define umbrales en `options.thresholds`. Si no se cumplen, el Job falla (útil para gates de calidad).

---

## 8) Personaliza para Holisteek

- Reemplaza los **selectores** de los buscadores (home) y el **path** de la página de resultados.
- Si conoces los endpoints (ej. `/api/search?city=...`), llénalos en el script HTTP para aislar problemas de backend vs. frontend.

¡Listo! Edita los scripts y súbelo a tu repo; con el workflow tendrás reportes automáticos.
