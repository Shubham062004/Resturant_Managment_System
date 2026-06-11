const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runE2E() {
  console.log("=== ABC E2E API VALIDATION ===");
  let errors = [];

  // Helper to run and track
  async function testFlow(name, path, method, data, token) {
    console.log(`Testing: ${name} [${method} ${path}]`);
    const res = await request(path, method, data, token);
    if (res.status >= 400) {
      console.log(`❌ FAILED: ${res.status}`);
      errors.push({ name, path, status: res.status, error: res.data });
      return null;
    }
    console.log(`✅ SUCCESS: ${res.status}`);
    return res.data;
  }

  // 1. Customer Flow
  const loginRes = await testFlow('Customer Login', '/api/v1/auth/login', 'POST', {
    email: 'customer@abc.com',
    password: 'Customer@123'
  });
  
  let customerToken = loginRes?.token;

  await testFlow('Fetch Restaurants', '/api/v1/catalog/restaurants', 'GET');
  await testFlow('Fetch Categories', '/api/v1/catalog/categories', 'GET');
  
  if (customerToken) {
    await testFlow('Fetch Cart', '/api/v1/cart', 'GET', null, customerToken);
    await testFlow('Fetch Orders', '/api/v1/orders', 'GET', null, customerToken);
  }

  // 2. Admin Flow
  const adminLogin = await testFlow('Admin Login', '/api/v1/auth/login', 'POST', {
    email: 'admin@abc.com',
    password: 'Admin@123'
  });
  let adminToken = adminLogin?.token;

  if (adminToken) {
    await testFlow('Admin Dashboard', '/api/v1/admin/dashboard/metrics', 'GET', null, adminToken);
  }

  // Summary
  console.log("=== VALIDATION COMPLETE ===");
  if (errors.length > 0) {
    console.log(`Found ${errors.length} errors.`);
    console.log(JSON.stringify(errors, null, 2));
  } else {
    console.log("All APIs are stable!");
  }
}

runE2E();
