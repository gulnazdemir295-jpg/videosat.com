#!/usr/bin/env node
/**
 * DynamoDB Backup Script
 * 
 * Bu script DynamoDB tablolarını yedekler.
 * Production'da düzenli olarak çalıştırılmalıdır (cron job).
 * 
 * Kullanım:
 *   node scripts/backup-dynamodb.js
 *   node scripts/backup-dynamodb.js --table users
 *   node scripts/backup-dynamodb.js --all
 */

require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const TABLES = {
  users: process.env.DYNAMODB_TABLE_USERS || 'basvideo-users',
  rooms: process.env.DYNAMODB_TABLE_ROOMS || 'basvideo-rooms',
  channels: process.env.DYNAMODB_TABLE_CHANNELS || 'basvideo-channels',
  payments: process.env.DYNAMODB_TABLE_PAYMENTS || 'basvideo-payments'
};

// AWS Credentials
let dynamoClient;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  const ddbClient = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  dynamoClient = DynamoDBDocumentClient.from(ddbClient);
} else {
  // IAM Role kullanılıyorsa
  const ddbClient = new DynamoDBClient({ region: AWS_REGION });
  dynamoClient = DynamoDBDocumentClient.from(ddbClient);
}

/**
 * Backup dizinini oluştur
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Backup dizini oluşturuldu: ${BACKUP_DIR}`);
  }
}

/**
 * Tabloyu yedekle
 */
async function backupTable(tableName, tableKey) {
  try {
    console.log(`📦 ${tableName} tablosu yedekleniyor...`);
    
    const items = [];
    let lastEvaluatedKey = null;
    
    // Tüm item'ları scan et
    do {
      const params = {
        TableName: tableKey
      };
      
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const command = new ScanCommand(params);
      const result = await dynamoClient.send(command);
      
      if (result.Items) {
        items.push(...result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    // Backup dosyası oluştur
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `${tableName}-${timestamp}.json`);
    
    const backupData = {
      tableName: tableKey,
      backupDate: new Date().toISOString(),
      itemCount: items.length,
      items: items
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ ${tableName} yedeklendi: ${items.length} item, ${backupFile}`);
    
    return {
      success: true,
      tableName,
      itemCount: items.length,
      backupFile
    };
  } catch (error) {
    console.error(`❌ ${tableName} yedekleme hatası:`, error.message);
    return {
      success: false,
      tableName,
      error: error.message
    };
  }
}

/**
 * Eski backup'ları temizle (30 günden eski)
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;
      
      if (fileAge > thirtyDays) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️  Eski backup silindi: ${file}`);
      }
    });
    
    if (deletedCount > 0) {
      console.log(`✅ ${deletedCount} eski backup temizlendi`);
    }
  } catch (error) {
    console.warn('⚠️  Backup temizleme hatası:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 DynamoDB Backup Başlatılıyor...');
  console.log(`📁 Backup dizini: ${BACKUP_DIR}`);
  console.log(`🌍 AWS Region: ${AWS_REGION}`);
  console.log('');
  
  ensureBackupDir();
  
  const args = process.argv.slice(2);
  const tableArg = args.find(arg => arg.startsWith('--table='));
  const allArg = args.includes('--all');
  
  let tablesToBackup = [];
  
  if (tableArg) {
    const tableName = tableArg.split('=')[1];
    if (TABLES[tableName]) {
      tablesToBackup = [{ name: tableName, key: TABLES[tableName] }];
    } else {
      console.error(`❌ Geçersiz tablo adı: ${tableName}`);
      process.exit(1);
    }
  } else if (allArg) {
    tablesToBackup = Object.entries(TABLES).map(([name, key]) => ({ name, key }));
  } else {
    // Default: tüm tabloları yedekle
    tablesToBackup = Object.entries(TABLES).map(([name, key]) => ({ name, key }));
  }
  
  const results = [];
  
  for (const table of tablesToBackup) {
    const result = await backupTable(table.name, table.key);
    results.push(result);
  }
  
  // Eski backup'ları temizle
  cleanupOldBackups();
  
  // Özet
  console.log('');
  console.log('📊 Backup Özeti:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Başarılı: ${successful.length}`);
  console.log(`❌ Başarısız: ${failed.length}`);
  
  if (successful.length > 0) {
    const totalItems = successful.reduce((sum, r) => sum + r.itemCount, 0);
    console.log(`📦 Toplam item: ${totalItems}`);
  }
  
  if (failed.length > 0) {
    console.error('❌ Hatalar:');
    failed.forEach(r => {
      console.error(`   - ${r.tableName}: ${r.error}`);
    });
    process.exit(1);
  }
  
  console.log('✅ Backup tamamlandı!');
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Backup hatası:', error);
    process.exit(1);
  });
}

module.exports = { backupTable, cleanupOldBackups };

