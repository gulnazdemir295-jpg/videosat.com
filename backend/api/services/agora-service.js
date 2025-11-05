/**
 * Agora.io Service
 * AWS IVS alternatifi olarak Agora.io entegrasyonu
 */

const crypto = require('crypto');

// Agora Configuration
const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';
const AGORA_EXPIRE_TIME = 3600; // 1 saat (token süresi)

/**
 * Agora RTC Token oluştur (Version 2)
 * @param {string} channelName - Channel adı
 * @param {string|number} uid - User ID (0 = random)
 * @param {number} role - 1 = publisher, 2 = subscriber
 * @returns {string} Token
 */
function generateRtcToken(channelName, uid = 0, role = 1) {
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    throw new Error('Agora App ID ve App Certificate gerekli');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + AGORA_EXPIRE_TIME;
  
  // UID'yi number'a çevir
  const uidNumber = typeof uid === 'string' ? parseInt(uid) || 0 : uid;

  // Token Version 2 formatı
  // Message: appId + channelName + uid (32-bit) + expire (32-bit) + salt (32-bit) + role (32-bit)
  const messageBuffer = Buffer.alloc(4 + AGORA_APP_ID.length + channelName.length + 4 + 4 + 4 + 4);
  let offset = 0;
  
  // App ID
  messageBuffer.write(AGORA_APP_ID, offset, 'utf8');
  offset += AGORA_APP_ID.length;
  
  // Channel Name
  messageBuffer.write(channelName, offset, 'utf8');
  offset += channelName.length;
  
  // UID (32-bit)
  messageBuffer.writeUInt32BE(uidNumber, offset);
  offset += 4;
  
  // Expire timestamp (32-bit)
  messageBuffer.writeUInt32BE(expireTimestamp, offset);
  offset += 4;
  
  // Salt (32-bit random)
  const salt = crypto.randomBytes(4);
  salt.copy(messageBuffer, offset);
  offset += 4;
  
  // Role (32-bit)
  messageBuffer.writeUInt32BE(role, offset);
  
  // HMAC SHA256 signature
  const signature = crypto.createHmac('sha256', Buffer.from(AGORA_APP_CERTIFICATE, 'utf8'))
    .update(messageBuffer)
    .digest();

  // Token: version (1 byte) + message + signature
  const tokenBuffer = Buffer.concat([
    Buffer.from([0x02]), // Version 2
    messageBuffer,
    signature
  ]);

  // Base64 encode
  return tokenBuffer.toString('base64');
}

/**
 * Agora channel oluştur (token ile)
 * @param {string} channelName - Channel adı
 * @param {string} userId - User ID
 * @returns {object} Channel bilgileri
 */
function createChannel(channelName, userId = '0') {
  try {
    if (!AGORA_APP_ID) {
      throw new Error('Agora App ID gerekli');
    }

    // Publisher token (yayıncı için)
    const publisherToken = generateRtcToken(channelName, userId, 1);
    
    // Subscriber token (izleyici için)
    const subscriberToken = generateRtcToken(channelName, userId, 2);

    return {
      ok: true,
      channelName: channelName,
      appId: AGORA_APP_ID,
      publisherToken: publisherToken,
      subscriberToken: subscriberToken,
      uid: userId,
      // Agora için playback URL (RTMP push için)
      rtmpUrl: `rtmp://live.agora.io:1935/live/${channelName}`,
      // HLS playback URL (Agora Cloud Recording ile)
      hlsUrl: `https://live.agora.io/${AGORA_APP_ID}/${channelName}/playlist.m3u8`,
      // WebRTC için bilgiler
      webrtc: {
        appId: AGORA_APP_ID,
        channelName: channelName,
        token: publisherToken,
        uid: parseInt(userId) || 0
      }
    };
  } catch (error) {
    console.error('Agora createChannel error:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}

/**
 * Agora token yenile
 * @param {string} channelName - Channel adı
 * @param {string} userId - User ID
 * @param {number} role - 1 = publisher, 2 = subscriber
 * @returns {string} Yeni token
 */
function refreshToken(channelName, userId = '0', role = 1) {
  try {
    return generateRtcToken(channelName, userId, role);
  } catch (error) {
    console.error('Agora refreshToken error:', error);
    throw error;
  }
}

module.exports = {
  createChannel,
  refreshToken,
  generateRtcToken
};

