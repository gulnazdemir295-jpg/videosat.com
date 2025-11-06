/**
 * Test Helper Utilities
 * Testler için yardımcı fonksiyonlar
 */

const bcrypt = require('bcryptjs');
const userService = require('../../services/user-service');

/**
 * Test kullanıcısı oluştur
 */
async function createTestUser(overrides = {}) {
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    password: 'test123456',
    companyName: 'Test Company',
    role: 'musteri',
    phone: '',
    address: '',
    hasTime: false
  };

  const userData = { ...defaultUser, ...overrides };
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  await userService.saveUser({
    ...userData,
    password: hashedPassword
  });

  return {
    ...userData,
    password: userData.password // Return plain password for testing
  };
}

/**
 * Test kullanıcısını sil
 */
async function deleteTestUser(email) {
  // In-memory storage için
  // DynamoDB için deleteUser fonksiyonu eklenebilir
  try {
    const user = await userService.getUser(email);
    if (user) {
      // Delete logic here if needed
      // For now, we'll just return
      return true;
    }
  } catch (error) {
    console.error('Delete test user error:', error);
  }
  return false;
}

/**
 * Random email oluştur
 */
function generateTestEmail() {
  return `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Random string oluştur
 */
function generateRandomString(length = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Test için JWT token oluştur (mock)
 */
function createMockToken(payload = {}) {
  const defaultPayload = {
    userId: 'test@example.com',
    email: 'test@example.com',
    role: 'musteri',
    companyName: 'Test Company'
  };

  return `mock.token.${Buffer.from(JSON.stringify({ ...defaultPayload, ...payload })).toString('base64')}`;
}

/**
 * Test için request headers oluştur
 */
function createAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Test için delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test verilerini temizle
 */
async function cleanupTestData() {
  // Cleanup logic here
  // For example: delete test users, clear test data, etc.
}

module.exports = {
  createTestUser,
  deleteTestUser,
  generateTestEmail,
  generateRandomString,
  createMockToken,
  createAuthHeaders,
  delay,
  cleanupTestData
};

