import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 500 },  // Ramp up to 500 users
    { duration: '30s', target: 1000 }, // Spike to 1000 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  // Test Healthcheck
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
