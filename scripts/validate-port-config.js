#!/usr/bin/env node

/**
 * Port Yapılandırması Validasyon Scripti
 * Tüm dosyalarda port tutarlılığını kontrol eder
 */

const fs = require('fs');
const path = require('path');

// Merkezi default port
const DEFAULT_BACKEND_PORT = 3000;
const INVALID_PORTS = [4000]; // Kullanılmaması gereken portlar

// Kontrol edilecek dosyalar
const filesToCheck = [
  'backend/api/app.js',
  'live-stream.js',
  'services/api-base-url.js',
  'start-backend.sh',
  'package.json'
];

// Kontrol edilecek pattern'ler
const portPatterns = [
  /PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+)/g,
  /localhost:(\d+)/g,
  /:(\d+)\/api/g,
  /PORT\${PORT:-(\d+)}/g,
  /DEFAULT.*PORT.*=.*(\d+)/gi
];

const issues = [];

function checkFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  portPatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const port = parseInt(match[1] || match[0].match(/\d+/)?.[0], 10);
      
      if (port && port !== DEFAULT_BACKEND_PORT) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        issues.push({
          file: filePath,
          line: lineNumber,
          port: port,
          match: match[0],
          severity: INVALID_PORTS.includes(port) ? 'ERROR' : 'WARNING'
        });
      }
    }
  });
  
  // Hardcoded 4000 port kontrolü
  if (content.includes('4000') && !content.includes('INVALID_PORTS') && !content.includes('validate-port')) {
    const linesWith4000 = lines
      .map((line, index) => ({ line: line.trim(), index: index + 1 }))
      .filter(item => item.line.includes('4000'));
    
    linesWith4000.forEach(item => {
      issues.push({
        file: filePath,
        line: item.index,
        port: 4000,
        match: item.line,
        severity: 'ERROR'
      });
    });
  }
}

// Tüm dosyaları kontrol et
filesToCheck.forEach(checkFile);

// Sonuçları göster
console.log('🔍 Port Yapılandırması Validasyon Raporu\n');
console.log(`📌 Beklenen Port: ${DEFAULT_BACKEND_PORT}\n`);

if (issues.length === 0) {
  console.log('✅ Tüm port yapılandırmaları tutarlı!');
  process.exit(0);
} else {
  console.log(`❌ ${issues.length} sorun tespit edildi:\n`);
  
  const errors = issues.filter(i => i.severity === 'ERROR');
  const warnings = issues.filter(i => i.severity === 'WARNING');
  
  if (errors.length > 0) {
    console.log('🚨 KRİTİK HATALAR:');
    errors.forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - Port ${issue.port}`);
      console.log(`   → ${issue.match.substring(0, 60)}...`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  UYARILAR:');
    warnings.forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - Port ${issue.port}`);
      console.log(`   → ${issue.match.substring(0, 60)}...`);
    });
  }
  
  console.log('\n💡 Çözüm: Tüm port referanslarını 3000 olarak güncelleyin');
  console.log('   veya merkezi config dosyasını kullanın (config/backend-config.js)\n');
  
  process.exit(errors.length > 0 ? 1 : 0);
}

