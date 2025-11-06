/**
 * Environment Variables Validator
 * Uygulama başlarken gerekli environment değişkenlerini kontrol eder
 */

const requiredEnvVars = {
  // Production'da zorunlu
  production: [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ],
  // Development'da opsiyonel ama uyarı verir
  development: []
};

const recommendedEnvVars = [
  'AGORA_APP_ID',
  'AGORA_APP_CERTIFICATE',
  'SENDGRID_API_KEY',
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY'
];

/**
 * Environment değişkenlerini validate eder
 */
function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const missing = [];
  const warnings = [];

  // Zorunlu değişkenleri kontrol et
  if (env === 'production') {
    requiredEnvVars.production.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
  }

  // Önerilen değişkenleri kontrol et
  recommendedEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // Eksik değişkenler varsa hata fırlat
  if (missing.length > 0) {
    console.error('❌ Eksik zorunlu environment değişkenleri:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    throw new Error(`Eksik environment değişkenleri: ${missing.join(', ')}`);
  }

  // Uyarılar
  if (warnings.length > 0) {
    console.warn('⚠️  Önerilen environment değişkenleri eksik:');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('   Bu özellikler çalışmayabilir.');
  }

  // JWT secret uzunluk kontrolü
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET en az 32 karakter olmalıdır (güvenlik için)');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    console.warn('⚠️  JWT_REFRESH_SECRET en az 32 karakter olmalıdır (güvenlik için)');
  }

  console.log('✅ Environment değişkenleri doğrulandı');
}

/**
 * Environment değişkenlerini loglar (hassas bilgileri gizler)
 */
function logEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  console.log('📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${env}`);
  console.log(`   PORT: ${process.env.PORT || '3000'}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   USE_DYNAMODB: ${process.env.USE_DYNAMODB !== 'false'}`);
  console.log(`   STREAM_PROVIDER: ${process.env.STREAM_PROVIDER || 'AGORA'}`);
  
  // Hassas bilgileri gösterme
  const hasAwsCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  console.log(`   AWS Credentials: ${hasAwsCreds ? '✅ Configured' : '❌ Not configured'}`);
  
  const hasJwtSecrets = !!(process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET);
  console.log(`   JWT Secrets: ${hasJwtSecrets ? '✅ Configured' : '❌ Not configured'}`);
}

module.exports = {
  validateEnvironment,
  logEnvironment
};

