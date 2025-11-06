// User Service - DynamoDB ve in-memory fallback
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Bu dosya app.js'den import edilecek
// app.js'deki getUser ve saveUser fonksiyonlarını buraya taşıyoruz

let dynamoClient = null;
let users = null; // In-memory fallback
const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS || 'basvideo-users';
const USE_DYNAMODB = process.env.USE_DYNAMODB !== 'false';

/**
 * User service'i initialize et
 * @param {DynamoDBDocumentClient} client - DynamoDB client
 * @param {Map} usersMap - In-memory users map (fallback)
 */
function initializeUserService(client, usersMap) {
  dynamoClient = client;
  users = usersMap;
}

/**
 * Kullanıcıyı email ile getir
 * @param {string} email - Kullanıcı email'i
 * @returns {Promise<Object|null>} Kullanıcı objesi veya null
 */
async function getUser(email) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return users ? users.get(email) || null : null;
  }

  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    }));
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getUser error:', error);
    // Fallback to in-memory
    return users ? users.get(email) || null : null;
  }
}

/**
 * Kullanıcıyı kaydet
 * @param {Object} userData - Kullanıcı verisi
 * @returns {Promise<void>}
 */
async function saveUser(userData) {
  if (!USE_DYNAMODB || !dynamoClient) {
    if (users) {
      users.set(userData.email, userData);
    }
    return;
  }

  try {
    await dynamoClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        email: userData.email,
        password: userData.password,
        companyName: userData.companyName || '',
        role: userData.role || 'user',
        phone: userData.phone || '',
        address: userData.address || '',
        hasTime: userData.hasTime || false,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...userData
      }
    }));
  } catch (error) {
    console.error('DynamoDB saveUser error:', error);
    // Fallback to in-memory
    if (users) {
      users.set(userData.email, userData);
    }
  }
}

/**
 * Kullanıcı şifresini güncelle
 * @param {string} email - Kullanıcı email'i
 * @param {string} hashedPassword - Hash'lenmiş şifre
 * @returns {Promise<void>}
 */
async function updateUserPassword(email, hashedPassword) {
  const user = await getUser(email);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  user.password = hashedPassword;
  user.updatedAt = new Date().toISOString();
  await saveUser(user);
}

module.exports = {
  initializeUserService,
  getUser,
  saveUser,
  updateUserPassword
};


