# Test Dokümantasyonu

Bu klasör VideoSat Backend API için test dosyalarını içerir.

## Test Yapısı

```
tests/
├── setup.js                    # Test setup dosyası
├── helpers/                    # Test helper utilities
│   └── test-helpers.js
├── unit/                       # Unit testler
│   ├── auth-middleware.test.js
│   └── error-handler.test.js
├── integration/                # Integration testler
│   ├── auth-routes.test.js
│   ├── health.test.js
│   └── password-reset.test.js
├── api-test.js                 # API testleri (eski)
└── security-test.js            # Security testleri (eski)
```

## Test Çalıştırma

### Tüm Testler
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage ile
```bash
npm run test:coverage
```

### Sadece Unit Testler
```bash
npm run test:unit
```

### Sadece Integration Testler
```bash
npm run test:integration
```

### Sadece API Testler
```bash
npm run test:api
```

### Sadece Security Testler
```bash
npm run test:security
```

## Test Kategorileri

### Unit Tests
- Tekil fonksiyon/middleware testleri
- Mock'lar kullanılır
- Hızlı çalışır
- `tests/unit/` klasöründe

### Integration Tests
- API endpoint testleri
- Gerçek HTTP istekleri
- Database bağlantısı gerekebilir
- `tests/integration/` klasöründe

## Test Helper Functions

`tests/helpers/test-helpers.js` dosyasında yardımcı fonksiyonlar:

- `createTestUser()` - Test kullanıcısı oluştur
- `deleteTestUser()` - Test kullanıcısını sil
- `generateTestEmail()` - Random email oluştur
- `generateRandomString()` - Random string oluştur
- `createMockToken()` - Mock JWT token oluştur
- `createAuthHeaders()` - Auth header'ları oluştur
- `delay()` - Delay fonksiyonu
- `cleanupTestData()` - Test verilerini temizle

## Örnek Test

```javascript
const request = require('supertest');
const app = require('../../app');
const { createTestUser } = require('../helpers/test-helpers');

describe('My Feature', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(testUser.email);
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

## Coverage Thresholds

Minimum coverage gereksinimleri:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Notlar

- Test environment için `NODE_ENV=test` kullanılır
- Test port: 3001 (production port: 3000)
- Test timeout: 30 saniye
- Setup dosyası her test öncesi çalışır

## CI/CD Integration

Testler CI/CD pipeline'da otomatik çalışır:
- Her commit'te testler çalışır
- Coverage raporu oluşturulur
- Test başarısız olursa build durur
