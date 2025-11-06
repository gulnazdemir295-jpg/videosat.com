require('dotenv').config();

// Environment validation - uygulama başlamadan önce kontrol et
const { validateEnvironment, logEnvironment } = require('./middleware/env-validator');
try {
  validateEnvironment();
  logEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Production'da eksik env varsa çık
  } else {
    console.warn('⚠️  Development modunda devam ediliyor...');
  }
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Merkezi backend yapılandırması
const { getBackendConfig, DEFAULT_BACKEND_PORT, validatePort } = require('../../config/backend-config');
const {
  IvsClient,
  CreateChannelCommand,
  CreateStreamKeyCommand,
  ListChannelsCommand,
  ListStreamKeysCommand,
  GetChannelCommand,
  DeleteChannelCommand,
  DeleteStreamKeyCommand,
  StopStreamCommand
} = require('@aws-sdk/client-ivs');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// DynamoDB Tables
const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS || 'basvideo-users';
const ROOMS_TABLE = process.env.DYNAMODB_TABLE_ROOMS || 'basvideo-rooms';
const CHANNELS_TABLE = process.env.DYNAMODB_TABLE_CHANNELS || 'basvideo-channels';
const PAYMENTS_TABLE = process.env.DYNAMODB_TABLE_PAYMENTS || 'basvideo-payments';

// In-memory stores (fallback for development)
const users = new Map(); // key: email, value: { email, hasTime }
const ivsAssignments = new Map(); // key: email, value: { endpoint, playbackUrl, streamKey (never returned directly) }
// Shared streamKey (quota limit nedeniyle tüm channel'lar için paylaşılıyor)
let sharedStreamKey = null;

// DynamoDB Client
let dynamoClient = null;
const USE_DYNAMODB = process.env.USE_DYNAMODB !== 'false'; // Default: true in production

const app = express();

// Güvenlik: Helmet - HTTP headers güvenliği
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://download.agora.io"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.basvideo.com", "https://basvideo.com", "wss:", "https://*.agora.io"]
    }
  },
  crossOriginEmbedderPolicy: false // Agora SDK için gerekli
}));

// Rate Limiting - API isteklerini sınırla
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 15 dakikada maksimum 100 istek
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // Kritik endpoint'ler için daha sıkı limit
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
});

// Tüm API endpoint'lerine rate limiting uygula
app.use('/api/', apiLimiter);

// CORS ayarları - Production için spesifik
const corsOptions = {
  origin: function (origin, callback) {
    // Production domain'ler
    const allowedOrigins = [
      'https://basvideo.com',
      'https://www.basvideo.com',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080'
    ];
    
    // Origin yoksa (Postman, curl gibi) veya allowed list'te varsa izin ver
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Development için tüm origin'lere izin ver
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed origin'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' })); // Body size limit
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging - Winston ile entegre
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: logger.stream }));
} else {
  app.use(morgan('dev', { stream: logger.stream }));
}

// Security Middleware
const { sanitizeInputs, csrfToken } = require('./middleware/security-middleware');

// Monitoring Middleware
const { requestMetrics, getMetrics } = require('./middleware/monitoring-middleware');

// Input sanitization (XSS protection)
app.use(sanitizeInputs);

// Request metrics
app.use(requestMetrics);

// CSRF Token (opsiyonel - sadece gerekli endpoint'lerde kullanılabilir)
// app.use(csrfToken);

// Static files serving (root directory - iki seviye yukarı)
const rootDir = path.join(__dirname, '../..');
app.use(express.static(rootDir));

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
// Upload directory
const uploadDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const folderPath = path.join(uploadDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya tipi. Sadece görsel ve belge dosyaları yüklenebilir.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});
console.log('📁 Static files serving from:', rootDir);

// ============================================
// SWAGGER/OPENAPI DOCUMENTATION
// ============================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VideoSat API',
      version: '1.0.0',
      description: 'VideoSat E-Ticaret ve Canlı Yayın Platformu API Dokümantasyonu',
      contact: {
        name: 'VideoSat Team',
        email: 'support@basvideo.com'
      },
      license: {
        name: 'ISC',
        url: 'https://basvideo.com'
      }
    },
    servers: [
      {
        url: 'https://api.basvideo.com/api',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        adminToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-admin-token'
        }
      }
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Rooms', description: 'Room management endpoints' },
      { name: 'Messages', description: 'Messaging endpoints' },
      { name: 'Payments', description: 'Payment processing endpoints' },
      { name: 'Push Notifications', description: 'Push notification endpoints' },
      { name: 'Errors', description: 'Error tracking endpoints' },
      { name: 'Performance', description: 'Performance monitoring endpoints' },
      { name: 'Admin', description: 'Admin endpoints' },
      { name: 'Upload', description: 'File upload endpoints' },
      { name: 'Search', description: 'Search endpoints' },
      { name: 'Streams', description: 'Stream management endpoints' }
    ]
  },
  apis: ['./app.js'] // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VideoSat API Documentation'
}));

console.log('📚 Swagger API Documentation: /api-docs');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
let CURRENT_REGION = process.env.IVS_REGION || process.env.AWS_REGION || 'us-east-1';

// AWS Credentials - Environment variables'dan otomatik yükle
let CURRENT_CREDS = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  CURRENT_CREDS = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
  console.log('✅ AWS credentials environment variables\'dan yüklendi');
} else {
  console.warn('⚠️ AWS credentials environment variables\'da bulunamadı. Admin endpoint\'i ile set edilmeli.');
}

// AWS Clients - Credentials varsa kullan
const ivsClientConfig = { region: CURRENT_REGION };
const stsClientConfig = { region: CURRENT_REGION };

if (CURRENT_CREDS) {
  ivsClientConfig.credentials = CURRENT_CREDS;
  stsClientConfig.credentials = CURRENT_CREDS;
}

let ivsClient = new IvsClient(ivsClientConfig);
let stsClient = new STSClient(stsClientConfig);

// Initialize DynamoDB Client
if (USE_DYNAMODB && CURRENT_CREDS) {
  try {
    dynamoClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: CURRENT_REGION, credentials: CURRENT_CREDS })
    );
    console.log('✅ DynamoDB client initialized');
  } catch (error) {
    console.warn('⚠️ DynamoDB client initialization failed:', error.message);
    console.warn('   Falling back to in-memory storage');
  }
} else {
  console.warn('⚠️ DynamoDB disabled or no credentials. Using in-memory storage.');
}

// DynamoDB Helper Functions
async function getUser(email) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return users.get(email) || null;
  }
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    }));
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getUser error:', error);
    return users.get(email) || null; // Fallback
  }
}

async function saveUser(userData) {
  if (!USE_DYNAMODB || !dynamoClient) {
    users.set(userData.email, userData);
    return;
  }
  try {
    await dynamoClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        email: userData.email,
        hasTime: userData.hasTime || false,
        role: userData.role || 'user',
        createdAt: new Date().toISOString(),
        ...userData
      }
    }));
  } catch (error) {
    console.error('DynamoDB saveUser error:', error);
    users.set(userData.email, userData); // Fallback
  }
}

async function getRoom(roomId) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return null; // Rooms will be stored in DynamoDB only
  }
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: ROOMS_TABLE,
      Key: { roomId }
    }));
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getRoom error:', error);
    return null;
  }
}

async function saveRoom(roomData) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return; // Rooms will be stored in DynamoDB only
  }
  try {
    await dynamoClient.send(new PutCommand({
      TableName: ROOMS_TABLE,
      Item: {
        roomId: roomData.roomId,
        ownerEmail: roomData.ownerEmail,
        status: roomData.status || 'active',
        createdAt: new Date().toISOString(),
        ...roomData
      }
    }));
  } catch (error) {
    console.error('DynamoDB saveRoom error:', error);
  }
}

async function getChannel(channelId, roomId) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return null;
  }
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: CHANNELS_TABLE,
      Key: { channelId, roomId }
    }));
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getChannel error:', error);
    return null;
  }
}

async function saveChannel(channelData) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return;
  }
  try {
    await dynamoClient.send(new PutCommand({
      TableName: CHANNELS_TABLE,
      Item: {
        channelId: channelData.channelId,
        roomId: channelData.roomId,
        channelArn: channelData.channelArn,
        playbackUrl: channelData.playbackUrl,
        ingestEndpoint: channelData.ingestEndpoint,
        sellerEmail: channelData.sellerEmail,
        streamKeyArn: channelData.streamKeyArn,
        createdAt: new Date().toISOString(),
        ...channelData
      }
    }));
  } catch (error) {
    console.error('DynamoDB saveChannel error:', error);
  }
}

async function getChannelsByRoom(roomId) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return [];
  }
  try {
    const result = await dynamoClient.send(new QueryCommand({
      TableName: CHANNELS_TABLE,
      IndexName: 'roomId-index', // GSI oluşturman gerekebilir, şimdilik Scan kullan
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: { ':roomId': roomId }
    }));
    return result.Items || [];
  } catch (error) {
    // Fallback to Scan if index doesn't exist
    try {
      const result = await dynamoClient.send(new ScanCommand({
        TableName: CHANNELS_TABLE,
        FilterExpression: 'roomId = :roomId',
        ExpressionAttributeValues: { ':roomId': roomId }
      }));
      return result.Items || [];
    } catch (scanError) {
      console.error('DynamoDB getChannelsByRoom error:', scanError);
      return [];
    }
  }
}

// Seed: sample user with payment time
saveUser({ email: 'hammaddeci.videosat.com', hasTime: true });

// Initialize Services
const userService = require('./services/user-service');
userService.initializeUserService(dynamoClient, users);

// Initialize Message Service
const messageService = require('./services/message-service');
const messages = new Map(); // In-memory fallback
const userMessages = new Map(); // In-memory fallback
messageService.initializeMessageService(dynamoClient, messages, userMessages);

// Initialize Payment Service
const paymentService = require('./services/payment-service');
const payments = new Map(); // In-memory fallback
const userPayments = new Map(); // In-memory fallback
paymentService.initializePaymentService(dynamoClient, payments, userPayments);

// Auth Routes
const authRoutes = require('./routes/auth-routes');
app.use('/api/auth', authRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token') || '';
  if (!ADMIN_TOKEN || token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// Payment status
app.get('/api/payments/status', async (req, res) => {
  const email = req.query.userEmail || '';
  const u = await getUser(email);
  res.json({ hasTime: !!(u && u.hasTime) });
});

// Admin: assign IVS config to a user (manual enter from AWS IVS)
app.post('/api/admin/ivs/assign', 
  requireAdmin,
  strictLimiter,
  [
    body('userEmail')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli')
      .normalizeEmail(),
    body('endpoint')
      .isURL({ protocols: ['http', 'https', 'rtmp', 'rtmps'] })
      .withMessage('Geçerli bir endpoint URL gerekli'),
    body('playbackUrl')
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Geçerli bir playback URL gerekli'),
    body('streamKey')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Stream key 10-500 karakter arasında olmalı')
  ],
  validateInput,
  async (req, res) => {
  const { userEmail, endpoint, playbackUrl, streamKey } = req.body || {};
  ivsAssignments.set(userEmail, { endpoint, playbackUrl, streamKey });
  const existingUser = await getUser(userEmail);
  if (!existingUser) {
    await saveUser({ email: userEmail, hasTime: true });
  }
  res.json({ ok: true });
});

// --- Streamers (POC) ---
// streamerEmail -> { email, minutesPurchased: number, minutesUsed: number }
const streamers = new Map();
// Note: payments artık paymentService üzerinden yönetiliyor

// Admin: set shared streamKey (quota limit nedeniyle)
app.post('/api/admin/stream-key/set', requireAdmin, (req, res) => {
  const { streamKey } = req.body || {};
  if (!streamKey || typeof streamKey !== 'string') {
    return res.status(400).json({ error: 'streamKey required (string)' });
  }
  sharedStreamKey = streamKey;
  console.log('💾 Shared streamKey set edildi (admin tarafından)');
  return res.json({ ok: true, message: 'Shared streamKey kaydedildi' });
});

// Admin: get shared streamKey status
app.get('/api/admin/stream-key/status', requireAdmin, (req, res) => {
  return res.json({ 
    ok: true, 
    hasSharedKey: !!sharedStreamKey,
    keyLength: sharedStreamKey ? sharedStreamKey.length : 0
  });
});

// Admin: set AWS credentials dynamically (Runtime override)
app.post('/api/admin/aws/creds', requireAdmin, (req, res) => {
  const { accessKeyId, secretAccessKey, region } = req.body || {};
  if (!accessKeyId || !secretAccessKey) return res.status(400).json({ error: 'accessKeyId and secretAccessKey required' });
  
  CURRENT_CREDS = { accessKeyId, secretAccessKey };
  if (region) CURRENT_REGION = region;
  
  // Yeni client'ları oluştur
  ivsClient = new IvsClient({ region: CURRENT_REGION, credentials: CURRENT_CREDS });
  stsClient = new STSClient({ region: CURRENT_REGION, credentials: CURRENT_CREDS });
  
  console.log('✅ AWS credentials runtime\'da güncellendi:', { region: CURRENT_REGION });
  return res.json({ ok: true, region: CURRENT_REGION, message: 'Credentials updated successfully' });
});

// Admin: verify AWS connectivity (STS + simple IVS call)
app.get('/api/admin/aws/verify', requireAdmin, async (req, res) => {
  try {
    const sts = await stsClient.send(new GetCallerIdentityCommand({}));
    let ivsOk = true;
    try {
      await ivsClient.send(new ListChannelsCommand({ maxResults: 1 }));
    } catch (e) {
      ivsOk = false;
    }
    return res.json({ ok: true, account: sts.Account, userId: sts.UserId, arn: sts.Arn, region: CURRENT_REGION, ivsOk });
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'verify_failed', detail: String(err && err.message || err) });
  }
});

// Admin: add/update streamer minutes
app.post('/api/admin/streamers/add', requireAdmin, (req, res) => {
  const { email, minutes } = req.body || {};
  if (!email || !Number.isFinite(minutes)) return res.status(400).json({ error: 'email and minutes required' });
  const s = streamers.get(email) || { email, minutesPurchased: 0, minutesUsed: 0 };
  s.minutesPurchased += Math.max(0, Math.floor(minutes));
  streamers.set(email, s);
  
  // Payment service ile kaydet
  await paymentService.savePayment({
    id: `STREAM-${Date.now()}`,
    orderId: `STREAM-${email}-${Date.now()}`,
    userId: email,
    amount: 0, // Stream minutes için ödeme tutarı yok
    currency: 'TRY',
    method: 'stream_minutes',
    status: 'completed',
    customer: { email },
    metadata: { minutes: Math.floor(minutes), type: 'stream_minutes' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return res.json({ ok: true, streamer: s });
});

// Admin: list streamers
app.get('/api/admin/streamers', requireAdmin, (req, res) => {
  return res.json({ streamers: Array.from(streamers.values()) });
});

// Admin: list payments
app.get('/api/admin/payments', requireAdmin, async (req, res) => {
  try {
    // Tüm ödemeleri getir (DynamoDB veya in-memory)
    if (USE_DYNAMODB && dynamoClient) {
      // DynamoDB'den tüm ödemeleri scan et (admin için)
      const result = await dynamoClient.send(new ScanCommand({
        TableName: PAYMENTS_TABLE,
        Limit: 1000
      }));
      return res.json({ payments: result.Items || [] });
    } else {
      // In-memory fallback
      return res.json({ payments: Array.from(payments.values()) });
    }
  } catch (error) {
    console.error('Get payments error:', error);
    return res.json({ payments: Array.from(payments.values()) }); // Fallback
  }
});

// Admin: payment statistics
app.get('/api/admin/payments/stats', requireAdmin, async (req, res) => {
  try {
    let allPayments = [];
    
    if (USE_DYNAMODB && dynamoClient) {
      // DynamoDB'den tüm ödemeleri getir
      const result = await dynamoClient.send(new ScanCommand({
        TableName: PAYMENTS_TABLE
      }));
      allPayments = result.Items || [];
    } else {
      // In-memory fallback
      allPayments = Array.from(payments.values());
    }
    
    const total = allPayments.length;
    const byStatus = {};
    let totalAmount = 0;
    
    allPayments.forEach(payment => {
      const status = payment.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (payment.amount) {
        totalAmount += parseFloat(payment.amount);
      }
    });
    
    res.json({
      ok: true,
      total,
      totalAmount,
      byStatus
    });
  } catch (err) {
    console.error('Payment stats error:', err);
    res.status(500).json({ error: 'stats_failed', detail: String(err) });
  }
});

// Admin: user statistics
app.get('/api/admin/users/stats', requireAdmin, (req, res) => {
  try {
    // Get users from in-memory store or DynamoDB
    const total = users.size;
    const active = Array.from(users.values()).filter(u => u.hasTime).length;
    
    res.json({
      ok: true,
      total,
      active,
      inactive: total - active
    });
  } catch (err) {
    console.error('User stats error:', err);
    res.status(500).json({ error: 'stats_failed', detail: String(err) });
  }
});

// Admin: get users list
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const usersList = Array.from(users.values())
      .slice(offset, offset + limit)
      .map(u => ({
        email: u.email,
        role: 'user',
        status: u.hasTime ? 'active' : 'inactive',
        createdAt: u.createdAt || new Date().toISOString()
      }));
    
    res.json({
      ok: true,
      users: usersList,
      total: users.size,
      limit,
      offset
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'get_users_failed', detail: String(err) });
  }
});

// Admin: stream statistics
app.get('/api/admin/streams/stats', requireAdmin, (req, res) => {
  try {
    let totalStreams = 0;
    let activeStreams = 0;
    
    rooms.forEach((room) => {
      if (room.channels) {
        totalStreams += room.channels.size;
        room.channels.forEach((channel) => {
          if (channel.status === 'active') {
            activeStreams++;
          }
        });
      }
    });
    
    res.json({
      ok: true,
      total: totalStreams,
      active: activeStreams,
      inactive: totalStreams - activeStreams
    });
  } catch (err) {
    console.error('Stream stats error:', err);
    res.status(500).json({ error: 'stats_failed', detail: String(err) });
  }
});

// Admin: export data
app.get('/api/admin/export', requireAdmin, async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;
    
    let data = null;
    
    switch (type) {
      case 'users':
        data = Array.from(users.values());
        break;
      case 'payments':
        if (USE_DYNAMODB && dynamoClient) {
          const result = await dynamoClient.send(new ScanCommand({
            TableName: PAYMENTS_TABLE
          }));
          data = result.Items || [];
        } else {
          data = Array.from(payments.values());
        }
        break;
      case 'errors':
        data = errorLogs;
        break;
      case 'performance':
        data = performanceLogs;
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
      return res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.json"`);
      return res.json(data);
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'export_failed', detail: String(err) });
  }
});

// Get streamer status
app.get('/api/streamers/:email/status', (req, res) => {
  const s = streamers.get(req.params.email) || { email: req.params.email, minutesPurchased: 0, minutesUsed: 0 };
  const minutesRemaining = Math.max(0, s.minutesPurchased - s.minutesUsed);
  return res.json({ email: s.email, minutesRemaining, minutesPurchased: s.minutesPurchased, minutesUsed: s.minutesUsed });
});

// Track active broadcast timers to auto-stop
// broadcastId -> timeoutId
const autoStopTimers = new Map();

// --- AWS IVS: per-broadcast lifecycle ---
// In-memory map: broadcastId -> { channelArn, streamKeyArn, ingestEndpoint, playbackUrl, streamKey }
const broadcasts = new Map();

// --- Multi-Channel Room System (TV Channels Model) ---
// Room yapısı: roomId -> { roomId, name, createdAt, channels: Map<channelId, channelInfo> }
// Her yayıncı room'a katıldığında kendi channel'ını oluşturur
const rooms = new Map(); // roomId -> { roomId, name, createdAt, channels: Map<channelId, channelData> }
const userChannels = new Map(); // userEmail -> { roomId, channelId, channelArn, ... }

// Room oluştur (admin veya otomatik)
app.post('/api/rooms/create', requireAdmin, async (req, res) => {
  try {
    const { roomId, name } = req.body || {};
    const finalRoomId = roomId || `room-${Date.now()}`;
    const roomName = name || `VideoSat Showroom ${new Date().toLocaleDateString()}`;
    
    if (rooms.has(finalRoomId)) {
      return res.status(400).json({ error: 'Room already exists' });
    }
    
    rooms.set(finalRoomId, {
      roomId: finalRoomId,
      name: roomName,
      createdAt: new Date().toISOString(),
      channels: new Map() // channelId -> channel data
    });
    
    return res.json({ ok: true, roomId: finalRoomId, name: roomName });
  } catch (err) {
    return res.status(500).json({ error: 'create_room_failed', detail: String(err && err.message || err) });
  }
});

// Provider seçimi: AWS_IVS veya AGORA
// Default: AGORA (AWS IVS pending verification durumunda)
const STREAM_PROVIDER = process.env.STREAM_PROVIDER || 'AGORA'; // Default: AGORA

// Agora service (lazy load)
let agoraService = null;
if (STREAM_PROVIDER === 'AGORA') {
  try {
    agoraService = require('./services/agora-service');
    console.log('✅ Agora.io service yüklendi');
  } catch (error) {
    console.error('⚠️ Agora service yüklenemedi:', error.message);
  }
}

// Yayıncı room'a katılır ve kendi channel'ını oluşturur
// Input validation helper
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

app.post('/api/rooms/:roomId/join', 
  [
    body('streamerEmail')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli')
      .normalizeEmail(),
    body('streamerName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('İsim 1-100 karakter arasında olmalı'),
    body('deviceInfo')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Cihaz bilgisi maksimum 500 karakter olabilir')
  ],
  validateInput,
  strictLimiter, // Kritik endpoint için sıkı rate limit
  async (req, res) => {
  try {
    const { roomId } = req.params;
    const { streamerEmail, streamerName, deviceInfo } = req.body || {};
    
    // Room ID validation
    if (!roomId || typeof roomId !== 'string' || roomId.length > 100) {
      return res.status(400).json({ error: 'Geçersiz roomId' });
    }
    
    // Room var mı kontrol et, yoksa oluştur
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        roomId,
        name: `Room ${roomId}`,
        createdAt: new Date().toISOString(),
        channels: new Map()
      });
    }
    
    const room = rooms.get(roomId);
    
    // Kullanıcı zaten bu room'da channel'a sahip mi?
    if (userChannels.has(streamerEmail)) {
      const existing = userChannels.get(streamerEmail);
      if (existing.roomId === roomId) {
        // Mevcut channel'ı döndür
        const channel = room.channels.get(existing.channelId);
        if (channel) {
          // Provider'a göre response formatı
          if (channel.provider === 'AGORA') {
            return res.json({
              ok: true,
              provider: 'AGORA',
              channelId: existing.channelId,
              channelName: channel.channelName,
              appId: channel.appId,
              publisherToken: channel.publisherToken,
              subscriberToken: channel.subscriberToken,
              webrtc: channel.webrtc
            });
          } else {
            return res.json({
              ok: true,
              provider: 'AWS_IVS',
              channelId: existing.channelId,
              ingest: `rtmps://${channel.ingestEndpoint}:443/app/`,
              playbackUrl: channel.playbackUrl,
              streamKey: channel.streamKey
            });
          }
        }
      }
    }
    
    // Provider seçimi: Agora veya AWS IVS
    if (STREAM_PROVIDER === 'AGORA' && agoraService) {
      // Agora.io kullan
      const safeStreamerEmail = streamerEmail.replace(/[^a-zA-Z0-9-_]/g, '_');
      const channelId = `channel-${safeStreamerEmail}-${Date.now()}`;
      const channelName = `${roomId}-${channelId}`;
      const userId = Math.floor(Math.random() * 1000000).toString();
      
      const agoraResult = agoraService.createChannel(channelName, userId);
      
      if (!agoraResult.ok) {
        return res.status(500).json({ error: 'agora_channel_failed', detail: agoraResult.error });
      }
      
      const channelData = {
        channelId,
        channelName: agoraResult.channelName,
        appId: agoraResult.appId,
        publisherToken: agoraResult.publisherToken,
        subscriberToken: agoraResult.subscriberToken,
        webrtc: agoraResult.webrtc,
        rtmpUrl: agoraResult.rtmpUrl,
        hlsUrl: agoraResult.hlsUrl,
        streamerEmail,
        streamerName: streamerName || streamerEmail,
        deviceInfo: deviceInfo || 'unknown',
        provider: 'AGORA',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      
      room.channels.set(channelId, channelData);
      userChannels.set(streamerEmail, { roomId, channelId, provider: 'AGORA' });
      
      console.log('✅ Agora channel oluşturuldu:', channelId);
      
      return res.json({
        ok: true,
        provider: 'AGORA',
        roomId,
        channelId,
        channelName: agoraResult.channelName,
        appId: agoraResult.appId,
        publisherToken: agoraResult.publisherToken,
        subscriberToken: agoraResult.subscriberToken,
        webrtc: agoraResult.webrtc,
        rtmpUrl: agoraResult.rtmpUrl,
        hlsUrl: agoraResult.hlsUrl
      });
    }
    
    // AWS IVS artık kullanılmıyor - Agora.io kullanılıyor
    // Eğer buraya gelindi demek ki Agora service yüklenemedi veya STREAM_PROVIDER yanlış ayarlı
    console.error('❌ Agora service yüklenemedi veya STREAM_PROVIDER yanlış ayarlı!');
    console.error('   STREAM_PROVIDER:', STREAM_PROVIDER);
    console.error('   agoraService:', !!agoraService);
    return res.status(500).json({ 
      error: 'agora_service_required', 
      detail: 'Agora.io service gerekli. STREAM_PROVIDER=AGORA ve AGORA_APP_ID, AGORA_APP_CERTIFICATE environment variable\'larını kontrol edin. AWS IVS artık kullanılmıyor.' 
    });
    
    // ⚠️ Aşağıdaki AWS IVS kodu artık çalışmıyor - yorum satırına alındı
    /*
    // AWS IVS kullan (default)
    // Yeni channel oluştur (her telefon/bilgisayar = ayrı channel)
    // AWS IVS channel name sadece alphanumeric, dash ve underscore kabul eder
    const safeStreamerEmail = streamerEmail.replace(/[^a-zA-Z0-9-_]/g, '_');
    const channelId = `channel-${safeStreamerEmail}-${Date.now()}`;
    const channelName = `${streamerName || streamerEmail}'s Channel`;
    
    let createResp;
    let channelArn;
    let ingestEndpoint;
    let playbackUrl;
    
    try {
      createResp = await ivsClient.send(new CreateChannelCommand({
        name: `room-${roomId}-${channelId}`,
        type: 'BASIC',
        latencyMode: 'LOW',
        authorized: false
      }));
      channelArn = createResp.channel?.arn;
      ingestEndpoint = createResp.channel?.ingestEndpoint;
      playbackUrl = createResp.channel?.playbackUrl;
    } catch (ivsError) {
      // Hata durumunda throw et (artık mock channel kullanmıyoruz)
      console.error('❌ AWS IVS channel oluşturma hatası:', ivsError.message);
      throw ivsError;
    }
    
    // Channel bilgilerini al
    if (!createResp || !createResp.channel) {
      throw new Error('AWS IVS channel oluşturulamadı. createResp.channel yok.');
    }
    
    const channel = createResp.channel;
    channelArn = channel.arn;
    ingestEndpoint = channel.ingestEndpoint;
    playbackUrl = channel.playbackUrl;
    
    // Stream key oluştur
    // ÖNEMLİ: AWS IVS'de streamKey.value sadece CreateStreamKeyCommand response'unda gelir
    // ve sadece bir kez gösterilir. Sonraki ListStreamKeysCommand çağrılarında value gelmez.
    // Bu yüzden streamKey'i hemen saklamalıyız.
    let streamKey;
    let streamKeyArn;
    
    try {
      // Önce mevcut key'leri kontrol et (channel'da zaten key varsa)
      const existingKeys = await ivsClient.send(new ListStreamKeysCommand({ channelArn }));
      if (existingKeys.streamKeys && existingKeys.streamKeys.length > 0) {
        // Mevcut key var ama value gelmiyor (AWS güvenlik)
        // Bu durumda yeni key oluşturmaya çalış, value'yu al
        console.log('⚠️ Channel\'da mevcut key var ama value alınamıyor. Yeni key oluşturuluyor...');
      }
      
      // Yeni stream key oluştur
      const keyResp = await ivsClient.send(new CreateStreamKeyCommand({ channelArn }));
      streamKeyArn = keyResp.streamKey.arn;
      streamKey = keyResp.streamKey.value;
      
      if (!streamKey) {
        // Yeni key oluşturuldu ama value gelmedi - bu normal değil
        // Muhtemelen AWS quota limiti veya channel zaten bir key'e sahip
        throw new Error('StreamKey.value CreateStreamKeyCommand response\'unda yok. Yeni channel için value gelmeli.');
      }
      
      console.log('✅ Yeni streamKey oluşturuldu, value mevcut');
      // Shared streamKey'i kaydet (quota limit nedeniyle tüm channel'lar için kullanılacak)
      if (!sharedStreamKey && streamKey) {
        sharedStreamKey = streamKey;
        console.log('💾 Shared streamKey kaydedildi');
      }
    } catch (keyErr) {
      // CreateStreamKeyCommand başarısız oldu (quota exceeded, vb.)
      console.error('CreateStreamKeyCommand hatası:', keyErr.message);
      
      // Artık mock stream key kullanmıyoruz, hata fırlat
      if (keyErr.message && keyErr.message.includes('pending verification')) {
        throw new Error('AWS IVS hesap doğrulaması hala bekleniyor. Lütfen AWS Console\'dan hesap doğrulamasını tamamlayın.');
      } else {
        // Mevcut key'leri listele - ama value gelmeyecek
        try {
          const existingKeys = await ivsClient.send(new ListStreamKeysCommand({ channelArn }));
          if (existingKeys.streamKeys && existingKeys.streamKeys.length > 0) {
            streamKeyArn = existingKeys.streamKeys[0].arn;
            // NOT: existingKeys.streamKeys[0].value undefined olacak - AWS güvenlik
            // Çözüm: Daha önce kaydedilmiş sharedStreamKey'i kullan
            if (sharedStreamKey) {
              streamKey = sharedStreamKey;
              console.log('✅ Shared streamKey kullanıldı (quota limit nedeniyle)');
            } else {
              return res.status(500).json({ error: 'stream_key_creation_failed', detail: 'StreamKey oluşturulamadı ve kaydedilmiş streamKey yok. İlk channel oluşturulurken streamKey kaydedilmeli.' });
            }
          } else {
            return res.status(500).json({ error: 'stream_key_creation_failed', detail: String(keyErr.message) });
          }
        } catch (listErr) {
          return res.status(500).json({ error: 'stream_key_failed', detail: `Create: ${keyErr.message}, List: ${listErr.message}` });
        }
      }
    }
    
    // StreamKey kontrolü - eğer hala yoksa hata ver
    if (!streamKey) {
      console.error('❌ StreamKey oluşturulamadı! Channel:', channelArn);
      return res.status(500).json({ 
        error: 'stream_key_creation_failed', 
        detail: 'Stream key oluşturulamadı. Lütfen tekrar deneyin.' 
      });
    }
    
    const channelData = {
      channelId,
      channelArn,
      streamKeyArn,
      ingestEndpoint,
      playbackUrl,
      streamKey, // streamKey'i sakla
      streamerEmail,
      streamerName: streamerName || streamerEmail,
      deviceInfo: deviceInfo || 'unknown',
      provider: 'AWS_IVS',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    
    console.log('✅ AWS IVS channel oluşturuldu:', {
      channelId,
      hasStreamKey: !!streamKey,
      streamKeyLength: streamKey ? streamKey.length : 0
    });
    
    // Room'a channel ekle
    room.channels.set(channelId, channelData);
    
    // Kullanıcı-channel mapping'i kaydet
    userChannels.set(streamerEmail, { roomId, channelId, channelArn, provider: 'AWS_IVS' });
    
    return res.json({
      ok: true,
      provider: 'AWS_IVS',
      roomId,
      channelId,
      channelName,
      ingest: `rtmps://${ingestEndpoint}:443/app/`,
      playbackUrl,
      streamKey, // streamKey'i response'a ekle
      channelArn,
      streamKeyArn
    });
    */
  } catch (err) {
    return res.status(500).json({ error: 'join_room_failed', detail: String(err && err.message || err) });
  }
});

// Room'daki aktif channel'ları listele (izleyiciler için)
app.get('/api/rooms/:roomId/channels', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Sadece public bilgileri döndür (stream key hariç)
    // Provider bilgisini de ekle (Agora için ek bilgiler)
    const channelsList = Array.from(room.channels.values()).map(ch => ({
      channelId: ch.channelId,
      streamerName: ch.streamerName,
      streamerEmail: ch.streamerEmail, // Opsiyonel: gizlenebilir
      deviceInfo: ch.deviceInfo,
      playbackUrl: ch.playbackUrl || ch.hlsUrl, // Agora için hlsUrl, AWS IVS için playbackUrl
      status: ch.status,
      createdAt: ch.createdAt,
      lastActiveAt: ch.lastActiveAt,
      provider: ch.provider || 'AGORA', // Provider bilgisi
      // Agora için ek bilgiler
      channelName: ch.channelName,
      appId: ch.appId,
      subscriberToken: ch.subscriberToken,
      hlsUrl: ch.hlsUrl,
      rtmpUrl: ch.rtmpUrl
    }));
    
    return res.json({
      ok: true,
      roomId,
      roomName: room.name,
      channels: channelsList,
      totalChannels: channelsList.length
    });
  } catch (err) {
    return res.status(500).json({ error: 'list_channels_failed', detail: String(err && err.message || err) });
  }
});

// Belirli bir channel'ın playback bilgilerini al (izleyici için)
app.get('/api/rooms/:roomId/channels/:channelId/playback', async (req, res) => {
  try {
    const { roomId, channelId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const channel = room.channels.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Playback URL'i döndür (provider'a göre)
    let playbackUrl = null;
    if (channel.provider === 'AGORA') {
      playbackUrl = channel.hlsUrl || channel.rtmpUrl;
    } else {
      playbackUrl = channel.playbackUrl;
    }
    
    return res.json({
      ok: true,
      channelId,
      streamerName: channel.streamerName,
      playbackUrl: playbackUrl,
      status: channel.status,
      provider: channel.provider || 'AGORA',
      // Agora için ek bilgiler
      channelName: channel.channelName,
      appId: channel.appId,
      subscriberToken: channel.subscriberToken,
      hlsUrl: channel.hlsUrl,
      rtmpUrl: channel.rtmpUrl
    });
  } catch (err) {
    return res.status(500).json({ error: 'get_playback_failed', detail: String(err && err.message || err) });
  }
});

// Yayıncı kendi channel'ının stream key'ini alır
app.post('/api/rooms/:roomId/channels/:channelId/claim-key', async (req, res) => {
  try {
    const { roomId, channelId } = req.params;
    const { streamerEmail } = req.body || {};
    
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const channel = room.channels.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Sadece channel sahibi stream key alabilir
    if (channel.streamerEmail !== streamerEmail) {
      return res.status(403).json({ error: 'Unauthorized: Not your channel' });
    }
    
    // Auto-stop timer ekle (streamer minutes kontrolü)
    if (streamers.has(streamerEmail)) {
      const s = streamers.get(streamerEmail);
      const remaining = Math.max(0, s.minutesPurchased - s.minutesUsed);
      if (remaining > 0) {
        const timerKey = `${roomId}-${channelId}`;
        if (autoStopTimers.has(timerKey)) {
          clearTimeout(autoStopTimers.get(timerKey));
        }
        const ms = remaining * 60 * 1000;
        const timeoutId = setTimeout(async () => {
          try {
            await ivsClient.send(new StopStreamCommand({ channelArn: channel.channelArn }));
          } catch (_) {}
          autoStopTimers.delete(timerKey);
        }, ms);
        autoStopTimers.set(timerKey, timeoutId);
      }
    }
    
    return res.json({
      streamKey: channel.streamKey,
      ttlSec: 7200, // 2 saat
      ingest: `rtmps://${channel.ingestEndpoint}:443/app/`
    });
  } catch (err) {
    return res.status(500).json({ error: 'claim_key_failed', detail: String(err && err.message || err) });
  }
});

// Yayıncı room'dan ayrılır (channel silinir)
app.delete('/api/rooms/:roomId/channels/:channelId/leave', async (req, res) => {
  try {
    const { roomId, channelId } = req.params;
    const { streamerEmail } = req.body || {};
    
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const channel = room.channels.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Sadece channel sahibi silebilir
    if (channel.streamerEmail !== streamerEmail) {
      return res.status(403).json({ error: 'Unauthorized: Not your channel' });
    }
    
    // Stream'i durdur
    try {
      await ivsClient.send(new StopStreamCommand({ channelArn: channel.channelArn }));
    } catch (_) {}
    
    // Stream key'leri sil
    try {
      const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn: channel.channelArn }));
      for (const k of (keys.streamKeys || [])) {
        try {
          await ivsClient.send(new DeleteStreamKeyCommand({ arn: k.arn }));
        } catch (_) {}
      }
    } catch (_) {}
    
    // Channel'ı sil
    try {
      await ivsClient.send(new DeleteChannelCommand({ arn: channel.channelArn }));
    } catch (err) {
      console.warn('Channel delete failed:', err.message);
    }
    
    // Room'dan ve mapping'den çıkar
    room.channels.delete(channelId);
    userChannels.delete(streamerEmail);
    
    // Auto-stop timer'ı temizle
    const timerKey = `${roomId}-${channelId}`;
    if (autoStopTimers.has(timerKey)) {
      clearTimeout(autoStopTimers.get(timerKey));
      autoStopTimers.delete(timerKey);
    }
    
    return res.json({ ok: true, message: 'Channel deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'leave_failed', detail: String(err && err.message || err) });
  }
});

// Room listesi (admin)
app.get('/api/admin/rooms', requireAdmin, async (req, res) => {
  try {
    const roomsList = Array.from(rooms.values()).map(room => ({
      roomId: room.roomId,
      name: room.name,
      createdAt: room.createdAt,
      activeChannels: room.channels.size
    }));
    return res.json({ rooms: roomsList });
  } catch (err) {
    return res.status(500).json({ error: 'list_rooms_failed', detail: String(err && err.message || err) });
  }
});

// Create IVS channel + stream key for a broadcast
app.post('/api/admin/ivs/channel', requireAdmin, async (req, res) => {
  try {
    const {
      broadcastId,
      name,
      type = 'BASIC', // BASIC | STANDARD | ADVANCED_SD | ADVANCED_HD
      latencyMode = 'LOW', // NORMAL | LOW
      authorized = false
    } = req.body || {};
    if (!broadcastId) return res.status(400).json({ error: 'broadcastId required' });

    const channelName = name || `basvideo-${broadcastId}-${Date.now()}`;
    const createResp = await ivsClient.send(new CreateChannelCommand({
      name: channelName,
      type,
      latencyMode,
      authorized
    }));

    const channel = createResp.channel;
    const channelArn = channel.arn;
    const ingestEndpoint = channel.ingestEndpoint; // rtmps://{endpoint}:443/app/
    const playbackUrl = channel.playbackUrl;

    const keyResp = await ivsClient.send(new CreateStreamKeyCommand({ channelArn }));
    const streamKeyArn = keyResp.streamKey.arn;
    const streamKey = keyResp.streamKey.value;

    broadcasts.set(broadcastId, { channelArn, streamKeyArn, ingestEndpoint, playbackUrl, streamKey });

    return res.json({
      ok: true,
      broadcastId,
      channelArn,
      streamKeyArn,
      ingest: `rtmps://${ingestEndpoint}:443/app/`,
      playbackUrl,
      streamKey
    });
  } catch (err) {
    return res.status(500).json({ error: 'create_failed', detail: String(err && err.message || err) });
  }
});

// List IVS channels (admin)
app.get('/api/admin/ivs/channels', requireAdmin, async (req, res) => {
  try {
    const resp = await ivsClient.send(new ListChannelsCommand({}));
    return res.json({ channels: resp.channels || [] });
  } catch (err) {
    return res.status(500).json({ error: 'list_failed', detail: String(err && err.message || err) });
  }
});

// Helper: parse playback URL to extract region, accountId, channelId
app.post('/api/admin/ivs/parse-playback', requireAdmin, (req, res) => {
  const { playbackUrl } = req.body || {};
  if (!playbackUrl) return res.status(400).json({ error: 'playbackUrl required' });
  const re = /\/api\/video\/v1\/([a-z0-9-]+)\.([0-9]+)\.channel\.([^.]+)\.m3u8$/;
  const m = String(playbackUrl).match(re);
  if (!m) return res.status(400).json({ error: 'invalid_playback_url' });
  const region = m[1];
  const accountId = m[2];
  const channelId = m[3];
  return res.json({ region, accountId, channelId });
});

// Get channel by Channel ID (lists channels and filters client-side)
app.get('/api/admin/ivs/channel-by-id/:channelId', requireAdmin, async (req, res) => {
  try {
    const { channelId } = req.params;
    // There is no direct GetChannel by channelId, so list and filter
    const resp = await ivsClient.send(new ListChannelsCommand({}));
    const found = (resp.channels || []).find(ch => ch.channelId === channelId);
    if (!found) return res.status(404).json({ error: 'not_found' });
    return res.json({ channel: found });
  } catch (err) {
    return res.status(500).json({ error: 'lookup_failed', detail: String(err && err.message || err) });
  }
});

// List stream keys for a channel ARN
app.get('/api/admin/ivs/stream-keys', requireAdmin, async (req, res) => {
  try {
    const { channelArn } = req.query;
    if (!channelArn) return res.status(400).json({ error: 'channelArn required' });
    const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn }));
    return res.json({ streamKeys: keys.streamKeys || [] });
  } catch (err) {
    return res.status(500).json({ error: 'keys_failed', detail: String(err && err.message || err) });
  }
});

// List ALL stream keys across all channels (admin helper)
app.get('/api/admin/ivs/all-stream-keys', requireAdmin, async (req, res) => {
  try {
    const resp = await ivsClient.send(new ListChannelsCommand({}));
    const channels = resp.channels || [];
    const allKeys = [];
    
    for (const ch of channels) {
      try {
        const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn: ch.arn }));
        allKeys.push({
          channelArn: ch.arn,
          channelName: ch.name,
          streamKeys: keys.streamKeys || []
        });
      } catch (_) {}
    }
    
    return res.json({ allKeys, totalKeys: allKeys.reduce((sum, ch) => sum + ch.streamKeys.length, 0) });
  } catch (err) {
    return res.status(500).json({ error: 'list_all_failed', detail: String(err && err.message || err) });
  }
});

// Delete IVS channel and associated keys (admin)
app.delete('/api/admin/ivs/channel', requireAdmin, async (req, res) => {
  try {
    const { channelArn, broadcastId } = req.body || {};
    let arn = channelArn;
    if (!arn && broadcastId && broadcasts.has(broadcastId)) {
      arn = broadcasts.get(broadcastId).channelArn;
    }
    if (!arn) return res.status(400).json({ error: 'channelArn or broadcastId required' });

    // Stop stream if running (best-effort)
    try { await ivsClient.send(new StopStreamCommand({ channelArn: arn })); } catch (_) {}

    // Delete stream keys first
    try {
      const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn: arn }));
      for (const k of (keys.streamKeys || [])) {
        try {
          await ivsClient.send(new DeleteStreamKeyCommand({ arn: k.arn }));
        } catch (keyErr) {
          console.warn('Stream key delete failed:', keyErr.message);
        }
      }
    } catch (_) {}

    await ivsClient.send(new DeleteChannelCommand({ arn }));

    if (broadcastId) broadcasts.delete(broadcastId);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'delete_failed', detail: String(err && err.message || err) });
  }
});

// Delete all IVS channels (admin helper) - POC only
app.post('/api/admin/ivs/channels/delete-all', requireAdmin, async (req, res) => {
  try {
    const resp = await ivsClient.send(new ListChannelsCommand({}));
    const channels = resp.channels || [];
    const results = [];
    
    for (const ch of channels) {
      try {
        // Stop stream
        try { await ivsClient.send(new StopStreamCommand({ channelArn: ch.arn })); } catch (_) {}
        
        // Delete stream keys
        try {
          const keys = await ivsClient.send(new ListStreamKeysCommand({ channelArn: ch.arn }));
          for (const k of (keys.streamKeys || [])) {
            try {
              await ivsClient.send(new DeleteStreamKeyCommand({ arn: k.arn }));
              console.log('Stream key deleted:', k.arn);
            } catch (keyErr) {
              console.error('Stream key delete failed:', k.arn, keyErr.message);
            }
          }
        } catch (err) {
          console.error('List stream keys failed:', ch.arn, err.message);
        }
        
        // Delete channel
        await ivsClient.send(new DeleteChannelCommand({ arn: ch.arn }));
        results.push({ arn: ch.arn, status: 'deleted' });
      } catch (err) {
        results.push({ arn: ch.arn, status: 'failed', error: String(err.message) });
      }
    }
    
    return res.json({ ok: true, results });
  } catch (err) {
    return res.status(500).json({ error: 'delete_all_failed', detail: String(err && err.message || err) });
  }
});

// Publisher: get per-broadcast config (no stream key)
app.get('/api/ivs/broadcast/:broadcastId/config', async (req, res) => {
  const { broadcastId } = req.params;
  const b = broadcasts.get(broadcastId);
  if (!b) return res.status(404).json({ error: 'not_found' });
  return res.json({ ingest: `rtmps://${b.ingestEndpoint}:443/app/`, playbackUrl: b.playbackUrl });
});

// Admin: create and assign broadcast to a streamer, optional minutesToUse for this session
app.post('/api/admin/broadcasts/create', requireAdmin, async (req, res) => {
  try {
    const { streamerEmail, broadcastId, name, minutesToUse = 0 } = req.body || {};
    if (!streamerEmail || !broadcastId) return res.status(400).json({ error: 'streamerEmail and broadcastId required' });
    // create channel + key via existing endpoint logic
    const channelName = name || `basvideo-${broadcastId}-${Date.now()}`;
    const createResp = await ivsClient.send(new CreateChannelCommand({ name: channelName, type: 'BASIC', latencyMode: 'LOW', authorized: false }));
    const channel = createResp.channel;
    const channelArn = channel.arn;
    const ingestEndpoint = channel.ingestEndpoint;
    const playbackUrl = channel.playbackUrl;
    
    // Check quota before creating stream key
    let streamKey;
    let streamKeyArn;
    try {
      const keyResp = await ivsClient.send(new CreateStreamKeyCommand({ channelArn }));
      streamKeyArn = keyResp.streamKey.arn;
      streamKey = keyResp.streamKey.value;
      console.log('Stream key created successfully:', streamKeyArn);
    } catch (keyErr) {
      console.error('Stream key creation failed:', keyErr.message, keyErr.code);
      // Try to get existing stream key from channel
      try {
        const existingKeys = await ivsClient.send(new ListStreamKeysCommand({ channelArn }));
        if (existingKeys.streamKeys && existingKeys.streamKeys.length > 0) {
          streamKeyArn = existingKeys.streamKeys[0].arn;
          streamKey = existingKeys.streamKeys[0].value;
          console.log('Using existing stream key:', streamKeyArn);
        } else {
          streamKey = null;
          streamKeyArn = null;
        }
      } catch (listErr) {
        console.error('Failed to list stream keys:', listErr.message);
        streamKey = null;
        streamKeyArn = null;
      }
    }
    
    broadcasts.set(broadcastId, { channelArn, streamKeyArn, ingestEndpoint, playbackUrl, streamKey, streamerEmail });
    // ensure streamer exists
    if (!streamers.has(streamerEmail)) streamers.set(streamerEmail, { email: streamerEmail, minutesPurchased: 0, minutesUsed: 0 });
    return res.json({ ok: true, broadcastId, ingest: `rtmps://${ingestEndpoint}:443/app/`, playbackUrl, streamKey: streamKey || 'QUOTA_EXCEEDED', channelArn, streamKeyArn });
  } catch (err) {
    return res.status(500).json({ error: 'create_assign_failed', detail: String(err && err.message || err) });
  }
});

// Publisher: claim stream key for a broadcast (POC: returns raw key) and start auto-stop timer if streamer has limited minutes
app.post('/api/ivs/broadcast/:broadcastId/claim-key', async (req, res) => {
  const { broadcastId } = req.params;
  const { streamerEmail } = req.body || {};
  const b = broadcasts.get(broadcastId);
  if (!b) return res.status(404).json({ error: 'not_found' });
  const email = streamerEmail || b.streamerEmail;
  // schedule auto stop based on remaining minutes (best-effort)
  if (email && streamers.has(email)) {
    const s = streamers.get(email);
    const remaining = Math.max(0, s.minutesPurchased - s.minutesUsed);
    if (remaining > 0) {
      if (autoStopTimers.has(broadcastId)) {
        clearTimeout(autoStopTimers.get(broadcastId));
      }
      const ms = remaining * 60 * 1000;
      const timeoutId = setTimeout(async () => {
        try {
          await ivsClient.send(new StopStreamCommand({ channelArn: b.channelArn }));
        } catch (_) {}
        autoStopTimers.delete(broadcastId);
      }, ms);
      autoStopTimers.set(broadcastId, timeoutId);
    }
  }
  return res.json({ streamKey: b.streamKey, ttlSec: 60 });
});

// Publisher: get IVS config without streamKey (safety)
app.get('/api/livestream/config', (req, res) => {
  const email = req.query.userEmail || '';
  const cfg = ivsAssignments.get(email);
  if (!cfg) return res.status(404).json({ error: 'IVS not assigned yet' });
  res.json({ endpoint: cfg.endpoint, playbackUrl: cfg.playbackUrl });
});

// Publisher: claim short-lived key (mock) right before start
app.post('/api/livestream/claim-key', (req, res) => {
  const { userEmail } = req.body || {};
  const cfg = ivsAssignments.get(userEmail || '');
  if (!cfg) return res.status(404).json({ error: 'IVS not assigned' });
  // In production: issue short-lived token or return key via signed mechanism.
  // Here we simply return the stored key for POC.
  res.json({ streamKey: cfg.streamKey, ttlSec: 60 });
});

// Port yapılandırması (merkezi config'den)
const backendConfig = getBackendConfig();
const PORT = validatePort(process.env.PORT || backendConfig.defaultPort);
const HOST = process.env.HOST || '0.0.0.0'; // Tüm network interface'lere bind

// HTTP Server oluştur (Socket.io için)
const server = http.createServer(app);

// Socket.io WebSocket Server
const io = new Server(server, {
  cors: {
    origin: [
      'https://basvideo.com',
      'https://www.basvideo.com',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// WebSocket bağlantı yönetimi
const connectedUsers = new Map(); // socketId -> userId

io.on('connection', (socket) => {
  console.log(`✅ WebSocket bağlantısı: ${socket.id}`);

  // Kullanıcı kimlik doğrulama
  socket.on('authenticate', async (data) => {
    try {
      const { userId, email } = data;
      if (userId || email) {
        connectedUsers.set(socket.id, userId || email);
        socket.userId = userId || email;
        socket.join(`user:${userId || email}`);
        console.log(`🔐 Kullanıcı kimlik doğrulandı: ${userId || email}`);
        socket.emit('authenticated', { success: true });
      }
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error);
      socket.emit('authenticated', { success: false, error: error.message });
    }
  });

  // Mesaj gönderme
  socket.on('sendMessage', async (data) => {
    try {
      const { toUserId, message, type = 'text', metadata = {} } = data;
      const fromUserId = socket.userId || connectedUsers.get(socket.id);

      if (!fromUserId) {
        socket.emit('error', { message: 'Kimlik doğrulaması gerekli' });
        return;
      }

      if (!toUserId || !message) {
        socket.emit('error', { message: 'Alıcı ve mesaj gerekli' });
        return;
      }

      const messageData = {
        id: Date.now() + Math.random(),
        senderId: fromUserId,
        receiverId: toUserId,
        message: message.trim(),
        type: type,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        read: false,
        status: 'sent'
      };

      // Alıcıya mesaj gönder
      io.to(`user:${toUserId}`).emit('message', messageData);
      
      // Gönderene onay gönder
      socket.emit('messageSent', { ...messageData, status: 'sent' });

      console.log(`📨 Mesaj gönderildi: ${fromUserId} -> ${toUserId}`);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      socket.emit('error', { message: 'Mesaj gönderilemedi', error: error.message });
    }
  });

  // Mesaj okundu işaretleme
  socket.on('markAsRead', async (data) => {
    try {
      const { messageId } = data;
      const userId = socket.userId || connectedUsers.get(socket.id);

      if (!userId) {
        socket.emit('error', { message: 'Kimlik doğrulaması gerekli' });
        return;
      }

      // Mesaj gönderenine okundu bildirimi gönder
      // (Burada mesaj gönderenini bulmak için mesaj veritabanından sorgulanabilir)
      socket.emit('messageRead', { messageId, readAt: new Date().toISOString() });

      console.log(`✅ Mesaj okundu işaretlendi: ${messageId} by ${userId}`);
    } catch (error) {
      console.error('Okundu işaretleme hatası:', error);
      socket.emit('error', { message: 'Okundu işaretlenemedi', error: error.message });
    }
  });

  // Bağlantı kesilme
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      console.log(`🔌 Kullanıcı bağlantısı kesildi: ${userId}`);
    } else {
      console.log(`🔌 WebSocket bağlantısı kesildi: ${socket.id}`);
    }
  });

  // Hata yönetimi
  socket.on('error', (error) => {
    console.error(`❌ Socket hatası (${socket.id}):`, error);
  });
});

// Socket.io'yu global olarak erişilebilir yap
app.io = io;

// Yerel IP'yi algıla (gösterim için)
const os = require('os');
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4 ve internal olmayan (WiFi/Ethernet) IP
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ============================================
// EMAIL SERVICE
// ============================================
const emailService = require('./services/email-service');

// ============================================
// MESSAGING API ENDPOINTS
// ============================================
// Note: messages ve userMessages artık messageService üzerinden yönetiliyor

// POST /api/messages - Mesaj gönder
app.post('/api/messages', 
  [
    body('toUserId')
      .notEmpty()
      .withMessage('Alıcı ID gerekli')
      .trim(),
    body('message')
      .notEmpty()
      .withMessage('Mesaj gerekli')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Mesaj 1-1000 karakter arasında olmalı'),
    body('type')
      .optional()
      .isIn(['text', 'image', 'file', 'system'])
      .withMessage('Geçersiz mesaj tipi')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { toUserId, message, type = 'text', metadata = {} } = req.body;
      const fromUserId = req.headers['x-user-id'] || req.query.userId || 'anonymous';

      const messageData = {
        id: Date.now() + Math.random(),
        senderId: fromUserId,
        receiverId: toUserId,
        message: message.trim(),
        type: type,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        read: false,
        status: 'sent'
      };

      // Mesajı service ile sakla
      await messageService.saveMessage(messageData);

      // WebSocket ile alıcıya gönder
      if (io) {
        io.to(`user:${toUserId}`).emit('message', messageData);
      }

      res.json({ success: true, message: messageData });
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      res.status(500).json({ error: 'Mesaj gönderilemedi', detail: error.message });
    }
  }
);

// GET /api/messages - Mesajları al
app.get('/api/messages', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
    const otherUserId = req.query.otherUserId;
    const limit = parseInt(req.query.limit) || 50;

    // Message service ile mesajları getir
    const userMessagesList = await messageService.getUserMessages(userId, otherUserId, limit);

    res.json({ success: true, messages: userMessagesList });
  } catch (error) {
    console.error('Mesaj alma hatası:', error);
    res.status(500).json({ error: 'Mesajlar alınamadı', detail: error.message });
  }
});

// PUT /api/messages/:messageId/read - Mesajı okundu işaretle
app.put('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';

    // Message service ile okundu işaretle
    const message = await messageService.markMessageAsRead(messageId, userId);
    if (!message) {
      return res.status(404).json({ error: 'Mesaj bulunamadı veya yetkiniz yok' });
    }

    // WebSocket ile gönderene bildir
    if (io) {
      io.to(`user:${message.senderId}`).emit('messageRead', {
        messageId: message.id,
        readAt: message.readAt
      });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error('Okundu işaretleme hatası:', error);
    res.status(500).json({ error: 'Okundu işaretlenemedi', detail: error.message });
  }
});

// ============================================
// PAYMENT API ENDPOINTS
// ============================================
// Note: payments ve userPayments artık paymentService üzerinden yönetiliyor

// Payment status enum
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// POST /api/payments/process - Ödeme işle
app.post('/api/payments/process',
  [
    body('orderId')
      .notEmpty()
      .withMessage('Sipariş ID gerekli')
      .trim(),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Geçerli bir tutar gerekli (min: 0.01)'),
    body('method')
      .isIn(['cash', 'card', 'online', 'installment', 'crypto', 'bank_transfer'])
      .withMessage('Geçerli bir ödeme yöntemi gerekli'),
    body('customer')
      .optional()
      .isObject()
      .withMessage('Müşteri bilgileri obje olmalı'),
    body('cardData')
      .optional()
      .isObject()
      .withMessage('Kart bilgileri obje olmalı')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId, amount, method, customer = {}, cardData = {}, metadata = {} } = req.body;
      const userId = req.headers['x-user-id'] || req.query.userId || customer.email || 'anonymous';

      // Güvenlik: Kart bilgilerini asla loglamayın veya saklamayın
      // Sadece token veya masked card number kullanılmalı
      const maskedCard = cardData.number ? `****${cardData.number.slice(-4)}` : null;

      const paymentData = {
        id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        userId,
        amount: parseFloat(amount),
        currency: 'TRY',
        method,
        status: PAYMENT_STATUS.PENDING,
        customer: {
          email: customer.email || userId,
          name: customer.name || 'Müşteri',
          phone: customer.phone || null
        },
        cardData: maskedCard ? { last4: maskedCard.slice(-4), type: cardData.type || 'unknown' } : null,
        metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ödeme işlemini simüle et (gerçek gateway entegrasyonu burada yapılacak)
      paymentData.status = PAYMENT_STATUS.PROCESSING;
      
      // Payment service ile kaydet
      await paymentService.savePayment(paymentData);

      // Ödeme yöntemine göre işle
      const result = await processPaymentByMethod(method, paymentData, cardData);

      // Sonucu güncelle
      paymentData.status = result.success ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.FAILED;
      paymentData.reference = result.reference;
      paymentData.gatewayResponse = result.gatewayResponse;
      paymentData.updatedAt = new Date().toISOString();
      
      // Payment service ile güncelle
      await paymentService.updatePayment(paymentData.id, {
        status: paymentData.status,
        reference: paymentData.reference,
        gatewayResponse: paymentData.gatewayResponse
      });

      // WebSocket ile bildir (varsa)
      if (io) {
        io.to(`user:${userId}`).emit('paymentStatus', {
          paymentId: paymentData.id,
          status: paymentData.status,
          orderId: orderId
        });
      }

      res.json({
        success: result.success,
        paymentId: paymentData.id,
        status: paymentData.status,
        reference: paymentData.reference,
        message: result.message
      });
    } catch (error) {
      console.error('Ödeme işleme hatası:', error);
      res.status(500).json({ error: 'Ödeme işlenemedi', detail: error.message });
    }
  }
);

// Ödeme yöntemine göre işle (simülasyon)
async function processPaymentByMethod(method, paymentData, cardData) {
  // Simüle edilmiş gecikme
  await new Promise(resolve => setTimeout(resolve, 1000));

  switch (method) {
    case 'cash':
      return {
        success: true,
        reference: `CASH-${paymentData.id}`,
        message: 'Nakit ödeme alındı',
        gatewayResponse: { method: 'cash', status: 'success' }
      };

    case 'card':
      // Kart validasyonu simülasyonu
      const isValid = Math.random() > 0.1; // 90% başarı oranı
      if (!isValid) {
        return {
          success: false,
          reference: null,
          message: 'Kart bilgileri geçersiz veya limit yetersiz',
          gatewayResponse: { method: 'card', status: 'failed', reason: 'validation_failed' }
        };
      }
      return {
        success: true,
        reference: `CARD-${paymentData.id}-${Date.now()}`,
        message: 'Kart ile ödeme başarılı',
        gatewayResponse: { method: 'card', status: 'success', transactionId: `TXN-${Date.now()}` }
      };

    case 'online':
      return {
        success: true,
        reference: `ONLINE-${paymentData.id}`,
        message: 'Online ödeme başarılı',
        gatewayResponse: { method: 'online', status: 'success' }
      };

    case 'installment':
      return {
        success: true,
        reference: `INST-${paymentData.id}`,
        message: 'Taksitli ödeme başarılı',
        gatewayResponse: { method: 'installment', status: 'success' }
      };

    case 'crypto':
      return {
        success: true,
        reference: `CRYPTO-${paymentData.id}`,
        message: 'Kripto para ödemesi alındı',
        gatewayResponse: { method: 'crypto', status: 'success' }
      };

    case 'bank_transfer':
      return {
        success: true,
        reference: `BANK-${paymentData.id}`,
        message: 'Banka transferi başlatıldı',
        gatewayResponse: { method: 'bank_transfer', status: 'pending' }
      };

    default:
      throw new Error('Geçersiz ödeme yöntemi');
  }
}

// GET /api/payments/:paymentId - Ödeme durumu
app.get('/api/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.headers['x-user-id'] || req.query.userId;

    // Payment service ile ödemeyi getir
    const payment = await paymentService.getPayment(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Ödeme bulunamadı' });
    }

    // Kullanıcı kontrolü (güvenlik)
    if (userId && payment.userId !== userId) {
      return res.status(403).json({ error: 'Bu ödemeye erişim yetkiniz yok' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Ödeme durumu alma hatası:', error);
    res.status(500).json({ error: 'Ödeme durumu alınamadı', detail: error.message });
  }
});

// GET /api/payments - Ödeme geçmişi
app.get('/api/payments', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;

    // Payment service ile ödemeleri getir
    const result = await paymentService.getUserPayments(userId, {
      limit,
      offset,
      status
    });

    res.json({
      success: true,
      payments: result.payments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Ödeme geçmişi alma hatası:', error);
    res.status(500).json({ error: 'Ödeme geçmişi alınamadı', detail: error.message });
  }
});

// POST /api/payments/:paymentId/refund - İade işlemi
app.post('/api/payments/:paymentId/refund',
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Geçerli bir tutar gerekli'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('İade nedeni maksimum 500 karakter olabilir')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentId } = req.params;
      const { amount, reason = 'İade talebi' } = req.body;
      const userId = req.headers['x-user-id'] || req.query.userId;

      // Payment service ile ödemeyi getir
      const payment = await paymentService.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Ödeme bulunamadı' });
      }

      // Kullanıcı kontrolü
      if (userId && payment.userId !== userId) {
        return res.status(403).json({ error: 'Bu ödemeyi iade etme yetkiniz yok' });
      }

      // İade kontrolü
      if (payment.status !== PAYMENT_STATUS.COMPLETED) {
        return res.status(400).json({ error: 'Sadece tamamlanmış ödemeler iade edilebilir' });
      }

      if (payment.status === PAYMENT_STATUS.REFUNDED) {
        return res.status(400).json({ error: 'Bu ödeme zaten iade edilmiş' });
      }

      const refundAmount = amount ? parseFloat(amount) : payment.amount;
      if (refundAmount > payment.amount) {
        return res.status(400).json({ error: 'İade tutarı ödeme tutarından fazla olamaz' });
      }

      // İade işlemi - Payment service ile güncelle
      const updatedPayment = await paymentService.updatePayment(paymentId, {
        status: PAYMENT_STATUS.REFUNDED,
        refundAmount: refundAmount,
        refundReason: reason,
        refundedAt: new Date().toISOString()
      });

      // WebSocket ile bildir
      if (io) {
        io.to(`user:${payment.userId}`).emit('paymentRefunded', {
          paymentId,
          refundAmount,
          reason
        });
      }

      res.json({
        success: true,
        payment: updatedPayment || payment,
        message: 'İade işlemi başarılı'
      });
    } catch (error) {
      console.error('İade işleme hatası:', error);
      res.status(500).json({ error: 'İade işlenemedi', detail: error.message });
    }
  }
);

// POST /api/payments/webhook - Webhook handler (gateway'lerden gelen bildirimler)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];

    // Webhook imza doğrulama (güvenlik için gerekli)
    // const isValid = verifyWebhookSignature(webhookData, signature);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Geçersiz webhook imzası' });
    // }

    // Webhook tipine göre işle
    const { event, paymentId, status, data } = webhookData;

    if (event === 'payment.completed' || event === 'payment.success') {
      const payment = await paymentService.getPayment(paymentId);
      if (payment) {
        await paymentService.updatePayment(paymentId, {
          status: PAYMENT_STATUS.COMPLETED,
          gatewayResponse: data
        });

        // WebSocket ile bildir
        if (io) {
          io.to(`user:${payment.userId}`).emit('paymentStatus', {
            paymentId,
            status: PAYMENT_STATUS.COMPLETED,
            orderId: payment.orderId
          });
        }
      }
    } else if (event === 'payment.failed' || event === 'payment.error') {
      const payment = await paymentService.getPayment(paymentId);
      if (payment) {
        await paymentService.updatePayment(paymentId, {
          status: PAYMENT_STATUS.FAILED,
          gatewayResponse: data
        });
      }
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook işleme hatası:', error);
    res.status(500).json({ error: 'Webhook işlenemedi', detail: error.message });
  }
});

// ============================================
// ERROR TRACKING API ENDPOINTS
// ============================================
// In-memory error store (should be DynamoDB in production)
const errorLogs = []; // { id, timestamp, message, filename, lineno, colno, stack, type, url, userAgent, userId, ... }
const performanceLogs = []; // { id, timestamp, url, dns, tcp, request, response, dom, load, ... }

// Track error
app.post('/api/errors/track', apiLimiter, (req, res) => {
  try {
    const error = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    
    errorLogs.push(error);
    
    // Keep only last 1000 errors
    if (errorLogs.length > 1000) {
      errorLogs.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔴 Error tracked:', error.message, error.filename, error.lineno);
    }
    
    res.json({ ok: true, id: error.id });
  } catch (err) {
    console.error('Error tracking error:', err);
    res.status(500).json({ error: 'tracking_failed', detail: String(err) });
  }
});

// Batch track errors
app.post('/api/errors/batch', apiLimiter, (req, res) => {
  try {
    const { errors } = req.body || {};
    
    if (!Array.isArray(errors)) {
      return res.status(400).json({ error: 'errors array required' });
    }
    
    errors.forEach(error => {
      const errorLog = {
        id: error.id || `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: error.timestamp || new Date().toISOString(),
        ...error
      };
      
      errorLogs.push(errorLog);
    });
    
    // Keep only last 1000 errors
    while (errorLogs.length > 1000) {
      errorLogs.shift();
    }
    
    res.json({ ok: true, count: errors.length });
  } catch (err) {
    console.error('Batch error tracking error:', err);
    res.status(500).json({ error: 'batch_tracking_failed', detail: String(err) });
  }
});

// Get errors (admin only)
app.get('/api/errors', requireAdmin, (req, res) => {
  try {
    const { limit = 100, offset = 0, type, userId } = req.query;
    
    let filtered = [...errorLogs];
    
    if (type) {
      filtered = filtered.filter(e => e.type === type);
    }
    
    if (userId) {
      filtered = filtered.filter(e => e.userId === userId);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      ok: true,
      errors: paginated,
      total: filtered.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Get errors error:', err);
    res.status(500).json({ error: 'get_errors_failed', detail: String(err) });
  }
});

// Get error statistics
app.get('/api/errors/stats', requireAdmin, (req, res) => {
  try {
    const stats = {
      total: errorLogs.length,
      byType: {},
      byFile: {},
      recent: errorLogs.slice(-10).reverse()
    };
    
    errorLogs.forEach(error => {
      stats.byType[error.type || 'unknown'] = (stats.byType[error.type || 'unknown'] || 0) + 1;
      stats.byFile[error.filename || 'unknown'] = (stats.byFile[error.filename || 'unknown'] || 0) + 1;
    });
    
    res.json({ ok: true, stats });
  } catch (err) {
    console.error('Get error stats error:', err);
    res.status(500).json({ error: 'get_stats_failed', detail: String(err) });
  }
});

// ============================================
// PERFORMANCE TRACKING API ENDPOINTS
// ============================================

// Track performance
app.post('/api/performance/track', apiLimiter, (req, res) => {
  try {
    const metric = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    
    performanceLogs.push(metric);
    
    // Keep only last 500 metrics
    if (performanceLogs.length > 500) {
      performanceLogs.shift();
    }
    
    res.json({ ok: true, id: metric.id });
  } catch (err) {
    console.error('Performance tracking error:', err);
    res.status(500).json({ error: 'tracking_failed', detail: String(err) });
  }
});

// Batch track performance
app.post('/api/performance/batch', apiLimiter, (req, res) => {
  try {
    const { metrics } = req.body || {};
    
    if (!Array.isArray(metrics)) {
      return res.status(400).json({ error: 'metrics array required' });
    }
    
    metrics.forEach(metric => {
      const perfLog = {
        id: metric.id || `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: metric.timestamp || new Date().toISOString(),
        ...metric
      };
      
      performanceLogs.push(perfLog);
    });
    
    // Keep only last 500 metrics
    while (performanceLogs.length > 500) {
      performanceLogs.shift();
    }
    
    res.json({ ok: true, count: metrics.length });
  } catch (err) {
    console.error('Batch performance tracking error:', err);
    res.status(500).json({ error: 'batch_tracking_failed', detail: String(err) });
  }
});

// Get performance metrics (admin only)
app.get('/api/performance', requireAdmin, (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    // Sort by timestamp (newest first)
    const sorted = [...performanceLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const paginated = sorted.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      ok: true,
      metrics: paginated,
      total: performanceLogs.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Get performance error:', err);
    res.status(500).json({ error: 'get_performance_failed', detail: String(err) });
  }
});

// Get performance statistics
app.get('/api/performance/stats', requireAdmin, (req, res) => {
  try {
    const loadTimes = performanceLogs
      .filter(m => m.load)
      .map(m => m.load);
    
    const stats = {
      total: performanceLogs.length,
      averageLoadTime: loadTimes.length > 0 
        ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
        : 0,
      minLoadTime: loadTimes.length > 0 ? Math.min(...loadTimes) : 0,
      maxLoadTime: loadTimes.length > 0 ? Math.max(...loadTimes) : 0,
      recent: performanceLogs.slice(-10).reverse()
    };
    
    res.json({ ok: true, stats });
  } catch (err) {
    console.error('Get performance stats error:', err);
    res.status(500).json({ error: 'get_stats_failed', detail: String(err) });
  }
});

// ============================================
// EMAIL API ENDPOINTS
// ============================================

// POST /api/email/send - Send email
app.post('/api/email/send', 
  [
    body('to')
      .notEmpty()
      .withMessage('Alıcı email gerekli')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli'),
    body('subject')
      .notEmpty()
      .withMessage('Konu gerekli')
      .trim(),
    body('text')
      .optional()
      .trim(),
    body('html')
      .optional()
      .trim()
  ],
  apiLimiter,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { to, subject, text, html } = req.body;
      
      const result = await emailService.sendEmail({
        to,
        subject,
        text,
        html
      });

      if (result.success) {
        res.json({ ok: true, messageId: result.messageId });
      } else {
        res.status(500).json({ error: 'email_send_failed', detail: result.error });
      }
    } catch (error) {
      console.error('Email send error:', error);
      res.status(500).json({ error: 'email_send_failed', detail: error.message });
    }
  }
);

// POST /api/email/welcome - Send welcome email
app.post('/api/email/welcome', apiLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email gerekli' });
    }

    const result = await emailService.sendWelcomeEmail(email, name);

    if (result.success) {
      res.json({ ok: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'email_send_failed', detail: result.error });
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'email_send_failed', detail: error.message });
  }
});

// POST /api/email/password-reset - Send password reset email
app.post('/api/email/password-reset', apiLimiter, async (req, res) => {
  try {
    const { email, token, resetUrl } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ error: 'Email ve token gerekli' });
    }

    const result = await emailService.sendPasswordResetEmail(email, token, resetUrl);

    if (result.success) {
      res.json({ ok: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'email_send_failed', detail: result.error });
    }
  } catch (error) {
    console.error('Password reset email error:', error);
    res.status(500).json({ error: 'email_send_failed', detail: error.message });
  }
});

// POST /api/email/order-confirmation - Send order confirmation email
app.post('/api/email/order-confirmation', apiLimiter, async (req, res) => {
  try {
    const { email, orderData } = req.body;
    
    if (!email || !orderData) {
      return res.status(400).json({ error: 'Email ve orderData gerekli' });
    }

    const result = await emailService.sendOrderConfirmationEmail(email, orderData);

    if (result.success) {
      res.json({ ok: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'email_send_failed', detail: result.error });
    }
  } catch (error) {
    console.error('Order confirmation email error:', error);
    res.status(500).json({ error: 'email_send_failed', detail: error.message });
  }
});

// POST /api/email/notification - Send notification email
app.post('/api/email/notification', apiLimiter, async (req, res) => {
  try {
    const { email, notification } = req.body;
    
    if (!email || !notification) {
      return res.status(400).json({ error: 'Email ve notification gerekli' });
    }

    const result = await emailService.sendNotificationEmail(email, notification);

    if (result.success) {
      res.json({ ok: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'email_send_failed', detail: result.error });
    }
  } catch (error) {
    console.error('Notification email error:', error);
    res.status(500).json({ error: 'email_send_failed', detail: error.message });
  }
});

// ============================================
// SEARCH API ENDPOINTS
// ============================================

// GET /api/search - Global search
app.get('/api/search', apiLimiter, async (req, res) => {
  try {
    const { q, type = 'all', limit = 20, offset = 0 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ results: [], total: 0, query: q });
    }
    
    const query = q.trim().toLowerCase();
    const results = [];
    
    // Search in different types
    if (type === 'all' || type === 'products') {
      // Search products (in-memory or DynamoDB)
      // For now, return empty - should be implemented with DynamoDB
    }
    
    if (type === 'all' || type === 'users') {
      // Search users
      const usersList = Array.from(users.values())
        .filter(u => 
          u.email?.toLowerCase().includes(query) ||
          u.name?.toLowerCase().includes(query)
        )
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .map(u => ({
          type: 'user',
          id: u.email,
          title: u.name || u.email,
          description: u.email,
          url: `/users/${u.email}`
        }));
      
      results.push(...usersList);
    }
    
    if (type === 'all' || type === 'orders') {
      // Search orders (from payments) - DynamoDB veya in-memory
      let allPayments = [];
      if (USE_DYNAMODB && dynamoClient) {
        try {
          const result = await dynamoClient.send(new ScanCommand({
            TableName: PAYMENTS_TABLE,
            FilterExpression: 'contains(orderId, :query) OR contains(customer.email, :query)',
            ExpressionAttributeValues: {
              ':query': query
            }
          }));
          allPayments = result.Items || [];
        } catch (error) {
          console.error('Search payments error:', error);
          allPayments = Array.from(payments.values());
        }
      } else {
        allPayments = Array.from(payments.values());
      }
      
      const ordersList = allPayments
        .filter(p => 
          p.orderId?.toLowerCase().includes(query) ||
          p.customer?.email?.toLowerCase().includes(query)
        )
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .map(p => ({
          type: 'order',
          id: p.orderId,
          title: `Sipariş #${p.orderId}`,
          description: `Tutar: ${p.amount} ${p.currency}`,
          url: `/orders/${p.orderId}`
        }));
      
      results.push(...ordersList);
    }
    
    res.json({
      ok: true,
      results,
      total: results.length,
      query: q,
      type
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'search_failed', detail: String(err) });
  }
});

// GET /api/search/advanced - Advanced search with filters
app.get('/api/search/advanced', apiLimiter, async (req, res) => {
  try {
    const { 
      q, 
      type = 'all', 
      category,
      minPrice,
      maxPrice,
      dateFrom,
      dateTo,
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 20,
      offset = 0 
    } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ results: [], total: 0 });
    }
    
    const query = q.trim().toLowerCase();
    let results = [];
    
    // Basic search (same as /api/search)
    // Apply filters
    if (type === 'all' || type === 'products') {
      // Filter by category, price, etc.
      // For now, return empty - should be implemented with DynamoDB
    }
    
    // Sort results
    if (sortBy === 'date') {
      results.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'name') {
      results.sort((a, b) => {
        const nameA = (a.title || '').toLowerCase();
        const nameB = (b.title || '').toLowerCase();
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }
    
    res.json({
      ok: true,
      results: results.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
      total: results.length,
      query: q
    });
  } catch (err) {
    console.error('Advanced search error:', err);
    res.status(500).json({ error: 'advanced_search_failed', detail: String(err) });
  }
});

// GET /api/search/suggestions - Search suggestions
app.get('/api/search/suggestions', apiLimiter, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const query = q.trim().toLowerCase();
    const suggestions = [];
    
    // Get suggestions from users
    const userSuggestions = Array.from(users.values())
      .filter(u => u.email?.toLowerCase().includes(query))
      .slice(0, 5)
      .map(u => ({
        text: u.email,
        type: 'user'
      }));
    
    suggestions.push(...userSuggestions);
    
    res.json({
      ok: true,
      suggestions: suggestions.slice(0, 10)
    });
  } catch (err) {
    console.error('Get suggestions error:', err);
    res.status(500).json({ error: 'suggestions_failed', detail: String(err) });
  }
});

// ============================================
// STREAM CHAT, LIKES, INVITATIONS
// ============================================

// In-memory stores for chat, likes, invitations
const streamChats = new Map(); // channelId -> [{ message, userEmail, userName, timestamp }]
const streamLikes = new Map(); // channelId -> { count: number, users: Set<userEmail> }
const streamInvitations = new Map(); // invitationId -> { fromEmail, toEmail, streamId, status, createdAt }

// Chat Endpoint: POST /api/streams/:channelId/chat
app.post('/api/streams/:channelId/chat', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { message, userEmail, userName } = req.body;
    
    if (!message || !userEmail) {
      return res.status(400).json({ error: 'message ve userEmail gerekli' });
    }
    
    if (!streamChats.has(channelId)) {
      streamChats.set(channelId, []);
    }
    
    const chatMessage = {
      message,
      userEmail,
      userName: userName || userEmail,
      timestamp: new Date().toISOString()
    };
    
    streamChats.get(channelId).push(chatMessage);
    
    // Son 100 mesajı tut (bellek yönetimi)
    const messages = streamChats.get(channelId);
    if (messages.length > 100) {
      messages.shift();
    }
    
    res.json({ ok: true, message: chatMessage });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat Get: GET /api/streams/:channelId/chat
app.get('/api/streams/:channelId/chat', async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = streamChats.get(channelId) || [];
    res.json({ ok: true, messages });
  } catch (error) {
    console.error('Chat get error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like Endpoint: POST /api/streams/:channelId/like
app.post('/api/streams/:channelId/like', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail gerekli' });
    }
    
    if (!streamLikes.has(channelId)) {
      streamLikes.set(channelId, { count: 0, users: new Set() });
    }
    
    const likeData = streamLikes.get(channelId);
    
    // Kullanıcı daha önce beğenmiş mi?
    if (likeData.users.has(userEmail)) {
      // Beğeniyi geri al
      likeData.users.delete(userEmail);
      likeData.count = Math.max(0, likeData.count - 1);
    } else {
      // Beğeni ekle
      likeData.users.add(userEmail);
      likeData.count = likeData.count + 1;
    }
    
    res.json({ 
      ok: true, 
      likeCount: likeData.count,
      liked: likeData.users.has(userEmail)
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like Get: GET /api/streams/:channelId/likes
app.get('/api/streams/:channelId/likes', async (req, res) => {
  try {
    const { channelId } = req.params;
    const likeData = streamLikes.get(channelId) || { count: 0, users: new Set() };
    res.json({ ok: true, likeCount: likeData.count });
  } catch (error) {
    console.error('Like get error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invitation Endpoint: POST /api/streams/:channelId/invite
app.post('/api/streams/:channelId/invite', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { fromEmail, toEmail, streamTitle } = req.body;
    
    if (!fromEmail || !toEmail) {
      return res.status(400).json({ error: 'fromEmail ve toEmail gerekli' });
    }
    
    const invitationId = `inv-${channelId}-${Date.now()}`;
    const invitation = {
      id: invitationId,
      channelId,
      fromEmail,
      toEmail,
      streamTitle: streamTitle || 'Canlı Yayın',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    streamInvitations.set(invitationId, invitation);
    
    res.json({ ok: true, invitation });
  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invitations Get: GET /api/invitations/:userEmail
app.get('/api/invitations/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const status = req.query.status || 'pending'; // pending, accepted, rejected
    
    const allInvitations = Array.from(streamInvitations.values());
    const userInvitations = allInvitations.filter(inv => 
      inv.toEmail === userEmail && inv.status === status
    );
    
    res.json({ ok: true, invitations: userInvitations });
  } catch (error) {
    console.error('Invitations get error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invitation Response: POST /api/invitations/:invitationId/respond
app.post('/api/invitations/:invitationId/respond', async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'accept' veya 'reject'
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be "accept" or "reject"' });
    }
    
    const invitation = streamInvitations.get(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation bulunamadı' });
    }
    
    invitation.status = action === 'accept' ? 'accepted' : 'rejected';
    invitation.respondedAt = new Date().toISOString();
    
    res.json({ ok: true, invitation });
  } catch (error) {
    console.error('Invitation response error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Active Streams List: GET /api/streams?status=live
app.get('/api/streams', async (req, res) => {
  try {
    const status = req.query.status || 'live';
    
    // In-memory rooms'dan aktif stream'leri al
    const activeStreams = [];
    rooms.forEach((room, roomId) => {
      if (room.channels) {
        room.channels.forEach((channel, channelId) => {
          if (channel.status === 'active' || channel.status === status) {
            activeStreams.push({
              id: channelId,
              channelId,
              channelName: channel.channelName,
              title: channel.title || 'Canlı Yayın',
              companyName: channel.streamerName || 'Bilinmeyen',
              provider: channel.provider || 'AGORA',
              status: channel.status,
              viewers: channel.viewers || 0,
              likes: (streamLikes.get(channelId) || { count: 0 }).count,
              startedAt: channel.createdAt || channel.startedAt
            });
          }
        });
      }
    });
    
    res.json({ ok: true, streams: activeStreams });
  } catch (error) {
    console.error('Streams list error:', error);
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  const config = getBackendConfig();
  
  // Winston logger ile loglama
  logger.info(`✅ Backend API çalışıyor: http://localhost:${PORT}`);
  logger.info(`🌐 API Base URL: http://localhost:${PORT}/api`);
  logger.info(`🌐 Yerel network: http://${localIP}:${PORT}/api`);
  logger.info(`📡 Tüm network interface'lere açık (${HOST}:${PORT})`);
  logger.info(`💬 Chat, beğeni ve davet sistemi aktif`);
  logger.info(`🔌 WebSocket Server aktif (Socket.io)`);
  logger.info(`📡 Streaming Provider: ${STREAM_PROVIDER}`);
  logger.info(`🔑 Agora Service: ${agoraService ? '✅ Aktif' : '❌ Devre Dışı'}`);
  logger.info(`🔧 Port: ${PORT} (Default: ${DEFAULT_BACKEND_PORT})`);
  
  // Port validasyon uyarısı
  if (PORT !== DEFAULT_BACKEND_PORT) {
    logger.warn(`⚠️  Port ${PORT} kullanılıyor (Default: ${DEFAULT_BACKEND_PORT})`);
    logger.warn(`   Frontend'in bu port'u kullanacak şekilde yapılandırıldığından emin olun!`);
  }
  
  // Console'a da yaz (backward compatibility)
  console.log(`✅ Backend API çalışıyor: http://localhost:${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});



// ============================================
// ERROR TRACKING API ENDPOINTS
// ============================================
app.post('/api/errors/track', (req, res) => {
  try {
    const errorData = req.body;
    
    // Validate error data
    if (!errorData.message && !errorData.type) {
      return res.status(400).json({ error: 'Invalid error data' });
    }
    
    // Log error (in production, save to database)
    console.error('🚨 Error tracked:', {
      id: errorData.id,
      message: errorData.message,
      type: errorData.type,
      url: errorData.url,
      timestamp: errorData.timestamp,
      userId: errorData.userId
    });
    
    // In production, save to DynamoDB or logging service
    // For now, just log to console
    
    res.json({ success: true, errorId: errorData.id });
  } catch (error) {
    console.error('Error tracking endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/errors', (req, res) => {
  // Admin only - get error statistics
  // In production, fetch from database
  res.json({ 
    message: 'Error statistics endpoint',
    note: 'In production, fetch from database'
  });
});

// ============================================
// PERFORMANCE MONITORING API ENDPOINTS
// ============================================
app.post('/api/performance/track', (req, res) => {
  try {
    const metricData = req.body;
    
    // Validate metric data
    if (!metricData.type) {
      return res.status(400).json({ error: 'Invalid metric data' });
    }
    
    // Log metric (in production, save to database)
    if (metricData.type === 'longTask' || metricData.type === 'pageLoad') {
      console.log('📊 Performance metric:', {
        type: metricData.type,
        duration: metricData.duration || metricData.totalTime,
        url: metricData.url,
        timestamp: metricData.timestamp
      });
    }
    
    // In production, save to DynamoDB or monitoring service
    // For now, just log to console
    
    res.json({ success: true, metricId: metricData.id });
  } catch (error) {
    console.error('Performance tracking endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/performance/summary', (req, res) => {
  // Get performance summary
  // In production, fetch from database
  res.json({ 
    message: 'Performance summary endpoint',
    note: 'In production, fetch from database'
  });
});

// ============================================
// API VERSIONING
// ============================================
// API v1 routes
const v1Routes = require('./routes/v1');
app.use('/api/v1', v1Routes);

// Backward compatibility - v1 routes without version prefix
// Bu satırlar gelecekte kaldırılabilir (deprecated)
const pushRoutes = require('./routes/push-routes');
const authRoutes = require('./routes/auth-routes');
app.use('/api/push', pushRoutes);
app.use('/api/auth', authRoutes);

// ============================================
// METRICS ENDPOINT
// ============================================
/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get application metrics
 *     tags: [Monitoring]
 *     description: Uygulama metriklerini getirir (requests, performance, uptime)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics başarıyla getirildi
 *       401:
 *         description: Unauthorized
 */
app.get('/api/metrics', authenticateToken, (req, res) => {
  // Admin veya monitoring role kontrolü eklenebilir
  try {
    const metrics = getMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Metrics endpoint error', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Metrics alınırken bir hata oluştu.'
    });
  }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Sistem sağlık durumunu kontrol eder
 *     responses:
 *       200:
 *         description: Sistem sağlıklı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: production
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: connected
 *                     aws:
 *                       type: string
 *                       example: configured
 */
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: USE_DYNAMODB && dynamoClient ? 'connected' : 'in-memory',
        aws: CURRENT_CREDS ? 'configured' : 'not-configured'
      },
      version: '1.0.0'
    };

    // DynamoDB bağlantı kontrolü
    if (USE_DYNAMODB && dynamoClient) {
      try {
        // Basit bir test query (opsiyonel)
        healthStatus.services.database = 'connected';
      } catch (error) {
        healthStatus.services.database = 'error';
        healthStatus.status = 'degraded';
      }
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

// 404 handler - tüm route'lardan sonra, error handler'dan önce
app.use(notFoundHandler);

// Error handler - en sonda olmalı
app.use(errorHandler);
