import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// --- Configuración del Test ---
const CONFIG = {
  baseUrl: 'https://holisteek.com/',
  searchCity: 'Lond',
  expectedCityOption: 'United Kingdom England, London',
  expectedResult: 'Cinnamon Leaf Food Hall',
  timeouts: {
    navigation: 60000,    // 60 segundos para navegación
    suggestions: 2000,    // 2 segundos para sugerencias
    results: 20000,       // 20 segundos para resultados
  }
};

// --- Métricas Personalizadas ---
export const carga_pagina_home = new Trend('carga_pagina_home_ms', true);
export const tiempo_seleccion_ciudad = new Trend('tiempo_seleccion_ciudad_ms', true);
export const tiempo_carga_resultados = new Trend('tiempo_carga_resultados_ms', true);
export const tiempo_total_flujo = new Trend('tiempo_total_flujo_ms', true);
export const tasa_errores = new Rate('tasa_errores');

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    // Carga de página principal
    carga_pagina_home_ms: ['p(95)<20000'],           // 95% debe cargar en <20s
    
    // Flujo de búsqueda (escribir ciudad + seleccionar)
    tiempo_seleccion_ciudad_ms: ['p(95)<5000'],      // Selección de ciudad <5s
    
    // Carga de resultados de búsqueda
    tiempo_carga_resultados_ms: ['p(95)<20000'],     // Resultados <20s
    
    // Tiempo total del flujo completo
    tiempo_total_flujo_ms: ['p(95)<45000'],          // Flujo completo <45s
    
    // Tasa de errores
    tasa_errores: ['rate<0.05'],                     // Menos de 5% de errores
    
    // Checks de validación
    checks: ['rate>0.95'],                           // 95% de validaciones exitosas
  },
  summaryTrendStats: ['avg', 'p(90)', 'p(95)', 'max'],
};

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Inicio del flujo completo
  const inicioFlujoCompleto = Date.now();

  try {
    // ---- 1. CARGA DE PÁGINA HOME ----
    console.log('🏠 Paso 1: Cargando página principal...');
    const inicioCargaHome = Date.now();
    await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.timeouts.navigation 
    });
    const tiempoCargaHome = Date.now() - inicioCargaHome;
    carga_pagina_home.add(tiempoCargaHome);
    
    // await page.screenshot({ path: 'screenshots/01-home.png' });
    console.log(`✅ Página cargada en ${tiempoCargaHome}ms`);
    
    // Validación: Verificar que el título contiene "Holisteek"
    const title = await page.title();
    const tituloValido = check(title, {
      '✓ Título de página contiene "Holisteek"': (t) => t.includes('Holisteek'),
    });
    if (!tituloValido) tasa_errores.add(1);

    // ---- 2. SELECCIÓN DE CIUDAD ----
    console.log('\n🔍 Paso 2: Iniciando búsqueda por ubicación...');
    const inicioSeleccionCiudad = Date.now();
    
    // Hacer clic en el campo de ubicación
    await page.getByRole('combobox', { name: 'City or leave empty for nearby' }).click();
    // await page.screenshot({ path: 'screenshots/02-location-clicked.png' });
    
    // Escribir "Lond" en el campo de ubicación
    await page.getByRole('combobox', { name: 'City or leave empty for nearby' }).fill(CONFIG.searchCity);
    // await page.screenshot({ path: 'screenshots/03-lond-typed.png' });
    console.log(`⌨️  Texto escrito: "${CONFIG.searchCity}"`);
    
    // Esperar a que aparezcan las sugerencias
    await page.waitForTimeout(CONFIG.timeouts.suggestions);
    
    // Seleccionar la ciudad "London, England, United Kingdom"
    await page.getByRole('option', { name: CONFIG.expectedCityOption }).click();
    const tiempoSeleccionCiudad = Date.now() - inicioSeleccionCiudad;
    tiempo_seleccion_ciudad.add(tiempoSeleccionCiudad);
    
    // await page.screenshot({ path: 'screenshots/04-london-selected.png' });
    console.log(`✅ Ciudad seleccionada en ${tiempoSeleccionCiudad}ms: "${CONFIG.expectedCityOption}"`);

    // ---- 3. EJECUTAR BÚSQUEDA ----
    console.log('\n🔎 Paso 3: Ejecutando búsqueda...');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    console.log('✅ Botón "Search" presionado');
    
    // ---- 4. CARGA DE RESULTADOS ----
    console.log('\n📊 Paso 4: Esperando resultados...');
    const inicioCargaResultados = Date.now();
    
    // Esperar a que aparezca el resultado esperado
    await page.getByText(CONFIG.expectedResult).first().waitFor({ timeout: CONFIG.timeouts.results });
    const tiempoCargaResultados = Date.now() - inicioCargaResultados;
    tiempo_carga_resultados.add(tiempoCargaResultados);
    
    // await page.screenshot({ path: 'screenshots/05-results.png' });
    console.log(`✅ Resultados cargados en ${tiempoCargaResultados}ms`);
    
    // ---- 5. VALIDACIONES FINALES ----
    console.log('\n✔️  Paso 5: Validando resultados...');
    
    // Validación 1: Verificar que el resultado esperado está presente
    const resultadoEsperadoVisible = await page.getByText(CONFIG.expectedResult).first().isVisible();
    const validacionResultado = check(resultadoEsperadoVisible, {
      [`✓ "${CONFIG.expectedResult}" aparece en resultados`]: (visible) => visible === true,
    });
    if (!validacionResultado) tasa_errores.add(1);
    
    // Validación 2: Verificar que la URL contiene la ubicación
    const currentUrl = page.url();
    const validacionUrl = check(currentUrl, {
      '✓ URL contiene parámetro de ubicación "London"': (url) => url.includes('location=London'),
    });
    if (!validacionUrl) tasa_errores.add(1);
    
    // await page.screenshot({ path: 'screenshots/06-final.png' });
    
    // ---- RESUMEN FINAL ----
    const tiempoTotalFlujo = Date.now() - inicioFlujoCompleto;
    tiempo_total_flujo.add(tiempoTotalFlujo);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FLUJO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`⏱️  Tiempo total: ${tiempoTotalFlujo}ms (${(tiempoTotalFlujo/1000).toFixed(2)}s)`);
    console.log(`📍 URL final: ${currentUrl}`);
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    tasa_errores.add(1);
    // await page.screenshot({ path: 'screenshots/99-error.png' }).catch(() => {});
    console.log('\n' + '⚠️ '.repeat(30));
    console.log('❌ ERROR EN LA EJECUCIÓN DEL TEST');
    console.log('⚠️ '.repeat(30));
    console.log(`💥 Error: ${err.message}`);
    console.log('⚠️ '.repeat(30) + '\n');
    throw err;
  } finally {
    await page.close();
    await context.close();
  }

  sleep(1);
}

export function handleSummary(data) {
  console.log('📝 Generando reportes...');
  
  return {
    'report.html': htmlReport(data),
    'summary.json': JSON.stringify(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}
