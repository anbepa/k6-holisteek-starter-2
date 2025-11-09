#!/bin/bash

# run-http-test.sh
# Script para ejecutar pruebas de carga HTTP con k6 (solo local, no para CI/CD)

echo "======================================"
echo "  k6 HTTP Load Test - Holisteek Flow"
echo "======================================"
echo ""

# Limpiar reportes anteriores
echo "🧹 Limpiando reportes anteriores..."
rm -f report-http.html summary-http.json

# Dar permisos de escritura al directorio actual
chmod 777 .

# Ejecutar prueba HTTP con k6 usando Docker
echo ""
echo "🚀 Ejecutando prueba de carga HTTP..."
echo "   - Flujo: Home → Autocompletar ciudad → Buscar lugares"
echo "   - Ciudades: London, New York, Paris, Tokyo, Barcelona"
echo "   - Perfil: Carga gradual hasta 100 VUs con pico de estrés"
echo ""

# Determinar qué script ejecutar (por defecto: load test)
TEST_SCRIPT="${1:-scripts/http/home_search_city.http.js}"

docker run --rm \
  -v "$PWD:/work" \
  -w /work \
  grafana/k6:master-with-browser \
  run "$TEST_SCRIPT"

# Verificar si se generó el reporte
if [ -f "report-http.html" ]; then
  echo ""
  echo "✅ Prueba completada!"
  echo ""
  echo "📊 Reportes generados:"
  echo "   - report-http.html    (reporte visual)"
  echo "   - summary-http.json   (datos JSON)"
  echo ""
  echo "Para ver el reporte HTML, ejecuta:"
  echo "   open report-http.html"
else
  echo ""
  echo "⚠️  No se generó el reporte HTML"
  echo "Revisa los errores arriba"
  exit 1
fi
