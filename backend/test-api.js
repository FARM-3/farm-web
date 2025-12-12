/**
 * API Test Script
 * Tests all the implemented endpoints to ensure they're working correctly
 */

const API_BASE_URL = 'http://localhost:8000';

// Test users for authentication
const testUsers = [
  { email: 'admin@farmmanagement.com', password: 'admin123', role: 'admin' },
  { email: 'manager@farmmanagement.com', password: 'manager123', role: 'manager' },
  { email: 'worker@farmmanagement.com', password: 'worker123', role: 'worker' }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Make HTTP request
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

// Test authentication
async function testAuthentication() {
  log('\n🔐 Testing Authentication...', 'cyan');
  
  // Test login
  const loginResponse = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers[0].email,
      password: testUsers[0].password
    })
  });

  if (loginResponse.ok && loginResponse.data.success) {
    logSuccess('Login successful');
    return loginResponse.data.token;
  } else {
    logError(`Login failed: ${JSON.stringify(loginResponse.data)}`);
    return null;
  }
}

// Test health endpoint
async function testHealth() {
  log('\n🏥 Testing Health Endpoint...', 'cyan');
  
  const response = await makeRequest(`${API_BASE_URL}/api/health`);
  
  if (response.ok && response.data.status === 'OK') {
    logSuccess('Health check passed');
    return true;
  } else {
    logError(`Health check failed: ${JSON.stringify(response.data)}`);
    return false;
  }
}

// Test task endpoints
async function testTasks(token) {
  log('\n📋 Testing Task Endpoints...', 'cyan');
  
  // Test GET tasks
  const getTasksResponse = await makeRequest(`${API_BASE_URL}/api/tasks/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  
  if (getTasksResponse.ok && getTasksResponse.data.results) {
    logSuccess(`GET /api/tasks/ - Found ${getTasksResponse.data.count} tasks`);
  } else {
    logError(`GET /api/tasks/ failed: ${JSON.stringify(getTasksResponse.data)}`);
  }

  // Test POST task
  const newTask = {
    title: 'Test Task from API Test',
    description: 'This is a test task created by the API test script',
    assigned_to: 'Test User',
    priority: 'medium',
    status: 'pending',
    due_date: '2024-12-15'
  };

  const postTaskResponse = await makeRequest(`${API_BASE_URL}/api/tasks/`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}` },
    body: JSON.stringify(newTask)
  });

  if (postTaskResponse.ok) {
    logSuccess('POST /api/tasks/ - Task created successfully');
    return postTaskResponse.data.id;
  } else {
    logError(`POST /api/tasks/ failed: ${JSON.stringify(postTaskResponse.data)}`);
    return null;
  }
}

// Test exception endpoints
async function testExceptions(token) {
  log('\n🚨 Testing Exception Endpoints...', 'cyan');
  
  // Test GET exceptions
  const getExceptionsResponse = await makeRequest(`${API_BASE_URL}/api/exceptions/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  
  if (getExceptionsResponse.ok && getExceptionsResponse.data.results) {
    logSuccess(`GET /api/exceptions/ - Found ${getExceptionsResponse.data.count} exceptions`);
  } else {
    logError(`GET /api/exceptions/ failed: ${JSON.stringify(getExceptionsResponse.data)}`);
  }

  // Test POST exception
  const newException = {
    title: 'Test Exception from API Test',
    description: 'This is a test exception created by the API test script',
    severity: 'low',
    status: 'open',
    weather_conditions: ['sunny'],
    reported_by: 'Test Reporter',
    location: 'Test Location'
  };

  const postExceptionResponse = await makeRequest(`${API_BASE_URL}/api/exceptions/`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}` },
    body: JSON.stringify(newException)
  });

  if (postExceptionResponse.ok) {
    logSuccess('POST /api/exceptions/ - Exception created successfully');
    return postExceptionResponse.data.id;
  } else {
    logError(`POST /api/exceptions/ failed: ${JSON.stringify(postExceptionResponse.data)}`);
    return null;
  }
}

// Test farm blocks endpoints
async function testFarmBlocks(token) {
  log('\n🌾 Testing Farm Blocks Endpoints...', 'cyan');
  
  // Test GET farm blocks
  const getBlocksResponse = await makeRequest(`${API_BASE_URL}/api/farm-blocks/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  
  if (getBlocksResponse.ok && getBlocksResponse.data.results) {
    logSuccess(`GET /api/farm-blocks/ - Found ${getBlocksResponse.data.count} farm blocks`);
  } else {
    logError(`GET /api/farm-blocks/ failed: ${JSON.stringify(getBlocksResponse.data)}`);
  }
}

// Test SOP templates endpoints
async function testSOPTemplates(token) {
  log('\n📝 Testing SOP Templates Endpoints...', 'cyan');
  
  // Test GET SOP templates
  const getTemplatesResponse = await makeRequest(`${API_BASE_URL}/api/sop-templates/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  
  if (getTemplatesResponse.ok && getTemplatesResponse.data.results) {
    logSuccess(`GET /api/sop-templates/ - Found ${getTemplatesResponse.data.count} SOP templates`);
  } else {
    logError(`GET /api/sop-templates/ failed: ${JSON.stringify(getTemplatesResponse.data)}`);
  }
}

// Test user info endpoint
async function testUserInfo(token) {
  log('\n👤 Testing User Info Endpoint...', 'cyan');
  
  const response = await makeRequest(`${API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  
  if (response.ok && response.data.email) {
    logSuccess(`GET /api/auth/me - User: ${response.data.name} (${response.data.role})`);
  } else {
    logError(`GET /api/auth/me failed: ${JSON.stringify(response.data)}`);
  }
}

// Main test function
async function runTests() {
  log('🚀 Starting Farm Management API Tests', 'bright');
  log('========================================', 'bright');

  // Check if server is running
  const isServerRunning = await testHealth();
  if (!isServerRunning) {
    logError('Server is not running. Please start the backend server first.');
    logInfo('Run: npm run dev (in backend directory)');
    return;
  }

  // Test authentication
  const token = await testAuthentication();
  if (!token) {
    logError('Authentication failed. Cannot proceed with other tests.');
    return;
  }

  // Test user info
  await testUserInfo(token);

  // Test all endpoints
  await testTasks(token);
  await testExceptions(token);
  await testFarmBlocks(token);
  await testSOPTemplates(token);

  log('\n🎉 API Testing Complete!', 'bright');
  log('========================================', 'bright');
  logSuccess('All tests completed. Check the results above.');
  logInfo('If you see any ❌ errors, please check the backend server logs.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };