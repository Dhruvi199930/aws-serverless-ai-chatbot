const { 
  getMessages, 
  saveMessage, 
  getConversation, 
  createConversation, 
  updateConversationTitle 
} = require('../services/dynamoService');
const { streamChatCompletion } = require('../services/openaiService');

/**
 * Handle streaming chat request
 */
async function handleChatStream(req, res) {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized JWT Token' });
    return;
  }

  const { conversationId, message, apiKey, model, attachment } = req.body;
  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  // Combine attachment content if provided
  let fullPrompt = message.trim();
  if (attachment && attachment.content) {
    fullPrompt = `[Attached Document: ${attachment.name}]\n${attachment.content}\n\n[User Instruction]: ${message.trim()}`;
  }

  // Setup Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let targetConversationId = conversationId;
  let isNewConversation = false;

  // Create conversation if none provided
  if (!targetConversationId) {
    isNewConversation = true;
    targetConversationId = 'conv_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const now = new Date().toISOString();
    
    // Auto generate title from first prompt
    const displayMessage = attachment ? `[Doc] ${attachment.name}` : message.trim();
    const shortTitle = displayMessage.slice(0, 32) + (displayMessage.length > 32 ? '...' : '');

    await createConversation({
      userId,
      conversationId: targetConversationId,
      title: shortTitle,
      model: model || 'gpt-4o-mini',
      createdAt: now,
      updatedAt: now
    });

    // Notify client of conversationId
    res.write(`data: ${JSON.stringify({ type: 'meta', conversationId: targetConversationId, title: shortTitle })}\n\n`);
  }

  // Save User message in DynamoDB
  const userMsgId = 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const nowTs = new Date().toISOString();
  await saveMessage({
    conversationId: targetConversationId,
    messageId: userMsgId,
    role: 'user',
    content: fullPrompt,
    timestamp: nowTs
  });

  // Fetch message context for OpenAI API call
  const priorMessages = await getMessages(targetConversationId);
  const formattedMessages = priorMessages.map(m => ({ role: m.role, content: m.content }));

  let fullAssistantResponse = '';

  try {
    await streamChatCompletion({
      messages: formattedMessages,
      model: model || 'gpt-4o-mini',
      apiKey,
      onChunk: (chunk) => {
        fullAssistantResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }
    });

    // Save Assistant message in DynamoDB
    const assistantMsgId = 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    await saveMessage({
      conversationId: targetConversationId,
      messageId: assistantMsgId,
      role: 'assistant',
      content: fullAssistantResponse,
      timestamp: new Date().toISOString()
    });

    // Send final event tag
    res.write(`data: ${JSON.stringify({ type: 'done', fullContent: fullAssistantResponse })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Streaming Chat Error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
}

module.exports = {
  handleChatStream
};
