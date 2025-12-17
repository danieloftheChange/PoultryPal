# PoultryPal API

> Modern, secure REST API for poultry farm management built with Node.js, Express, and MongoDB

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-success)](.)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Structure](#api-structure)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

The PoultryPal API is a comprehensive backend service designed to manage all aspects of poultry farm operations. It provides secure authentication, batch tracking, production monitoring, health diagnostics, and real-time analytics.

**Key Capabilities:**
- User authentication with JWT dual-token system
- Farm and batch management
- Production tracking and analytics
- Health monitoring and diagnostics
- Real-time metrics and monitoring
- Comprehensive security features

## Features

### Core Features
- ✅ **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (Manager, Supervisor, Worker)
  - Password reset and email verification
  - Secure httpOnly refresh token cookies

- ✅ **Farm Management**
  - Multi-farm support
  - Staff management with role assignments
  - Farm-specific data isolation

- ✅ **Batch & House Management**
  - Batch lifecycle tracking
  - House/shed management
  - Stock inventory management

- ✅ **Production Monitoring**
  - Daily production recording
  - Mortality tracking
  - Feed consumption monitoring
  - Analytics and reporting

- ✅ **Health & Diagnostics**
  - Health check endpoints
  - Disease diagnosis support
  - Monitoring dashboards

### Technical Features
- ✅ **Security**
  - Helmet.js security headers
  - HTTPS enforcement in production
  - Rate limiting on all endpoints
  - Input validation with Joi
  - SQL injection and XSS protection

- ✅ **Monitoring & Observability**
  - Health check endpoints (`/health`, `/ready`, `/alive`)
  - Metrics collection and exposure
  - Request tracking with unique IDs
  - Response time measurement
  - Structured logging with Winston

- ✅ **Quality & Testing**
  - Comprehensive unit tests (40+ tests)
  - 70%+ code coverage
  - CI/CD with GitHub Actions
  - Database migrations with rollback support

- ✅ **Developer Experience**
  - Swagger/OpenAPI documentation
  - Docker support with multi-stage builds
  - Hot reload in development
  - ESLint code quality checks

## Tech Stack

### Core
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js 4.21+
- **Database**: MongoDB 6.9+ with Mongoose ODM
- **Authentication**: JSON Web Tokens (jsonwebtoken)

### Security
- **Helmet.js** - Security headers
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting
- **Joi** - Input validation
- **CORS** - Cross-origin resource sharing

### Development & Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **mongodb-memory-server** - In-memory database for tests
- **ESLint** - Code linting
- **Nodemon** - Development hot reload

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **migrate-mongo** - Database migrations
- **Winston** - Logging

## Getting Started

### Prerequisites

- **Node.js**: 18.x or 20.x LTS ([Download](https://nodejs.org/))
- **MongoDB**: 6.0+ ([Download](https://www.mongodb.com/try/download/community))
- **npm**: 9.0+ (comes with Node.js)
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/poultrypal.git
   cd poultrypal/API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Configuration

Create a `.env` file in the API directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/poultrypal

# JWT (Generate secure secrets: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:5173

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**Generate Secure JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running Locally

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

2. **Run database migrations**
   ```bash
   npm run migrate:up
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

4. **Verify the server is running**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

## Documentation

### API Documentation

- **Swagger UI**: http://localhost:3000/api/v1/docs
- **API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Migrations**: See [migrations/README.md](./migrations/README.md)

### Quick API Reference

```bash
# Health check
GET /api/v1/health

# User signup
POST /api/v1/user/signup
Content-Type: application/json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# User login
POST /api/v1/user/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Protected endpoint (requires authentication)
GET /api/v1/farm/:farmId
Authorization: Bearer <access-token>
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- src/users/__tests__/users.controller.test.js
```

### Run Tests in CI Mode
```bash
npm run test:ci
```

### Test Coverage Thresholds

The project enforces coverage thresholds per module:
- **User Module**: 70% coverage
- **Health Module**: 80-100% coverage
- **Validators**: 100% coverage
- **Metrics**: 80% coverage

Current test suite:
- **40+ tests** covering authentication, health checks, and security
- **Average runtime**: 5-6 seconds

## Deployment

### Using Docker

1. **Build the image**
   ```bash
   docker build -t poultrypal-api:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f api
   ```

### Using Docker Compose (Production)

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Traditional Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Pre-deployment checklist
- Environment setup
- Security audit
- Database migrations
- Kubernetes deployment
- PM2 process management
- Rollback procedures

## API Structure

```
API/
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection
│   ├── errorHandler.js    # Global error handling
│   ├── helmet.config.js   # Security headers
│   ├── logger.js          # Winston logging
│   ├── metrics.js         # Metrics collection
│   ├── rateLimiter.js     # Rate limiting
│   ├── requestTracking.js # Request ID & timing
│   └── swagger.js         # API documentation
│
├── src/                   # Source code
│   ├── common/           # Shared utilities
│   │   ├── middlewares/  # Custom middleware
│   │   └── validators/   # Input validation
│   ├── batch/            # Batch management
│   ├── diagnosis/        # Health diagnostics
│   ├── farm/             # Farm management
│   ├── health/           # Health check endpoints
│   ├── house/            # House/shed management
│   ├── monitoring/       # Monitoring endpoints
│   ├── production/       # Production tracking
│   ├── stock/            # Stock management
│   └── users/            # User management & auth
│
├── test/                  # Test files
│   ├── setup.js          # Test environment setup
│   ├── helpers/          # Test utilities
│   └── security-headers.test.js
│
├── migrations/            # Database migrations
│
├── .github/              # GitHub Actions CI/CD
│   └── workflows/
│       └── api-ci.yml
│
├── app.js                # Express app configuration
├── server.js             # Server entry point
├── jest.config.js        # Jest configuration
├── docker-compose.yml    # Docker development setup
├── docker-compose.prod.yml  # Docker production setup
├── Dockerfile            # Multi-stage Docker build
└── .env.example          # Environment template
```

## Security

### Security Features

1. **Authentication & Authorization**
   - JWT-based authentication with short-lived access tokens (1 hour)
   - Secure httpOnly refresh tokens (7 days)
   - Password hashing with bcrypt (10 rounds)
   - Role-based access control

2. **API Security**
   - Helmet.js for security headers (CSP, HSTS, X-Frame-Options, etc.)
   - HTTPS enforcement in production
   - CORS configuration with allowed origins
   - Rate limiting (100 req/15min general, 5 req/15min auth)
   - Input validation with Joi schemas

3. **Data Protection**
   - Environment variables for secrets
   - No hardcoded credentials
   - Secure cookie attributes (httpOnly, secure, sameSite)
   - Request tracking for audit trails

4. **Monitoring & Auditing**
   - Structured logging with Winston
   - Request ID tracking
   - Error tracking with context
   - Security header verification tests

### Security Best Practices

- ✅ All secrets stored in environment variables
- ✅ Password complexity requirements enforced
- ✅ JWT secrets minimum 32 characters in production
- ✅ HTTPS enforced in production
- ✅ Security headers set via Helmet.js
- ✅ Rate limiting on all endpoints
- ✅ Input validation on all routes
- ✅ SQL injection protection via Mongoose
- ✅ XSS protection via Helmet CSP

### Security Audit

Run security audit:
```bash
npm audit

# Fix vulnerabilities
npm audit fix
```

## Contributing

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   npm run lint
   npm test
   npm run test:coverage
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Standards

- **ESLint**: No errors allowed
- **Tests**: All tests must pass
- **Coverage**: Meet module-specific thresholds
- **Console.log**: Not allowed in source (use logger)
- **Documentation**: Update API docs for endpoint changes

### Commit Message Format

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Scripts Reference

```bash
# Development
npm run dev              # Start with hot reload
npm start               # Start production server

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:ci         # Run tests in CI mode

# Code Quality
npm run lint            # Run ESLint

# Database
npm run migrate:up      # Run migrations
npm run migrate:down    # Rollback last migration
npm run migrate:status  # Check migration status
npm run migrate:create  # Create new migration
npm run seed            # Seed database

# Maintenance
npm audit               # Check for vulnerabilities
npm update              # Update dependencies
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | 3000 | Server port |
| `NODE_ENV` | Yes | development | Environment (development/production/test) |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | JWT access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | - | JWT refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | 1h | Access token expiration |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token expiration |
| `CORS_ORIGINS` | No | http://localhost:5173 | Allowed CORS origins |
| `FRONTEND_URL` | No | http://localhost:5173 | Frontend URL for emails |
| `LOG_LEVEL` | No | info | Logging level |

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
mongosh

# Check connection string in .env
echo $MONGODB_URI
```

**Tests Failing**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18.x or 20.x
```

**Port Already in Use**
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill -9
```

**JWT Secret Too Short**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## License

ISC © PoultryPal

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/poultrypal/issues)
- **Documentation**: See `/docs` folder
- **API Docs**: http://localhost:3000/api/v1/docs

---

**Built with ❤️ for poultry farm management**
