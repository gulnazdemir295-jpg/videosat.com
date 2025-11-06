/**
 * Güvenlik Test Senaryoları
 * 
 * Kullanım:
 * node tests/security-test.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testSecurityHeaders() {
  const response = await fetch(`${BASE_URL}/api/health`);
  
  // Helmet headers kontrolü
  const headers = {
    'x-content-type-options': response.headers.get('x-content-type-options'),
    'x-frame-options': response.headers.get('x-frame-options'),
    'x-xss-protection': response.headers.get('x-xss-protection'),
    'strict-transport-security': response.headers.get('strict-transport-security')
  };
  
  console.log('🔒 Güvenlik Header\'ları:');
  console.log(JSON.stringify(headers, null, 2));
  
  // Production'da HTTPS zorunlu olmalı
  if (BASE_URL.startsWith('https://')) {
    if (!headers['strict-transport-security']) {
      throw new Error('HSTS header missing in HTTPS');
    }
  }
}

async function testSQLInjection() {
  // SQL injection denemesi (DynamoDB kullanıldığı için güvenli, ama test edelim)
  const maliciousInput = "'; DROP TABLE users; --";
  
  const response = await fetch(`${BASE_URL}/api/rooms/${encodeURIComponent(maliciousInput)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerEmail: 'test@example.com'
    })
  });
  
  // DynamoDB NoSQL olduğu için SQL injection çalışmaz, ama input validation olmalı
  if (response.status === 400) {
    console.log('✅ SQL Injection koruması: Input validation çalışıyor');
  }
}

async function testXSS() {
  // XSS denemesi
  const xssPayload = '<script>alert("XSS")</script>';
  
  const response = await fetch(`${BASE_URL}/api/rooms/main-room/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamerEmail: 'test@example.com',
      streamerName: xssPayload
    })
  });
  
  // Input validation XSS'i engellemeli
  if (response.status === 400) {
    console.log('✅ XSS koruması: Input validation çalışıyor');
  }
}

async function testAdminEndpoint() {
  // Admin endpoint'e token olmadan erişim denemesi
  const response = await fetch(`${BASE_URL}/api/admin/ivs/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail: 'test@example.com',
      endpoint: 'rtmps://test.com',
      playbackUrl: 'https://test.com',
      streamKey: 'test-key'
    })
  });
  
  if (response.status !== 401) {
    throw new Error('Admin endpoint should require authentication');
  }
  
  console.log('✅ Admin endpoint koruması: Authentication gerekli');
}

async function runSecurityTests() {
  console.log('🔒 Güvenlik Testleri Başlatılıyor...\n');
  console.log(`📍 Test URL: ${BASE_URL}\n`);
  
  try {
    await testSecurityHeaders();
    await testSQLInjection();
    await testXSS();
    await testAdminEndpoint();
    
    console.log('\n✅ Tüm güvenlik testleri başarılı!');
  } catch (error) {
    console.error('\n❌ Güvenlik testi başarısız:', error.message);
    process.exit(1);
  }
}

// Node.js için fetch polyfill (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runSecurityTests().catch(console.error);

