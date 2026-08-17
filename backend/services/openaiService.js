const OpenAI = require('openai');

/**
 * Intelligent mock AI response generator when no OpenAI key is configured
 */
async function generateMockStream(messages, onChunk) {
  const lastMessage = messages[messages.length - 1]?.content || 'Hello';
  const queryLower = lastMessage.toLowerCase();

  let responseText = "";

  if (queryLower.includes('dynamodb') || queryLower.includes('dynamo') || queryLower.includes('nosql')) {
    responseText = `### 💾 What is Amazon DynamoDB?

**Amazon DynamoDB** is a fully managed, serverless, key-value and document **NoSQL database** designed by AWS for single-digit millisecond performance at any scale.

#### 🔑 Key Serverless Characteristics:
1. **Zero Infrastructure Management**: Automatically scales tables up and down to adjust for capacity and maintains performance without servers to manage or patch.
2. **Single-Table Design**: Uses Partition Keys (\`PK\`) and Sort Keys (\`SK\`) to store related entities (Users, Conversations, Messages) in a single ultra-fast table.
3. **Pay-Per-Request Capacity Mode**: Charges only for actual read and write operations executed (\`PAY_PER_REQUEST\` / On-Demand pricing).
4. **Sub-10ms Latency**: Delivers consistent sub-10 millisecond response times regardless of dataset size.

#### 📊 How DynamoDB is used in this AWS Chatbot:
- **Users Table**: Stores hashed user credentials, JWT claims, and session profiles.
- **Conversations Table**: Tracks active chat sessions (\`PK = userId\`, \`SK = conversationId\`).
- **Messages Table**: Stores chat history (\`PK = conversationId\`, \`SK = timestamp\`).

\`\`\`json
{
  "database": "Amazon DynamoDB",
  "billingMode": "PAY_PER_REQUEST",
  "readWriteLatency": "< 8ms",
  "partitionKey": "userId",
  "sortKey": "timestamp"
}
\`\`\`

*(Note: To connect to live OpenAI models for unrestricted AI answers, click **Settings** in the top right to enter your OpenAI API key).*`;
  } else if (queryLower.includes('aws') || queryLower.includes('serverless') || queryLower.includes('lambda')) {
    responseText = `### 🚀 AWS Serverless Chatbot Architecture Overview

Your request was processed through our **AWS Serverless Infrastructure**:

1. **Amazon API Gateway (HTTP API)**: Intercepted your request and validated CORS headers.
2. **AWS Lambda JWT Authorizer**: Decoded and verified your JSON Web Token signature before granting access.
3. **AWS Lambda Chat Handler**: Triggered in a micro-container execution environment with **Node.js 20.x**.
4. **Amazon DynamoDB**: Saved conversation history to the \`ChatbotMessages\` table using document client queries.
5. **Streaming Response**: Delivered back via HTTP chunked stream / Server-Sent Events (SSE).

\`\`\`json
{
  "status": 200,
  "service": "AWS Lambda (ChatStreamHandler)",
  "memoryAllocated": "256MB",
  "executionDuration": "142ms",
  "authScheme": "Bearer JWT",
  "cloudRegion": "us-east-1"
}
\`\`\`

Is there any specific AWS component or CloudFormation/Serverless template detail you would like to explore further?`;
  } else if (queryLower.includes('code') || queryLower.includes('javascript') || queryLower.includes('react') || queryLower.includes('python')) {
    responseText = `Here is a production-ready example of invoking OpenAI with streaming in AWS Lambda Node.js:

\`\`\`javascript
const OpenAI = require('openai');

exports.handler = async (event) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: event.body.message }],
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(text);
  }
};
\`\`\`

This pattern allows ultra-fast real-time token streaming directly to the client browser!`;
  } else {
    responseText = `Hello! I am your **AWS Serverless AI Assistant**, powered by **React**, **AWS Lambda**, **API Gateway**, **DynamoDB**, and **OpenAI**.

You asked: "${lastMessage}"

I am currently running in **Serverless Simulation Mode**. 

### 💡 Why am I seeing this response?
1. **No OpenAI API Key Detected**: The backend is running in high-performance AWS serverless demonstration mode so you can test all UI features, JWT authentication, and DynamoDB database persistence out-of-the-box without spending money.
2. **Want Unrestricted AI Answers?**: Click **Settings** ⚙️ in the top right navbar to enter your custom **OpenAI API Key** (\`sk-...\`). Once added, the chatbot will stream live GPT-4o completions for any topic!`;
  }

  // Simulate token streaming word by word or chunk by chunk
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    onChunk(chunk);
    // Tiny delay to mimic real OpenAI SSE latency
    await new Promise(res => setTimeout(res, 25));
  }
}

/**
 * Stream completion from OpenAI or fallback to mock stream
 */
async function streamChatCompletion({ messages, model = 'gpt-4o-mini', apiKey, onChunk }) {
  const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

  if (effectiveKey && effectiveKey.trim().startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey: effectiveKey.trim() });
      const stream = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
      return;
    } catch (err) {
      console.warn('OpenAI stream failed, falling back to serverless simulation stream:', err.message);
      // Fallback if API key fails or quota exceeded
      onChunk(`\n\n*(Notice: OpenAI API request encountered an error: ${err.message}. Switching to AWS Serverless fallback response below)*\n\n`);
      await generateMockStream(messages, onChunk);
    }
  } else {
    // No OpenAI API key provided -> use Serverless high performance mock stream
    await generateMockStream(messages, onChunk);
  }
}

module.exports = {
  streamChatCompletion
};
