const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Get stored JWT Authorization header
 */
function getAuthHeaders() {
  const token = localStorage.getItem('chatbot_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Authentication Endpoints
 */
export const authApi = {
  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  }
};

/**
 * Conversation History Endpoints
 */
export const conversationsApi = {
  async list() {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list conversations');
    return data.conversations || [];
  },

  async getMessages(conversationId) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get messages');
    return data;
  },

  async create(title = 'New Serverless Chat', model = 'gpt-4o-mini') {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, model })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create conversation');
    return data.conversation;
  },

  async delete(conversationId) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete conversation');
    return data;
  }
};

/**
 * Streaming Response SSE Fetch Reader
 */
export async function streamChatResponse({ 
  conversationId, 
  message, 
  apiKey, 
  model, 
  attachment,
  onMeta, 
  onChunk, 
  onDone, 
  onError, 
  signal 
}) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, message, apiKey, model, attachment }),
      signal
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Serverless request failed' }));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep remaining partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'meta') {
              if (onMeta) onMeta(event);
            } else if (event.type === 'chunk') {
              if (onChunk) onChunk(event.content);
            } else if (event.type === 'done') {
              if (onDone) onDone(event.fullContent);
            } else if (event.type === 'error') {
              if (onError) onError(event.error);
            }
          } catch (e) {
            console.warn('Failed to parse SSE JSON:', jsonStr);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream request aborted by user');
    } else {
      if (onError) onError(err.message);
    }
  }
}
