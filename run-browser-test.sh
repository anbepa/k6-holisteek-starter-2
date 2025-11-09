#!/bin/bash

# Script para ejecutar k6 browser tests localmente
# Uso: ./run-browser-test.sh

set -e

echo "🚀 Ejecutando k6 Browser Test (Local)..."
echo ""

docker run --rm \
  -e K6_BROWSER_HEADLESS=true \
  -e K6_BROWSER_ARGS='--no-sandbox --disable-dev-shm-usage' \
  -v "$PWD:/work" -w /work \
  --cap-add=SYS_ADMIN \
  --security-opt seccomp=unconfined \
  grafana/k6:master-with-browser \
  run scripts/browser/holisteek_flow.browser.js

echo ""
echo "✅ Test completado!"
echo ""

# Verificar screenshots
if [ -d "screenshots" ] && [ "$(ls -A screenshots)" ]; then
  echo "📸 Screenshots guardados en: screenshots/"
  ls -1 screenshots/*.png 2>/dev/null || true
fi

# Verificar reporte HTML
echo ""
if [ -f "report.html" ]; then
  echo "📊 Reporte HTML generado: report.html"
  echo ""
  echo "   Para ver el reporte, ejecuta:"
  echo "   → open report.html"
  echo ""
else
  echo "⚠️  No se generó report.html"
fi

# Verificar summary JSON
if [ -f "summary.json" ]; then
  echo "📋 Datos JSON guardados en: summary.json"
fi
