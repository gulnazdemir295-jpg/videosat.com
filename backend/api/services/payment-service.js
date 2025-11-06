// Payment Service - DynamoDB ve in-memory fallback
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

let dynamoClient = null;
let payments = null; // In-memory fallback
let userPayments = null; // In-memory fallback
const PAYMENTS_TABLE = process.env.DYNAMODB_TABLE_PAYMENTS || 'basvideo-payments';
const USE_DYNAMODB = process.env.USE_DYNAMODB !== 'false';

/**
 * Payment service'i initialize et
 * @param {DynamoDBDocumentClient} client - DynamoDB client
 * @param {Map} paymentsMap - In-memory payments map (fallback)
 * @param {Map} userPaymentsMap - In-memory userPayments map (fallback)
 */
function initializePaymentService(client, paymentsMap, userPaymentsMap) {
  dynamoClient = client;
  payments = paymentsMap;
  userPayments = userPaymentsMap;
}

/**
 * Ödeme kaydet
 * @param {Object} paymentData - Ödeme verisi
 * @returns {Promise<void>}
 */
async function savePayment(paymentData) {
  if (!USE_DYNAMODB || !dynamoClient) {
    // In-memory fallback
    if (payments) {
      payments.set(paymentData.id, paymentData);
    }
    if (userPayments) {
      const userId = paymentData.userId;
      if (!userPayments.has(userId)) {
        userPayments.set(userId, []);
      }
      userPayments.get(userId).push(paymentData.id);
    }
    return;
  }

  try {
    await dynamoClient.send(new PutCommand({
      TableName: PAYMENTS_TABLE,
      Item: {
        paymentId: paymentData.id,
        orderId: paymentData.orderId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'TRY',
        method: paymentData.method,
        status: paymentData.status,
        customer: paymentData.customer || {},
        cardData: paymentData.cardData || null,
        metadata: paymentData.metadata || {},
        reference: paymentData.reference || null,
        gatewayResponse: paymentData.gatewayResponse || null,
        refundAmount: paymentData.refundAmount || null,
        refundReason: paymentData.refundReason || null,
        refundedAt: paymentData.refundedAt || null,
        createdAt: paymentData.createdAt || new Date().toISOString(),
        updatedAt: paymentData.updatedAt || new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error('DynamoDB savePayment error:', error);
    // Fallback to in-memory
    if (payments) {
      payments.set(paymentData.id, paymentData);
    }
    if (userPayments) {
      const userId = paymentData.userId;
      if (!userPayments.has(userId)) {
        userPayments.set(userId, []);
      }
      userPayments.get(userId).push(paymentData.id);
    }
  }
}

/**
 * Ödeme getir
 * @param {string} paymentId - Ödeme ID
 * @returns {Promise<Object|null>} Ödeme objesi veya null
 */
async function getPayment(paymentId) {
  if (!USE_DYNAMODB || !dynamoClient) {
    return payments ? payments.get(paymentId) || null : null;
  }

  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: PAYMENTS_TABLE,
      Key: { paymentId }
    }));
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getPayment error:', error);
    return payments ? payments.get(paymentId) || null : null;
  }
}

/**
 * Kullanıcının ödemelerini getir
 * @param {string} userId - Kullanıcı ID
 * @param {Object} options - Seçenekler (limit, offset, status)
 * @returns {Promise<Object>} Ödeme listesi ve pagination bilgisi
 */
async function getUserPayments(userId, options = {}) {
  const { limit = 50, offset = 0, status = null } = options;

  if (!USE_DYNAMODB || !dynamoClient) {
    // In-memory fallback
    if (!userPayments || !payments) {
      return { payments: [], pagination: { total: 0, limit, offset, hasMore: false } };
    }
    
    let paymentIds = userPayments.get(userId) || [];
    let userPaymentsList = paymentIds
      .map(id => payments.get(id))
      .filter(payment => payment);

    // Status filtresi
    if (status) {
      userPaymentsList = userPaymentsList.filter(p => p.status === status);
    }

    // Tarihe göre sırala (yeni -> eski)
    userPaymentsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = userPaymentsList.length;
    const paginatedPayments = userPaymentsList.slice(offset, offset + limit);

    return {
      payments: paginatedPayments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  try {
    // GSI kullanarak sorgula (userId-index)
    let result;
    
    if (status) {
      result = await dynamoClient.send(new QueryCommand({
        TableName: PAYMENTS_TABLE,
        IndexName: 'userId-status-index', // GSI oluşturman gerekebilir
        KeyConditionExpression: 'userId = :userId AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':status': status
        },
        Limit: limit,
        ScanIndexForward: false // Yeni -> eski
      }));
    } else {
      result = await dynamoClient.send(new QueryCommand({
        TableName: PAYMENTS_TABLE,
        IndexName: 'userId-index', // GSI oluşturman gerekebilir
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        Limit: limit,
        ScanIndexForward: false // Yeni -> eski
      }));
    }

    const items = result.Items || [];
    const total = result.Count || items.length;

    return {
      payments: items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: items.length === limit
      }
    };
  } catch (error) {
    console.error('DynamoDB getUserPayments error:', error);
    // Fallback to in-memory
    if (!userPayments || !payments) {
      return { payments: [], pagination: { total: 0, limit, offset, hasMore: false } };
    }
    let paymentIds = userPayments.get(userId) || [];
    let userPaymentsList = paymentIds
      .map(id => payments.get(id))
      .filter(payment => payment);
    if (status) {
      userPaymentsList = userPaymentsList.filter(p => p.status === status);
    }
    userPaymentsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = userPaymentsList.length;
    const paginatedPayments = userPaymentsList.slice(offset, offset + limit);
    return {
      payments: paginatedPayments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }
}

/**
 * Ödeme durumunu güncelle
 * @param {string} paymentId - Ödeme ID
 * @param {Object} updates - Güncellemeler
 * @returns {Promise<Object|null>} Güncellenmiş ödeme veya null
 */
async function updatePayment(paymentId, updates) {
  if (!USE_DYNAMODB || !dynamoClient) {
    // In-memory fallback
    if (!payments) {
      return null;
    }
    const payment = payments.get(paymentId);
    if (!payment) {
      return null;
    }
    Object.assign(payment, updates, { updatedAt: new Date().toISOString() });
    payments.set(paymentId, payment);
    return payment;
  }

  try {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = updates[key];
    });

    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamoClient.send(new UpdateCommand({
      TableName: PAYMENTS_TABLE,
      Key: { paymentId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes || null;
  } catch (error) {
    console.error('DynamoDB updatePayment error:', error);
    // Fallback to in-memory
    if (payments) {
      const payment = payments.get(paymentId);
      if (payment) {
        Object.assign(payment, updates, { updatedAt: new Date().toISOString() });
        payments.set(paymentId, payment);
        return payment;
      }
    }
    return null;
  }
}

module.exports = {
  initializePaymentService,
  savePayment,
  getPayment,
  getUserPayments,
  updatePayment
};

