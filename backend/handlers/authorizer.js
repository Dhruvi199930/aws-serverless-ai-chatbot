const { verifyToken } = require('../services/authService');

/**
 * AWS Lambda Custom Authorizer for API Gateway HTTP API / REST API
 * Verifies Authorization: Bearer <JWT_TOKEN>
 */
exports.handler = async (event) => {
  try {
    const token = extractToken(event);
    if (!token) {
      return generatePolicy('user', 'Deny', event.methodArn || '*');
    }

    const decoded = verifyToken(token);
    return generatePolicy(decoded.sub, 'Allow', event.methodArn || '*', {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name || ''
    });
  } catch (err) {
    console.error('Authorizer Error:', err.message);
    return generatePolicy('user', 'Deny', event.methodArn || '*');
  }
};

function extractToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  return parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : null;
}

function generatePolicy(principalId, effect, resource, context = {}) {
  const authResponse = {
    principalId,
    context
  };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    };
  }

  return authResponse;
};
