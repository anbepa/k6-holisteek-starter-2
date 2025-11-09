# Pruebas HTTP de Carga y Estrés - Holisteek

## 📋 Descripción

Este directorio contiene pruebas de carga y estrés basadas en HTTP para el flujo principal de búsqueda de Holisteek. A diferencia de las pruebas de navegador que ejecutan Chromium, estas pruebas HTTP son ideales para:

- **Pruebas de carga**: Simular miles de usuarios concurrentes
- **Pruebas de estrés**: Identificar el punto de ruptura del sistema
- **Pruebas de rendimiento**: Medir tiempos de respuesta de APIs bajo carga

## 🎯 Flujo Capturado

El test replica el flujo real del usuario capturado via Chrome DevTools:

1. **Página de inicio**: `GET https://holisteek.com/`
2. **Autocompletar ciudad**: `GET /api/cities?query={ciudad}`
3. **Búsqueda de lugares**: `GET /api/places/filter/v2?city={ciudad}&country={país}&state={estado}`

## 🔧 Archivo Principal

### `home_search_city.http.js`

Script de k6 que simula el flujo completo con múltiples ciudades:

- **Ciudades configuradas**: London, New York, Paris, Tokyo, Barcelona
- **Perfil de carga**:
  - Rampa inicial: 0 → 10 VUs en 30s
  - Carga media: 10 → 20 VUs en 1m
  - Carga alta: 20 → 50 VUs en 2m
  - **Pico de estrés**: 50 → 100 VUs en 1m
  - Sostenimiento: 100 VUs durante 2m
  - Descenso: 100 → 0 VUs en 1m

### Métricas y Umbrales

```javascript
thresholds: {
  'http_req_duration': ['p(95)<2000'],  // 95% de peticiones < 2s
  'http_req_failed': ['rate<0.05'],     // Menos de 5% de errores
  'checks': ['rate>0.90'],              // 90% de validaciones exitosas
}
```

## 🚀 Uso Local

### Ejecución Rápida

```bash
./run-http-test.sh
```

Este script:
1. Limpia reportes anteriores
2. Ejecuta la prueba de carga con Docker
3. Genera `report-http.html` y `summary-http.json`
4. Muestra resumen en consola

### Ver Resultados

```bash
# Abrir reporte HTML
open report-http.html

# Ver JSON de métricas
cat summary-http.json | jq
```

## 📊 Checks Implementados

El script valida automáticamente:

### Home Page
- ✅ Status code 200
- ✅ Tiempo de carga < 3s

### Autocomplete
- ✅ Status code 200  
- ✅ Respuesta contiene resultados

### Search Results
- ✅ Status code 200
- ✅ Respuesta contiene lugares
- ✅ Tiempo de respuesta < 2s

## 🎚️ Personalización

### Ajustar Perfil de Carga

Edita `home_search_city.http.js`:

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Tu configuración
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};
```

### Agregar Más Ciudades

```javascript
const CITIES = [
  { query: 'Madrid', city: 'Madrid', country: 'Spain', state: 'Madrid' },
  // Agrega más...
];
```

### Modificar Umbrales

```javascript
thresholds: {
  'http_req_duration': ['p(95)<1500'],  // Más estricto
  'http_req_failed': ['rate<0.01'],     // Solo 1% de errores
}
```

## 📈 Interpretación de Resultados

### Métricas Clave

- **http_req_duration**: Tiempo de respuesta end-to-end
- **http_req_failed**: Tasa de errores HTTP
- **checks**: Porcentaje de validaciones exitosas
- **http_reqs**: Requests por segundo (RPS)
- **vus**: Usuarios virtuales activos

### Ejemplo de Resultados Esperados

```
✓ home_page_status_200
✓ home_page_load_time
✓ autocomplete_status_200
✓ autocomplete_has_results
✓ search_status_200
✓ search_has_places
✓ search_response_time

checks.........................: 95.23% ✓ 2857 ✗ 143
http_req_duration..............: avg=845ms  p(95)=1.8s
http_req_failed................: 2.15%  ✓ 64   ✗ 2936
http_reqs......................: 3000   50/s
```

## 🔍 Comparación: HTTP vs Browser

### Pruebas HTTP (este directorio)
- ✅ **Escalabilidad**: Miles de usuarios virtuales
- ✅ **Velocidad**: Sin overhead de navegador
- ✅ **Recursos**: Consume menos CPU/RAM
- ❌ **Realismo**: No ejecuta JavaScript del cliente
- ❌ **Assets**: No descarga CSS/imágenes

### Pruebas Browser (`../browser/`)
- ✅ **Realismo**: Simula usuario real con navegador
- ✅ **JavaScript**: Ejecuta todo el código del cliente
- ✅ **Mediciones web**: LCP, FCP, Web Vitals
- ❌ **Escalabilidad**: Limitado a ~10-20 navegadores concurrentes
- ❌ **Recursos**: Alto consumo de CPU/RAM

## 🎯 Casos de Uso

### Usar Pruebas HTTP cuando...
- Necesitas simular 100+ usuarios concurrentes
- Quieres medir rendimiento puro de APIs
- Buscas identificar límites de capacidad del backend
- Ejecutas pruebas de estrés prolongadas

### Usar Pruebas Browser cuando...
- Necesitas medir experiencia de usuario real
- Quieres validar Core Web Vitals
- Importan las interacciones JavaScript complejas
- Pruebas de regresión funcional

## ⚠️ Notas Importantes

> **SOLO EJECUCIÓN LOCAL**: Estos archivos NO deben ser commiteados al repositorio según requisitos del usuario. Son solo para pruebas locales.

### Requisitos
- Docker instalado
- Acceso a internet (para descargar imagen de k6)
- ~500MB de espacio para imagen Docker

### Consideraciones
- Las pruebas generan tráfico real contra producción
- Coordina con el equipo antes de ejecutar pruebas de estrés
- Monitorea logs del servidor durante la ejecución
- Los reportes HTML contienen métricas sensibles (no compartir públicamente)

## 🛠️ Troubleshooting

### Error: "Cannot find module"
```bash
# Verifica que estás en el directorio correcto
cd /path/to/k6-holisteek-starter
./run-http-test.sh
```

### Error: "Permission denied"
```bash
chmod +x run-http-test.sh
./run-http-test.sh
```

### Prueba no genera reportes
```bash
# Verifica permisos del directorio
chmod 777 .
./run-http-test.sh
```

### Errores de conexión (>5%)
- Verifica conectividad a internet
- Confirma que holisteek.com está disponible
- Reduce el número de VUs en el perfil de carga

## 📚 Referencias

- [Documentación de k6](https://k6.io/docs/)
- [k6 HTTP module](https://k6.io/docs/javascript-api/k6-http/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/load-testing/)

---

**Creado**: $(date)  
**Basado en**: Captura real del flujo via Chrome DevTools MCP  
**Flujo**: Home → Autocomplete (London) → Search Results (30 lugares)
