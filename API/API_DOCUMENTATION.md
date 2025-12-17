# PoultryPal API Documentation

## Overview

The PoultryPal API is a RESTful service for managing poultry farm operations, including user management, batch tracking, production monitoring, and health diagnostics.

**Base URL**: `http://localhost:3000/api/v1`
**Version**: 1.0.0
**Environment**: Development

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with a dual-token system:

- **Access Token**: Short-lived (1 hour), sent in `Authorization` header
- **Refresh Token**: Long-lived (7 days), sent as httpOnly cookie

### Authentication Flow

1. **Sign Up / Login**: Receive access token and refresh token
2. **API Requests**: Include access token in header: `Authorization: Bearer <token>`
3. **Token Refresh**: When access token expires, use refresh endpoint to get new one
4. **Logout**: Clear refresh token cookie

### Example: Login
```bash
# Login
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'

# Response
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "Manager",
    "farmId": "farm-123"
  }
}
```

### Example: Authenticated Request
```bash
curl -X GET http://localhost:3000/api/v1/farm/123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Endpoints

### Health & Monitoring

#### GET /health
Check API health status
```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T08:37:00.000Z",
  "uptime": 345.678,
  "environment": "development",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "type": "MongoDB"
  },
  "memory": {
    "heapUsed": "42MB",
    "heapTotal": "64MB",
    "rss": "85MB"
  }
}
```

#### GET /ready
Kubernetes readiness probe
```bash
curl http://localhost:3000/api/v1/ready
```

#### GET /alive
Kubernetes liveness probe
```bash
curl http://localhost:3000/api/v1/alive
```

#### GET /metrics
Application metrics
```bash
curl http://localhost:3000/api/v1/metrics
```

### Authentication Endpoints

#### POST /user/signup
Register a new user and create a farm
```bash
curl -X POST http://localhost:3000/api/v1/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Request Body**:
```json
{
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)"
}
```

**Response** (201):
```json
{
  "message": "User and Farm created successfully",
  "user": {
    "id": "uuid",
    "farmId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Manager"
  },
  "farm": {
    "id": "uuid",
    "name": "John's Farm"
  }
}
```

#### POST /user/login
Authenticate user
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response** (200):
```json
{
  "message": "Login successful",
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Manager",
    "farmId": "uuid"
  }
}
```

#### POST /user/refresh
Refresh access token
```bash
curl -X POST http://localhost:3000/api/v1/user/refresh \
  --cookie "refreshToken=jwt-refresh-token"
```

#### POST /user/logout
Logout user (clear refresh token)
```bash
curl -X POST http://localhost:3000/api/v1/user/logout
```

#### POST /user/forgot-password
Request password reset
```bash
curl -X POST http://localhost:3000/api/v1/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### POST /user/reset-password/:token
Reset password with token
```bash
curl -X POST http://localhost:3000/api/v1/user/reset-password/reset-token-here \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass123!"
  }'
```

#### POST /user/send-verification
Send email verification
```bash
curl -X POST http://localhost:3000/api/v1/user/send-verification \
  -H "Authorization: Bearer jwt-token"
```

#### GET /user/verify-email/:token
Verify email with token
```bash
curl http://localhost:3000/api/v1/user/verify-email/verification-token
```

#### POST /user/register
Register a new staff member (requires authentication)
```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "role": "Worker",
    "contact": "+1234567890"
  }'
```

#### GET /user/staff
Get all staff members for a farm (requires authentication)
```bash
curl -X GET http://localhost:3000/api/v1/user/staff \
  -H "Authorization: Bearer jwt-token"
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
Invalid input data
```json
{
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
Missing or invalid authentication
```json
{
  "success": false,
  "message": "No token provided" | "Invalid token" | "Token expired"
}
```

### 403 Forbidden
Insufficient permissions
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
Resource not found
```json
{
  "message": "Resource not found"
}
```

### 429 Too Many Requests
Rate limit exceeded
```json
{
  "message": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
Server error
```json
{
  "message": "Internal server error",
  "error": "Error description (in development only)"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints** (`/login`, `/signup`, `/forgot-password`, `/reset-password`): 5 requests per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702742400
```

## Request Tracking

Every request includes tracking headers:

**Request Headers** (optional):
- `X-Request-ID`: Unique request identifier (auto-generated if not provided)

**Response Headers**:
- `X-Request-ID`: Unique request identifier
- `X-Response-Time`: Request duration in milliseconds

Example:
```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Response-Time: 45ms
```

## Swagger Documentation

Interactive API documentation is available at:

**URL**: `http://localhost:3000/api/v1/docs`

The Swagger UI provides:
- Interactive API exploration
- Request/response examples
- Schema definitions
- Try-it-out functionality

## Best Practices

### Security
1. **Always use HTTPS in production**
2. **Store access tokens securely** (memory, not localStorage)
3. **Handle token expiration** gracefully
4. **Never log passwords** or sensitive data
5. **Validate all input** on client side before sending

### Performance
1. **Cache responses** when appropriate
2. **Use compression** for large payloads
3. **Implement pagination** for list endpoints
4. **Monitor response times** via X-Response-Time header

### Error Handling
1. **Check status codes** before parsing response
2. **Handle network errors** gracefully
3. **Implement retry logic** for transient errors
4. **Log errors** with request ID for debugging

### Example: Robust API Call
```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    // Store access token (not in localStorage for security)
    sessionStorage.setItem('accessToken', data.accessToken);

    return data.user;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}
```

## Development

### Running Locally
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run migrations
npm run migrate:up

# Start development server
npm run dev

# Run tests
npm test
```

### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/poultrypal

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:5173

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## Support

- **API Issues**: Check logs with request ID
- **Documentation**: `/api/v1/docs` (Swagger UI)
- **Health Status**: `/api/v1/health`
- **Metrics**: `/api/v1/metrics`

## Changelog

### Version 1.0.0 (2025-12-16)
- Initial API release
- User authentication with JWT
- Password reset functionality
- Email verification
- Health check endpoints
- Request tracking and metrics
- Comprehensive monitoring

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update Swagger documentation
4. Run `npm test` before committing
5. Check code coverage with `npm run test:coverage`
