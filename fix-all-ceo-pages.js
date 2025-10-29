#!/usr/bin/env node
/**
 * CEO Sayfaları Toplu Düzeltme Scripti
 * Bu script tüm CEO sayfalarındaki ortak sorunları tespit eder ve düzeltir
 */

const fs = require('fs');
const path = require('path');

const CEO_PAGES = [
    'human-resources.html',
    'customer-service.html',
    'marketing-advertising.html',
    'rd-software.html',
    'security.html',
    'reports.html',
    'system-settings.html'
];

const COMMON_FIXES = {
    // Navigation link fixes
    navigationLinks: {
        'admin.html#hr': 'human-resources.html',
        'admin.html#customer-service': 'customer-service.html',
        'admin.html#marketing': 'marketing-advertising.html',
        'admin.html#rd': 'rd-software.html',
        'admin.html#security': 'security.html',
        'admin.html#payments': 'central-payment-system.html',
        'admin.html#operations': 'operations.html',
        'admin.html#finance': 'finance-accounting.html'
    },
    
    // Missing Chart.js
    addChartJS: '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>',
    
    // Missing modal close listeners
    modalListeners: 'setupModalCloseListeners',
    
    // Missing modal styles
    modalStyles: '../styles.css'
};

console.log('🔍 CEO Sayfaları Kontrol ve Düzeltme Başlatılıyor...\n');

CEO_PAGES.forEach(page => {
    const filePath = path.join(__dirname, 'panels', page);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${page} bulunamadı`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // Check and fix navigation links
    Object.entries(COMMON_FIXES.navigationLinks).forEach(([old, newLink]) => {
        if (content.includes(old)) {
            content = content.replace(new RegExp(old, 'g'), newLink);
            fixed = true;
            console.log(`✅ ${page}: Navigation link düzeltildi (${old} → ${newLink})`);
        }
    });
    
    // Check and add Chart.js
    if (content.includes('canvas') && !content.includes('chart.js')) {
        const scriptsMatch = content.match(/<script[^>]*>/);
        if (scriptsMatch) {
            const scriptsIndex = content.indexOf('<script src="../app.js">');
            if (scriptsIndex !== -1) {
                content = content.slice(0, scriptsIndex) + 
                    COMMON_FIXES.addChartJS + '\n    ' +
                    content.slice(scriptsIndex);
                fixed = true;
                console.log(`✅ ${page}: Chart.js eklendi`);
            }
        }
    }
    
    if (fixed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`💾 ${page} kaydedildi\n`);
    } else {
        console.log(`✓ ${page} zaten güncel\n`);
    }
});

console.log('✨ Tüm düzeltmeler tamamlandı!');


