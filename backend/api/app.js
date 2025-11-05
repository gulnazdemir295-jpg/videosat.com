require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

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
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

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
app.post('/api/admin/ivs/assign', async (req, res) => {
  const { userEmail, endpoint, playbackUrl, streamKey } = req.body || {};
  if (!userEmail || !endpoint || !playbackUrl || !streamKey) {
    return res.status(400).json({ error: 'userEmail, endpoint, playbackUrl, streamKey required' });
  }
  ivsAssignments.set(userEmail, { endpoint, playbackUrl, streamKey });
  const existingUser = await getUser(userEmail);
  if (!existingUser) {
    await saveUser({ email: userEmail, hasTime: true });
  }
  res.json({ ok: true });
});

// --- Streamers and payments (POC) ---
// streamerEmail -> { email, minutesPurchased: number, minutesUsed: number }
const streamers = new Map();
// simple payments log
const payments = [];

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
  payments.push({ id: Date.now(), email, minutes: Math.floor(minutes), at: new Date().toISOString() });
  return res.json({ ok: true, streamer: s });
});

// Admin: list streamers
app.get('/api/admin/streamers', requireAdmin, (req, res) => {
  return res.json({ streamers: Array.from(streamers.values()) });
});

// Admin: list payments
app.get('/api/admin/payments', requireAdmin, (req, res) => {
  return res.json({ payments });
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
app.post('/api/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { streamerEmail, streamerName, deviceInfo } = req.body || {};
    
    if (!streamerEmail) {
      return res.status(400).json({ error: 'streamerEmail required' });
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

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  const config = getBackendConfig();
  console.log(`✅ Backend API çalışıyor: http://localhost:${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Yerel network: http://${localIP}:${PORT}/api`);
  console.log(`📡 Tüm network interface'lere açık (${HOST}:${PORT})`);
  console.log(`💬 Chat, beğeni ve davet sistemi aktif`);
  console.log(`📡 Streaming Provider: ${STREAM_PROVIDER}`);
  console.log(`🔑 Agora Service: ${agoraService ? '✅ Aktif' : '❌ Devre Dışı'}`);
  console.log(`🔧 Port: ${PORT} (Default: ${DEFAULT_BACKEND_PORT})`);
  
  // Port validasyon uyarısı
  if (PORT !== DEFAULT_BACKEND_PORT) {
    console.log(`⚠️  Port ${PORT} kullanılıyor (Default: ${DEFAULT_BACKEND_PORT})`);
    console.log(`   Frontend'in bu port'u kullanacak şekilde yapılandırıldığından emin olun!`);
  }
});


