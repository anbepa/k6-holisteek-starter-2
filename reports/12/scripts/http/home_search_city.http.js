import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'
import { SharedArray } from 'k6/data'
import { handleSummary } from '../summary.js' // ignored by k6, but kept for IDE hints

// Métricas personalizadas
export const t_search = new Trend('http_search_time')
export const r_errors = new Rate('http_errors')

export const options = {
  vus: Number(__ENV.VU || 20),
  duration: __ENV.DURATION || '1m',
  thresholds: {
    http_req_duration: ['p(95)<1500'],   // 95% < 1.5s
    http_errors: ['rate<0.01'],          // < 1% error
  },
  summaryTrendStats: ['avg','p(90)','p(95)','max'],
}

const BASE_URL = __ENV.BASE_URL || 'https://www.holisteek.com'
const CITY = __ENV.CITY_QUERY || 'London'

export default function () {
  // Home (GET)
  const resHome = http.get(BASE_URL, { redirects: 3 })
  check(resHome, { 'home status 200': (r) => r.status === 200 }) || r_errors.add(1)

  // Buscar ciudad (ejemplo: endpoint típico)
  // TODO: Ajusta la ruta según la app real (por ejemplo /api/search?q=London)
  const start = Date.now()
  const resSearch = http.get(`${BASE_URL}/api/search?city=${encodeURIComponent(CITY)}`)
  const elapsed = Date.now() - start
  t_search.add(elapsed)

  check(resSearch, {
    'search status 200': (r) => r.status === 200,
    'search body not empty': (r) => (r.body || '').length > 0,
  }) || r_errors.add(1)

  sleep(1)
}
