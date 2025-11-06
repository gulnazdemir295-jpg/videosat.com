/**
 * Seed Data Script
 * Test ve development için örnek veri oluşturur
 */

const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
  })
);

const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS || 'basvideo-users';

// Seed users
const seedUsers = [
  {
    email: 'admin@basvideo.com',
    password: 'admin123',
    companyName: 'VideoSat Admin',
    role: 'admin',
    phone: '+90 212 555 0001',
    address: 'İstanbul, Türkiye',
    hasTime: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    email: 'hammaddeci@test.com',
    password: 'test123',
    companyName: 'Test Hammaddeci A.Ş.',
    role: 'hammaddeci',
    phone: '+90 212 555 0002',
    address: 'Ankara, Türkiye',
    hasTime: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    email: 'uretici@test.com',
    password: 'test123',
    companyName: 'Test Üretici Ltd.',
    role: 'uretici',
    phone: '+90 212 555 0003',
    address: 'İzmir, Türkiye',
    hasTime: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    email: 'toptanci@test.com',
    password: 'test123',
    companyName: 'Test Toptancı A.Ş.',
    role: 'toptanci',
    phone: '+90 212 555 0004',
    address: 'Bursa, Türkiye',
    hasTime: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    email: 'satici@test.com',
    password: 'test123',
    companyName: 'Test Satıcı Mağazası',
    role: 'satici',
    phone: '+90 212 555 0005',
    address: 'Antalya, Türkiye',
    hasTime: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    email: 'musteri@test.com',
    password: 'test123',
    companyName: 'Test Müşteri',
    role: 'musteri',
    phone: '+90 212 555 0006',
    address: 'İstanbul, Türkiye',
    hasTime: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * User oluştur
 */
async function createUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const user = {
    email: userData.email,
    password: hashedPassword,
    companyName: userData.companyName,
    role: userData.role,
    phone: userData.phone || '',
    address: userData.address || '',
    hasTime: userData.hasTime || false,
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: userData.updatedAt || new Date().toISOString()
  };

  try {
    await dynamoClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: user
    }));
    console.log(`✅ User created: ${user.email} (${user.role})`);
    return user;
  } catch (error) {
    console.error(`❌ Error creating user ${user.email}:`, error.message);
    throw error;
  }
}

/**
 * Seed data oluştur
 */
async function seedData() {
  console.log('🌱 Starting seed data creation...\n');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found in environment variables');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  let created = 0;
  let errors = 0;

  for (const userData of seedUsers) {
    try {
      await createUser(userData);
      created++;
    } catch (error) {
      errors++;
      // Continue with other users
    }
  }

  console.log(`\n✅ Seed data creation completed!`);
  console.log(`   Created: ${created} users`);
  if (errors > 0) {
    console.log(`   Errors: ${errors} users`);
  }
  console.log('\n📝 Test credentials:');
  console.log('   Email: test@test.com (any from above)');
  console.log('   Password: test123');
}

// Script çalıştır
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('\n✅ Seed data created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seed data creation failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData, createUser };

