#!/usr/bin/env node

/**
 * HTML dosyalarını .min.js dosyalarını kullanacak şekilde günceller
 */

const fs = require('fs');
const path = require('path');

// Güncellenecek HTML dosyaları
const htmlFiles = [
    'index.html',
    'live-stream.html',
    'agora-frontend-example.html',
    'test-live-stream.html',
    'emergency-live-stream.html'
];

// JavaScript dosya eşleştirmeleri
const jsFileMappings = {
    'live-stream.js': 'live-stream.min.js',
    'live-stream-clean.js': 'live-stream.min.js',
    'app.js': 'app.min.js',
    'script-loader.js': 'script-loader.min.js',
    'services/notification-service.js': 'services/notification-service.min.js',
    'services/aws-ivs-service.js': 'services/aws-ivs-service.min.js',
    'services/real-email-service.js': 'services/real-email-service.min.js',
    'services/ceo-admin-service.js': 'services/ceo-admin-service.min.js',
    'services/follow-service.js': 'services/follow-service.min.js',
    'services/order-service.js': 'services/order-service.min.js',
    'services/stock-service.js': 'services/stock-service.min.js',
    'services/cart-service.js': 'services/cart-service.min.js',
    'services/file-upload-service.js': 'services/file-upload-service.min.js',
    'services/auth-service.js': 'services/auth-service.min.js',
    'services/email-service.js': 'services/email-service.min.js',
    'services/websocket-service.js': 'services/websocket-service.min.js',
    'services/payment-service.js': 'services/payment-service.min.js',
    'services/real-payment-service.js': 'services/real-payment-service.min.js',
    'services/real-cargo-service.js': 'services/real-cargo-service.min.js',
    'modules/module-loader.js': 'modules/module-loader.min.js',
    'modules/module-manager.js': 'modules/module-manager.min.js',
    'modules/livestream/livestream-module.js': 'modules/livestream/livestream-module.min.js',
    'modules/payment/payment-module.js': 'modules/payment/payment-module.min.js',
    'modules/order/order-module.js': 'modules/order/order-module.min.js',
    'modules/product/product-module.js': 'modules/product/product-module.min.js',
    'modules/pos/pos-module.js': 'modules/pos/pos-module.min.js',
    'login-logger.js': 'login-logger.min.js',
    'cookie-consent.js': 'cookie-consent.min.js'
};

function updateHtmlFile(htmlPath) {
    try {
        const fullPath = path.join(__dirname, htmlPath);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Dosya bulunamadı: ${htmlPath}`);
            return false;
        }
        
        let content = fs.readFileSync(fullPath, 'utf8');
        let updated = false;
        
        // Her JavaScript dosyası için güncelleme yap
        for (const [original, minified] of Object.entries(jsFileMappings)) {
            // .js dosyasının .min.js versiyonu var mı kontrol et
            const minPath = path.join(__dirname, minified);
            if (!fs.existsSync(minPath)) {
                continue; // .min.js dosyası yoksa atla
            }
            
            // Regex patterns
            const patterns = [
                // <script src="original.js"></script>
                new RegExp(`<script[^>]*src=["']${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*></script>`, 'gi'),
                // <script src="original.js?v=123"></script>
                new RegExp(`<script[^>]*src=["']${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\?[^"']*)?["'][^>]*></script>`, 'gi'),
                // script-loader.js içindeki referanslar
                new RegExp(`['"]${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
            ];
            
            patterns.forEach(pattern => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, (match) => {
                        return match.replace(original, minified);
                    });
                    updated = true;
                }
            });
        }
        
        if (updated) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ ${htmlPath} güncellendi`);
            return true;
        } else {
            console.log(`ℹ️  ${htmlPath} - güncelleme gerekmedi`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Hata (${htmlPath}):`, error.message);
        return false;
    }
}

// Ana fonksiyon
function main() {
    console.log('📝 HTML dosyaları güncelleniyor...\n');
    
    let successCount = 0;
    
    htmlFiles.forEach(file => {
        if (updateHtmlFile(file)) {
            successCount++;
        }
    });
    
    console.log(`\n📊 Özet: ${successCount} dosya güncellendi`);
    console.log(`\n💡 HTML dosyaları artık .min.js dosyalarını kullanıyor.`);
}

if (require.main === module) {
    main();
}

module.exports = { updateHtmlFile };

