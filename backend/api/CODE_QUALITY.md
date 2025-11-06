# 📋 Code Quality Guide

Bu doküman VideoSat backend projesi için kod kalitesi standartlarını açıklar.

## 🛠️ Araçlar

### ESLint
Kod kalitesi ve stil kontrolü için kullanılır.

**Kurulum**:
```bash
npm install --save-dev eslint
```

**Kullanım**:
```bash
# Lint kontrolü
npm run lint

# Otomatik düzeltme
npm run lint:fix
```

**Yapılandırma**: `.eslintrc.js`

### Prettier
Kod formatlama için kullanılır.

**Kurulum**:
```bash
npm install --save-dev prettier
```

**Kullanım**:
```bash
# Formatlama
npm run format

# Format kontrolü
npm run format:check
```

**Yapılandırma**: `.prettierrc.js`

### Husky
Git hooks için kullanılır.

**Kurulum**:
```bash
npm install --save-dev husky
npx husky install
```

**Pre-commit hook**: `.husky/pre-commit`

### Lint-staged
Sadece değişen dosyaları lint/format eder.

**Kurulum**:
```bash
npm install --save-dev lint-staged
```

**Yapılandırma**: `.lintstagedrc.js`

---

## 📝 Kod Standartları

### Naming Conventions

- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Files**: `kebab-case.js` veya `camelCase.js`

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing commas**: None
- **Max line length**: 100 characters

### Best Practices

1. **Error Handling**: Her zaman try-catch kullan
2. **Async/Await**: Promise.then yerine async/await kullan
3. **Constants**: Magic numbers/strings yerine constants kullan
4. **Comments**: Karmaşık logic için açıklayıcı yorumlar ekle
5. **Functions**: Tek bir sorumluluğu olmalı (Single Responsibility)

---

## 🔍 Code Review Checklist

- [ ] ESLint hataları yok
- [ ] Prettier formatlaması yapılmış
- [ ] Testler yazılmış ve geçiyor
- [ ] Error handling eklenmiş
- [ ] Logging eklenmiş
- [ ] Security kontrolü yapılmış
- [ ] Performance düşünülmüş
- [ ] Dokümantasyon güncellenmiş

---

## 🚀 Pre-commit Hook

Her commit öncesi otomatik olarak:
1. ESLint kontrolü yapılır
2. Prettier formatlaması yapılır
3. Sadece değişen dosyalar kontrol edilir

**Atlamak için** (önerilmez):
```bash
git commit --no-verify
```

---

## 📊 Quality Scripts

```bash
# Tüm kalite kontrolleri
npm run quality

# Sadece lint
npm run lint

# Sadece format
npm run format

# Test + lint + format
npm run quality
```

---

## 🔧 IDE Entegrasyonu

### VS Code

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Extensions
- ESLint
- Prettier
- EditorConfig

---

## 📝 Örnekler

### ✅ İyi Kod
```javascript
const MAX_RETRIES = 3;

async function fetchUserData(userId) {
  try {
    const user = await userService.getUser(userId);
    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }
    return user;
  } catch (error) {
    logger.error('User fetch error', error);
    throw error;
  }
}
```

### ❌ Kötü Kod
```javascript
function get(u) {
  return users.find(x => x.id == u);
}
```

---

**Son Güncelleme**: 2024

