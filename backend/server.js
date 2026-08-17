const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { register, login } = require('./handlers/auth');
const { 
  listConversations, 
  getConversationMessages, 
  createNewConversation, 
  removeConversation 
} = require('./handlers/history');
const { handleChatStream } = require('./handlers/chat');
const { verifyToken } = require('./services/authService');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Simulated AWS Lambda Telemetry middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = 'aws-req-' + Math.random().toString(36).substring(2, 10);
  
  res.setHeader('X-Amzn-RequestId', requestId);
  res.setHeader('X-Amzn-Trace-Id', `Root=1-${Math.floor(Date.now() / 1000).toString(16)}-${Math.random().toString(16).substring(2, 26)}`);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[AWS API Gateway] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms) [ReqID: ${requestId}]`);
  });
  
  next();
});

// Simulated AWS JWT Lambda Authorizer Middleware
const jwtAuthorizer = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired JWT token' });
  }
};

/**
 * API Routes mapping AWS Lambda Handlers
 */

// Health & AWS System Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AWS Serverless AI Chatbot Microservice',
    region: process.env.AWS_REGION || 'us-east-1',
    lambdaRuntime: 'Node.js 20.x',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  const lambdaResult = await register({ body: JSON.stringify(req.body) });
  res.status(lambdaResult.statusCode).json(JSON.parse(lambdaResult.body));
});

app.post('/api/auth/login', async (req, res) => {
  const lambdaResult = await login({ body: JSON.stringify(req.body) });
  res.status(lambdaResult.statusCode).json(JSON.parse(lambdaResult.body));
});

// Conversation History Routes (Protected by JWT Authorizer)
app.get('/api/conversations', jwtAuthorizer, async (req, res) => {
  const lambdaResult = await listConversations({ user: req.user });
  res.status(lambdaResult.statusCode).json(JSON.parse(lambdaResult.body));
});

app.post('/api/conversations', jwtAuthorizer, async (req, res) => {
  const lambdaResult = await createNewConversation({ user: req.user, body: JSON.stringify(req.body) });
  res.status(lambdaResult.statusCode).json(JSON.parse(lambdaResult.body));
});

app.get('/api/conversations/:conversationId/messages', jwtAuthorizer, async (req, res) => {
  const lambdaResult = await getConversationMessages({ 
    user: req.user, 
    pathParameters: { conversationId: req.params.conversationId } 
  });
  res.status(lambdaResult.statusCode).json(JSON.parse(lambdaResult.body));
});

app.delete('/api/conversations/:conversationId', jwtAuthorizer, async (req, res) => {
  const lambdaResult = await removeConversation({ 
    user: req.user, 
    pathParameters: { conversationId: req.params.conversationId } 
  });
  res.status(lambdaResult.statusCode).json(JSON.parse(lambdaResult.body));
});

// Streaming Chat Route (Protected by JWT Authorizer)
app.post('/api/chat', jwtAuthorizer, handleChatStream);

app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🚀 AWS Serverless Chatbot Backend running on port ${PORT}`);
  console.log(`⚡ API Gateway Endpoint: http://localhost:${PORT}/api`);
  console.log(`=======================================================\n`);
});
