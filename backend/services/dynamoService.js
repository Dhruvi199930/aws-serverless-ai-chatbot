const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  DeleteCommand, 
  ScanCommand 
} = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

// Determine environment
const IS_AWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
const LOCAL_DB_PATH = path.join(__dirname, '../.data/local_dynamo.json');

// Ensure local directory exists for file-backed persistent storage in local dev mode
if (!IS_AWS) {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Local persistent DB helper
function loadLocalData() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    return { users: [], conversations: [], messages: [] };
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], conversations: [], messages: [] };
  }
}

function saveLocalData(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// AWS DynamoDB Client setup
let docClient = null;
if (IS_AWS) {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
  docClient = DynamoDBDocumentClient.from(client);
}

const USERS_TABLE = process.env.USERS_TABLE || 'ChatbotUsers';
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE || 'ChatbotConversations';
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'ChatbotMessages';

/**
 * User Operations
 */
async function createUser(user) {
  if (IS_AWS) {
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    }));
    return user;
  } else {
    const db = loadLocalData();
    const existing = db.users.find(u => u.email === user.email);
    if (existing) {
      throw new Error('User already exists');
    }
    db.users.push(user);
    saveLocalData(db);
    return user;
  }
}

async function getUserByEmail(email) {
  if (IS_AWS) {
    const result = await docClient.send(new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } else {
    const db = loadLocalData();
    return db.users.find(u => u.email === email) || null;
  }
}

async function getUserById(userId) {
  if (IS_AWS) {
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId }
    }));
    return result.Item || null;
  } else {
    const db = loadLocalData();
    return db.users.find(u => u.userId === userId) || null;
  }
}

/**
 * Conversation Operations
 */
async function createConversation(conversation) {
  if (IS_AWS) {
    await docClient.send(new PutCommand({
      TableName: CONVERSATIONS_TABLE,
      Item: conversation
    }));
    return conversation;
  } else {
    const db = loadLocalData();
    db.conversations.push(conversation);
    saveLocalData(db);
    return conversation;
  }
}

async function listUserConversations(userId) {
  if (IS_AWS) {
    const result = await docClient.send(new QueryCommand({
      TableName: CONVERSATIONS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false // latest first
    }));
    return result.Items || [];
  } else {
    const db = loadLocalData();
    return db.conversations
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }
}

async function getConversation(userId, conversationId) {
  if (IS_AWS) {
    const result = await docClient.send(new GetCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: { userId, conversationId }
    }));
    return result.Item || null;
  } else {
    const db = loadLocalData();
    return db.conversations.find(c => c.userId === userId && c.conversationId === conversationId) || null;
  }
}

async function updateConversationTitle(userId, conversationId, title) {
  const updatedAt = new Date().toISOString();
  if (IS_AWS) {
    const item = await getConversation(userId, conversationId);
    if (item) {
      item.title = title;
      item.updatedAt = updatedAt;
      await createConversation(item);
    }
  } else {
    const db = loadLocalData();
    const conv = db.conversations.find(c => c.userId === userId && c.conversationId === conversationId);
    if (conv) {
      conv.title = title;
      conv.updatedAt = updatedAt;
      saveLocalData(db);
    }
  }
}

async function deleteConversation(userId, conversationId) {
  if (IS_AWS) {
    await docClient.send(new DeleteCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: { userId, conversationId }
    }));
    // Delete associated messages
    const messages = await getMessages(conversationId);
    for (const msg of messages) {
      await docClient.send(new DeleteCommand({
        TableName: MESSAGES_TABLE,
        Key: { conversationId, messageId: msg.messageId }
      }));
    }
  } else {
    const db = loadLocalData();
    db.conversations = db.conversations.filter(c => !(c.userId === userId && c.conversationId === conversationId));
    db.messages = db.messages.filter(m => m.conversationId !== conversationId);
    saveLocalData(db);
  }
}

/**
 * Message Operations
 */
async function saveMessage(message) {
  if (IS_AWS) {
    await docClient.send(new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: message
    }));
  } else {
    const db = loadLocalData();
    db.messages.push(message);
    saveLocalData(db);
  }
  return message;
}

async function getMessages(conversationId) {
  if (IS_AWS) {
    const result = await docClient.send(new QueryCommand({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'conversationId = :cid',
      ExpressionAttributeValues: { ':cid': conversationId },
      ScanIndexForward: true // chronological order
    }));
    return result.Items || [];
  } else {
    const db = loadLocalData();
    return db.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  createConversation,
  listUserConversations,
  getConversation,
  updateConversationTitle,
  deleteConversation,
  saveMessage,
  getMessages
};
