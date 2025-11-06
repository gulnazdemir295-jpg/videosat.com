/**
 * Jest Test Setup
 * Her test öncesi çalışacak setup dosyası
 */

// Environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Test için farklı port

// Mock console methods (optional - test output'u temizlemek için)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test timeout
jest.setTimeout(30000);

// Test sonrası cleanup
afterAll(async () => {
  // Cleanup işlemleri buraya eklenebilir
  // Örneğin: test database'i temizleme, connection'ları kapatma
});

