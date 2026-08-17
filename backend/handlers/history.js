const {
  listUserConversations,
  getConversation,
  createConversation,
  deleteConversation,
  getMessages
} = require('../services/dynamoService');

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}

/**
 * List user conversations
 */
exports.listConversations = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.lambda?.userId || event.user?.userId;
    if (!userId) return response(401, { error: 'Unauthorized' });

    const conversations = await listUserConversations(userId);
    return response(200, { conversations });
  } catch (err) {
    console.error('List Conversations Error:', err);
    return response(500, { error: err.message });
  }
};

/**
 * Get messages for a conversation
 */
exports.getConversationMessages = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.lambda?.userId || event.user?.userId;
    const conversationId = event.pathParameters?.conversationId || event.params?.conversationId;

    if (!userId) return response(401, { error: 'Unauthorized' });
    if (!conversationId) return response(400, { error: 'Missing conversationId' });

    const conversation = await getConversation(userId, conversationId);
    if (!conversation) {
      return response(404, { error: 'Conversation not found' });
    }

    const messages = await getMessages(conversationId);
    return response(200, { conversation, messages });
  } catch (err) {
    console.error('Get Messages Error:', err);
    return response(500, { error: err.message });
  }
};

/**
 * Create a new conversation
 */
exports.createNewConversation = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.lambda?.userId || event.user?.userId;
    if (!userId) return response(401, { error: 'Unauthorized' });

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const conversationId = 'conv_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const now = new Date().toISOString();

    const conversation = {
      userId,
      conversationId,
      title: body.title || 'New Serverless Chat',
      model: body.model || 'gpt-4o-mini',
      createdAt: now,
      updatedAt: now
    };

    await createConversation(conversation);
    return response(201, { conversation });
  } catch (err) {
    console.error('Create Conversation Error:', err);
    return response(500, { error: err.message });
  }
};

/**
 * Delete a conversation
 */
exports.removeConversation = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.lambda?.userId || event.user?.userId;
    const conversationId = event.pathParameters?.conversationId || event.params?.conversationId;

    if (!userId) return response(401, { error: 'Unauthorized' });
    if (!conversationId) return response(400, { error: 'Missing conversationId' });

    await deleteConversation(userId, conversationId);
    return response(200, { message: 'Conversation deleted successfully', conversationId });
  } catch (err) {
    console.error('Delete Conversation Error:', err);
    return response(500, { error: err.message });
  }
};
