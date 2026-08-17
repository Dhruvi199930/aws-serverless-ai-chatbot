const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const { createUser, getUserByEmail } = require('../services/dynamoService');

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
 * Register Handler
 */
exports.register = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const { name, email, password } = body;

    if (!email || !password) {
      return response(400, { error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return response(400, { error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await getUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return response(409, { error: 'User with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    
    const newUser = {
      userId,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await createUser(newUser);
    const token = generateToken(newUser);

    return response(201, {
      message: 'User registered successfully',
      token,
      user: {
        userId: newUser.userId,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    return response(500, { error: err.message || 'Internal server error' });
  }
};

/**
 * Login Handler
 */
exports.login = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const { email, password } = body;

    if (!email || !password) {
      return response(400, { error: 'Email and password are required' });
    }

    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return response(401, { error: 'Invalid email or password' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return response(401, { error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return response(200, {
      message: 'Authentication successful',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return response(500, { error: err.message || 'Internal server error' });
  }
};
