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

async function runTests() {
  console.log("--- PHASE 4: AUTHENTICATION TESTING ---");
  console.log("Testing Customer Login...");
  try {
    const loginRes = await request('/api/v1/auth/login', 'POST', {
      email: 'customer@abc.com',
      password: 'Customer@123'
    });
    
    if (loginRes.status === 200) {
      console.log("✅ Customer Login SUCCESS!");
      console.log("Token received:", loginRes.data.token ? "Yes" : "No");
    } else {
      console.log(`❌ Customer Login FAILED! Status: ${loginRes.status}`);
      console.log(loginRes.data);
    }
  } catch (error) {
    console.log("Network error:", error.message);
  }
}

runTests();
