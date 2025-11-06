#!/usr/bin/env node
/**
 * Production Setup Validation Script
 * 
 * Production ortamının doğru yapılandırıldığını kontrol eder.
 * 
 * Kullanım:
 *   node scripts/validate-production-setup.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Production Setup Validation Başlatılıyor...\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Environment Variables Kontrolü
console.log('📋 Environment Variables Kontrol Ediliyor...');
const requiredEnvVars = [
  'NODE_ENV',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AGORA_APP_ID',
  'AGORA_APP_CERTIFICATE'
];

const recommendedEnvVars = [
  'REDIS_HOST',
  'SENDGRID_API_KEY',
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    errors.push(`❌ Eksik zorunlu environment variable: ${varName}`);
  } else {
    success.push(`✅ ${varName} set edilmiş`);
  }
});

recommendedEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    warnings.push(`⚠️  Önerilen environment variable eksik: ${varName}`);
  } else {
    success.push(`✅ ${varName} set edilmiş`);
  }
});

// JWT Secret uzunluk kontrolü
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  warnings.push('⚠️  JWT_SECRET en az 32 karakter olmalı (güvenlik için)');
}

if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
  warnings.push('⚠️  JWT_REFRESH_SECRET en az 32 karakter olmalı (güvenlik için)');
}

// 2. Dosya Kontrolleri
console.log('\n📁 Dosya Kontrolleri Yapılıyor...');

const requiredFiles = [
  'app.js',
  'package.json',
  'middleware/error-handler.js',
  'middleware/enhanced-rate-limiting.js',
  'middleware/cache-middleware.js',
  'services/redis-service.js',
  'utils/logger.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ ${file} mevcut`);
  } else {
    errors.push(`❌ Eksik dosya: ${file}`);
  }
});

// 3. Script Kontrolleri
console.log('\n🔧 Script Kontrolleri Yapılıyor...');

const requiredScripts = [
  'scripts/backup-dynamodb.js',
  'scripts/cloudwatch-alarms.sh',
  'scripts/setup-monitoring-dashboard.sh',
  'scripts/setup-s3-lifecycle.sh',
  'scripts/setup-dynamodb-pitr.sh',
  'scripts/setup-cost-monitoring.sh'
];

requiredScripts.forEach(script => {
  const scriptPath = path.join(__dirname, '..', script);
  if (fs.existsSync(scriptPath)) {
    // Executable kontrolü
    const stats = fs.statSync(scriptPath);
    if (script.endsWith('.sh') && !(stats.mode & parseInt('111', 8))) {
      warnings.push(`⚠️  ${script} executable değil (chmod +x gerekli)`);
    }
    success.push(`✅ ${script} mevcut`);
  } else {
    errors.push(`❌ Eksik script: ${script}`);
  }
});

// 4. Documentation Kontrolleri
console.log('\n📚 Dokümantasyon Kontrolleri Yapılıyor...');

const requiredDocs = [
  'PRODUCTION_README.md',
  'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
  'DISASTER_RECOVERY_PLAN.md',
  'PRODUCTION_INDEX.md'
];

requiredDocs.forEach(doc => {
  const docPath = path.join(__dirname, '..', doc);
  if (fs.existsSync(docPath)) {
    success.push(`✅ ${doc} mevcut`);
  } else {
    warnings.push(`⚠️  Eksik dokümantasyon: ${doc}`);
  }
});

// 5. Dependencies Kontrolü
console.log('\n📦 Dependencies Kontrol Ediliyor...');

try {
  const packageJson = require(path.join(__dirname, '..', 'package.json'));
  const requiredDeps = [
    'express',
    'express-rate-limit',
    'helmet',
    'winston',
    'ioredis',
    'rate-limit-redis'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      success.push(`✅ ${dep} yüklü`);
    } else {
      warnings.push(`⚠️  Eksik dependency: ${dep}`);
    }
  });
} catch (error) {
  errors.push(`❌ package.json okunamadı: ${error.message}`);
}

// 6. NODE_ENV Kontrolü
console.log('\n🌍 Environment Kontrol Ediliyor...');

if (process.env.NODE_ENV === 'production') {
  success.push('✅ NODE_ENV=production');
} else {
  warnings.push(`⚠️  NODE_ENV=${process.env.NODE_ENV || 'development'} (production olmalı)`);
}

// Sonuçlar
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SONUÇLARI');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log(`\n✅ Başarılı (${success.length}):`);
  success.forEach(msg => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Uyarılar (${warnings.length}):`);
  warnings.forEach(msg => console.log(`   ${msg}`));
}

if (errors.length > 0) {
  console.log(`\n❌ Hatalar (${errors.length}):`);
  errors.forEach(msg => console.log(`   ${msg}`));
}

console.log('\n' + '='.repeat(60));

// Final durum
if (errors.length > 0) {
  console.log('❌ Validation BAŞARISIZ - Hatalar düzeltilmeli!');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Validation BAŞARILI (uyarılar var)');
  process.exit(0);
} else {
  console.log('✅ Validation BAŞARILI - Production\'a hazır!');
  process.exit(0);
}

