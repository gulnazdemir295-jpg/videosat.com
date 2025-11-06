/**
 * Database Migration Script
 * DynamoDB tablolarını oluşturur ve günceller
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

// Table definitions
const tables = [
  {
    TableName: process.env.DYNAMODB_TABLE_USERS || 'basvideo-users',
    KeySchema: [
      { AttributeName: 'email', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    Tags: [
      { Key: 'Environment', Value: process.env.NODE_ENV || 'development' },
      { Key: 'Application', Value: 'VideoSat' }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_ROOMS || 'basvideo-rooms',
    KeySchema: [
      { AttributeName: 'roomId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'roomId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    Tags: [
      { Key: 'Environment', Value: process.env.NODE_ENV || 'development' },
      { Key: 'Application', Value: 'VideoSat' }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_CHANNELS || 'basvideo-channels',
    KeySchema: [
      { AttributeName: 'channelId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'channelId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    Tags: [
      { Key: 'Environment', Value: process.env.NODE_ENV || 'development' },
      { Key: 'Application', Value: 'VideoSat' }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_PAYMENTS || 'basvideo-payments',
    KeySchema: [
      { AttributeName: 'paymentId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'paymentId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    Tags: [
      { Key: 'Environment', Value: process.env.NODE_ENV || 'development' },
      { Key: 'Application', Value: 'VideoSat' }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_RESET_TOKENS || 'basvideo-reset-tokens',
    KeySchema: [
      { AttributeName: 'token', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'token', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    Tags: [
      { Key: 'Environment', Value: process.env.NODE_ENV || 'development' },
      { Key: 'Application', Value: 'VideoSat' }
    ]
  }
];

/**
 * Table var mı kontrol et
 */
async function tableExists(tableName) {
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

/**
 * Table oluştur
 */
async function createTable(tableDefinition) {
  const exists = await tableExists(tableDefinition.TableName);
  
  if (exists) {
    console.log(`✅ Table already exists: ${tableDefinition.TableName}`);
    return false;
  }

  try {
    await dynamoClient.send(new CreateTableCommand(tableDefinition));
    console.log(`✅ Table created: ${tableDefinition.TableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating table ${tableDefinition.TableName}:`, error.message);
    throw error;
  }
}

/**
 * Tüm migration'ları çalıştır
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found in environment variables');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  let created = 0;
  let existing = 0;

  for (const table of tables) {
    try {
      const wasCreated = await createTable(table);
      if (wasCreated) {
        created++;
      } else {
        existing++;
      }
    } catch (error) {
      console.error(`Failed to create table ${table.TableName}:`, error);
      process.exit(1);
    }
  }

  console.log(`\n✅ Migration completed!`);
  console.log(`   Created: ${created} tables`);
  console.log(`   Existing: ${existing} tables`);
}

// Script çalıştır
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n✅ All migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations, createTable, tableExists };

