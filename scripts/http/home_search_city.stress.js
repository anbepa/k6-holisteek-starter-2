import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const CONFIG = {
  baseUrl: 'https://holisteek.com',
  apiUrl: 'https://api.holisteek.com',
  searchCity: 'Lond',
  city: 'London',
  country: 'United Kingdom',
  state: 'England'
};

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'],
    'http_req_failed': ['rate<0.10'],
    'checks': ['rate>0.85'],
    'http_req_duration{type:home}': ['p(95)<5000'],
    'http_req_duration{type:autocomplete}': ['p(95)<2000'],
    'http_req_duration{type:search}': ['p(95)<3000']
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)']
};

export default function () {
  let homeResponse = http.get(`${CONFIG.baseUrl}/`, {
    tags: { type: 'home' }
  });
  
  check(homeResponse, {
    'home_page_status_200': (r) => r.status === 200,
    'home_page_load_time': (r) => r.timings.duration < 5000,
  });
  
  sleep(1);

  let autocompleteResponse = http.get(
    `${CONFIG.baseUrl}/api/cities?query=${CONFIG.searchCity}`,
    {
      headers: {
        'Accept': 'application/json',
      },
      tags: { type: 'autocomplete' }
    }
  );
  
  check(autocompleteResponse, {
    'autocomplete_status_200': (r) => r.status === 200,
    'autocomplete_has_results': (r) => {
      try {
        const results = JSON.parse(r.body);
        return results && results.length > 0;
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);

  let searchResponse = http.get(
    `${CONFIG.apiUrl}/api/places/filter/v2?page=1&limit=30&city=${CONFIG.city}&country=${encodeURIComponent(CONFIG.country)}&state=${CONFIG.state}`,
    {
      headers: {
        'Accept': 'application/json',
      },
      tags: { type: 'search' }
    }
  );
  
  check(searchResponse, {
    'search_status_200': (r) => r.status === 200,
    'search_has_places': (r) => {
      try {
        const response = JSON.parse(r.body);
        return response && response.data && response.data.length > 0;
      } catch {
        return false;
      }
    },
    'search_response_time': (r) => r.timings.duration < 3000,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    "summary-stress.json": JSON.stringify(data),
    "report-stress.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
