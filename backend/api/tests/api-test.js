/**
 * Backend API Test Senaryoları
 * 
 * Kullanım:
 * node tests/api-test.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test helper
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}:`, error.message);
    return false;
  }
}

// Test functions
async function testHealthCheck() {
  const response = await fetch(`${BASE_URL}/api/health`);
  const data = await response.json();
  if (!data.ok) throw new Error('Health check failed');
}

async function testRoomJoin() {
  const response = await fetch(`${BASE_URL}/api/rooms/main-room/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerEmail: 'test@example.com',
      streamerName: 'Test User',
      deviceInfo: 'Test Device'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Room join failed: ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  if (!data.ok && !data.provider) {
    throw new Error('Invalid response format');
  }
}

async function testRateLimit() {
  // 101 istek gönder (limit: 100)
  const promises = [];
  for (let i = 0; i < 101; i++) {
    promises.push(fetch(`${BASE_URL}/api/health`));
  }
  
  const responses = await Promise.all(promises);
  const rateLimited = responses.some(r => r.status === 429);
  
  if (!rateLimited) {
    throw new Error('Rate limiting not working');
  }
}

async function testInputValidation() {
  // Geçersiz email ile test
  const response = await fetch(`${BASE_URL}/api/rooms/main-room/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerEmail: 'invalid-email',
      streamerName: 'Test'
    })
  });
  
  if (response.ok) {
    throw new Error('Input validation should reject invalid email');
  }
  
  const error = await response.json();
  if (!error.error || !error.details) {
    throw new Error('Validation error format incorrect');
  }
}

async function testCORS() {
  const response = await fetch(`${BASE_URL}/api/health`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://basvideo.com',
      'Access-Control-Request-Method': 'GET'
    }
  });
  
  if (!response.headers.get('access-control-allow-origin')) {
    throw new Error('CORS headers missing');
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Backend API Testleri Başlatılıyor...\n');
  console.log(`📍 Test URL: ${BASE_URL}\n`);
  
  const results = [];
  
  results.push(await test('Health Check', testHealthCheck));
  results.push(await test('Room Join', testRoomJoin));
  results.push(await test('Input Validation', testInputValidation));
  results.push(await test('CORS Headers', testCORS));
  // Rate limit test'i son test olarak çalıştır (diğer testleri etkilemesin)
  results.push(await test('Rate Limiting', testRateLimit));
  
  console.log('\n📊 Test Sonuçları:');
  console.log(`✅ Başarılı: ${results.filter(r => r).length}`);
  console.log(`❌ Başarısız: ${results.filter(r => !r).length}`);
  console.log(`📈 Başarı Oranı: ${(results.filter(r => r).length / results.length * 100).toFixed(1)}%`);
  
  process.exit(results.every(r => r) ? 0 : 1);
}

// Node.js için fetch polyfill (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTests().catch(console.error);

