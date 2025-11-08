import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'
import { htmlReport } from 'https://cdn.jsdelivr.net/gh/benc-uk/k6-reporter@3.6.0/dist/bundle.js'

export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
    'summary.txt': textSummary(data, { indent: ' ', enableColors: false }),
  }
}
