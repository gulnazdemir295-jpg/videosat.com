// Message Service - DynamoDB ve in-memory fallback
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

let dynamoClient = null;
let messages = null; // In-memory fallback
let userMessages = null; // In-memory fallback
const MESSAGES_TABLE = process.env.DYNAMODB_TABLE_MESSAGES || 'basvideo-messages';
const USE_DYNAMODB = process.env.USE_DYNAMODB !== 'false';

/**
 * Message service'i initialize et
 * @param {DynamoDBDocumentClient} client - DynamoDB client
 * @param {Map} messagesMap - In-memory messages map (fallback)
 * @param {Map} userMessagesMap - In-memory userMessages map (fallback)
 */
function initializeMessageService(client, messagesMap, userMessagesMap) {
  dynamoClient = client;
  messages = messagesMap;
  userMessages = userMessagesMap;
}

/**
 * Mesaj kaydet
 * @param {Object} messageData - Mesaj verisi
 * @returns {Promise<void>}
 */
async function saveMessage(messageData) {
  if (!USE_DYNAMODB || !dynamoClient) {
    // In-memory fallback
    if (messages) {
      messages.set(messageData.id, messageData);
    }
    if (userMessages) {
      const fromUserId = messageData.senderId;
      const toUserId = messageData.receiverId;
      
      if (!userMessages.has(fromUserId)) {
        userMessages.set(fromUserId, []);
      }
      if (!userMessages.has(toUserId)) {
        userMessages.set(toUserId, []);
      }
      userMessages.get(fromUserId).push(messageData.id);
      userMessages.get(toUserId).push(messageData.id);
    }
    return;
  }

  try {
    await dynamoClient.send(new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: {
        messageId: messageData.id.toString(),
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        message: messageData.message,
        type: messageData.type || 'text',
        metadata: messageData.metadata || {},
        timestamp: messageData.timestamp || new Date().toISOString(),
        read: messageData.read || false,
        readAt: messageData.readAt || null,
        status: messageData.status || 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error('DynamoDB saveMessage error:', error);
    // Fallback to in-memory
    if (messages) {
      messages.set(messageData.id, messageData);
    }
  }
}

/**
 * Mesaj getir
 * @param {string} messageId - Mesaj ID
 * @returns {Promise<Object|null>} Mesaj objesi veya null
 */
async function getMessage(messageId) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return messages ? messages.get(messageId) || null : null;
  }

  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: MESSAGES_TABLE,
      Key: { messageId: messageId.toString() }
    }));
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getMessage error:', error);
    return messages ? messages.get(messageId) || null : null;
  }
}

/**
 * Kullanıcının mesajlarını getir
 * @param {string} userId - Kullanıcı ID
 * @param {string} otherUserId - Diğer kullanıcı ID (opsiyonel)
 * @param {number} limit - Limit
 * @returns {Promise<Array>} Mesaj listesi
 */
async function getUserMessages(userId, otherUserId = null, limit = 50) {
  if (!USE_DYNAMODB || !dynamoClient) {
    // In-memory fallback
    if (!userMessages || !messages) {
      return [];
    }
    
    let messageIds = userMessages.get(userId) || [];
    
    if (otherUserId) {
      messageIds = messageIds.filter(id => {
        const msg = messages.get(id);
        return msg && (msg.senderId === otherUserId || msg.receiverId === otherUserId);
      });
    }
    
    return messageIds
      .map(id => messages.get(id))
      .filter(msg => msg)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  try {
    let result;
    
    if (otherUserId) {
      // Belirli bir kullanıcıyla olan mesajlar
      // GSI kullanarak sorgula (senderId-receiverId index)
      result = await dynamoClient.send(new QueryCommand({
        TableName: MESSAGES_TABLE,
        IndexName: 'senderId-receiverId-index', // GSI oluşturman gerekebilir
        KeyConditionExpression: 'senderId = :userId AND receiverId = :otherUserId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':otherUserId': otherUserId
        },
        Limit: limit,
        ScanIndexForward: false // Yeni -> eski
      }));
    } else {
      // Tüm mesajlar (sender veya receiver olarak)
      // Scan kullan (performans için GSI önerilir)
      result = await dynamoClient.send(new ScanCommand({
        TableName: MESSAGES_TABLE,
        FilterExpression: 'senderId = :userId OR receiverId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        Limit: limit
      }));
    }
    
    const items = result.Items || [];
    return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    console.error('DynamoDB getUserMessages error:', error);
    // Fallback to in-memory
    if (!userMessages || !messages) {
      return [];
    }
    let messageIds = userMessages.get(userId) || [];
    if (otherUserId) {
      messageIds = messageIds.filter(id => {
        const msg = messages.get(id);
        return msg && (msg.senderId === otherUserId || msg.receiverId === otherUserId);
      });
    }
    return messageIds
      .map(id => messages.get(id))
      .filter(msg => msg)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }
}

/**
 * Mesajı okundu işaretle
 * @param {string} messageId - Mesaj ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<Object|null>} Güncellenmiş mesaj veya null
 */
async function markMessageAsRead(messageId, userId) {
  if (!USE_DYNAMODB || !dynamoClient) {
    // In-memory fallback
    if (!messages) {
      return null;
    }
    const message = messages.get(messageId);
    if (!message || message.receiverId !== userId) {
      return null;
    }
    message.read = true;
    message.readAt = new Date().toISOString();
    messages.set(messageId, message);
    return message;
  }

  try {
    // Önce mesajı getir
    const message = await getMessage(messageId);
    if (!message || message.receiverId !== userId) {
      return null;
    }

    // Güncelle
    await dynamoClient.send(new UpdateCommand({
      TableName: MESSAGES_TABLE,
      Key: { messageId: messageId.toString() },
      UpdateExpression: 'SET #read = :read, readAt = :readAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#read': 'read'
      },
      ExpressionAttributeValues: {
        ':read': true,
        ':readAt': new Date().toISOString(),
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }));

    return { ...message, read: true, readAt: new Date().toISOString() };
  } catch (error) {
    console.error('DynamoDB markMessageAsRead error:', error);
    // Fallback to in-memory
    if (messages) {
      const message = messages.get(messageId);
      if (message && message.receiverId === userId) {
        message.read = true;
        message.readAt = new Date().toISOString();
        messages.set(messageId, message);
        return message;
      }
    }
    return null;
  }
}

module.exports = {
  initializeMessageService,
  saveMessage,
  getMessage,
  getUserMessages,
  markMessageAsRead
};

