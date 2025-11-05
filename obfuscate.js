#!/usr/bin/env node

/**
 * JavaScript Obfuscation Script
 * Tüm frontend JavaScript dosyalarını obfuscate eder
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Obfuscation ayarları
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // Production'da true yapılabilir
    debugProtectionInterval: 0,
    disableConsoleOutput: false, // console.log'ları koru
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: [], // Türkçe karakter desteği için base64 encoding'i kapat
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

// Obfuscate edilecek dosyalar (frontend)
const frontendFiles = [
    'live-stream.js',
    'app.js',
    'services/notification-service.js',
    'services/aws-ivs-service.js',
    'services/real-email-service.js',
    'services/ceo-admin-service.js',
    'services/follow-service.js',
    'services/order-service.js',
    'services/stock-service.js',
    'services/cart-service.js',
    'services/file-upload-service.js',
    'services/auth-service.js',
    'services/email-service.js',
    'services/websocket-service.js',
    'services/payment-service.js',
    'services/real-payment-service.js',
    'services/real-cargo-service.js',
    'modules/module-loader.js',
    'modules/module-manager.js',
    'modules/livestream/livestream-module.js',
    'modules/payment/payment-module.js',
    'modules/order/order-module.js',
    'modules/product/product-module.js',
    'modules/pos/pos-module.js',
    'script-loader.js',
    'login-logger.js',
    'cookie-consent.js'
];

// Backend dosyaları (opsiyonel - genelde obfuscate edilmez)
const backendFiles = [
    'backend/api/app.js',
    'backend/api/services/agora-service.js'
];

// Obfuscate et
function obfuscateFile(filePath, outputPath = null) {
    try {
        const fullPath = path.join(__dirname, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Dosya bulunamadı: ${filePath}`);
            return false;
        }
        
        const code = fs.readFileSync(fullPath, 'utf8');
        
        // Boş dosyaları atla
        if (!code.trim()) {
            console.warn(`⚠️  Boş dosya atlandı: ${filePath}`);
            return false;
        }
        
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
        const obfuscatedCode = obfuscationResult.getObfuscatedCode();
        
        // Output path belirtilmemişse, .min.js uzantısı ekle
        if (!outputPath) {
            const ext = path.extname(filePath);
            const base = path.basename(filePath, ext);
            const dir = path.dirname(filePath);
            outputPath = path.join(dir, `${base}.min${ext}`);
        }
        
        const outputFullPath = path.join(__dirname, outputPath);
        const outputDir = path.dirname(outputFullPath);
        
        // Output dizinini oluştur
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Obfuscated kodu kaydet
        fs.writeFileSync(outputFullPath, obfuscatedCode, 'utf8');
        
        const originalSize = (code.length / 1024).toFixed(2);
        const obfuscatedSize = (obfuscatedCode.length / 1024).toFixed(2);
        
        console.log(`✅ ${filePath}`);
        console.log(`   📦 ${originalSize} KB → ${obfuscatedSize} KB`);
        console.log(`   📄 ${outputPath}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Hata (${filePath}):`, error.message);
        return false;
    }
}

// Ana fonksiyon
function main() {
    console.log('🔒 JavaScript Obfuscation Başlatılıyor...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    // Frontend dosyaları obfuscate et
    console.log('📦 Frontend dosyaları obfuscate ediliyor...\n');
    frontendFiles.forEach(file => {
        if (obfuscateFile(file)) {
            successCount++;
        } else {
            failCount++;
        }
    });
    
    // Backend dosyaları (opsiyonel - yorum satırına alındı)
    // console.log('\n📦 Backend dosyaları obfuscate ediliyor...\n');
    // backendFiles.forEach(file => {
    //     if (obfuscateFile(file)) {
    //         successCount++;
    //     } else {
    //         failCount++;
    //     }
    // });
    
    console.log('\n📊 Özet:');
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Başarısız: ${failCount}`);
    console.log(`\n💡 Obfuscated dosyalar .min.js uzantısıyla kaydedildi.`);
    console.log(`💡 HTML dosyalarında .min.js dosyalarını kullanın.`);
}

// Çalıştır
if (require.main === module) {
    main();
}

module.exports = { obfuscateFile, obfuscationOptions };

