# PoultryPal - Intelligent Poultry Farm Management System

[![Security](https://img.shields.io/badge/security-hardened-green.svg)](./SECURITY.md)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](./API/coverage)
[![Coverage](https://img.shields.io/badge/coverage-75%25-yellow.svg)](./API/coverage)

**BSSE 4105 | GROUP-9**

PoultryPal is a comprehensive farm management system designed to help poultry farmers optimize operations, monitor bird health, manage inventory, and make data-driven decisions using AI-powered disease diagnosis.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

### Core Functionality
- Farm Management - Multi-farm support with role-based access control
- Batch Tracking - Monitor bird batches from arrival to sale
- House Management - Track housing allocations and capacity
- Production Monitoring - Real-time egg production and mortality tracking
- Health Management - Vaccination schedules and disease diagnosis
- Inventory Control - Stock management for feed, medication, and equipment
- AI Disease Diagnosis - Image-based disease detection
- Analytics Dashboard - Comprehensive reports and insights

### Security Features
- JWT Authentication - Secure token-based authentication
- Role-Based Access Control - Manager and Worker roles
- Rate Limiting - Protection against brute force attacks
- Input Validation - Joi-based validation for all API inputs
- Strong Password Requirements - 8+ chars with complexity
- CORS Protection - Environment-based allowed origins
- Security Headers - Helmet.js for XSS and clickjacking protection
- HTTPS Enforcement - Automatic HTTP to HTTPS redirects
- Comprehensive Logging - Winston-based logging

---

## Architecture

```
PoultryPal/
├── API/                      # Backend (Node.js + Express)
├── Web-App/                  # Frontend (React + TypeScript + Vite)
├── FeedOptimizer/           # Python feed optimization service
└── docs/                    # Documentation
```

### Tech Stack

**Backend:** Node.js 18+, Express.js, MongoDB, Mongoose, JWT, Joi, Winston, Helmet.js, Jest
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zod, Axios, Firebase
**AI/ML:** Python, FastAPI, TensorFlow/PyTorch

---

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- MongoDB 6.x or higher
- Python 3.9+ (for FeedOptimizer)
- Git

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kalibbalajohnson/Poultry-Management-System.git
cd Poultry-Management-System
```

### 2. Set Up Environment Variables

#### Backend (API)

```bash
cd API
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/poultrypal
JWT_SECRET=your-256-bit-secret-here
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Generate Secure Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Frontend (Web-App)

```bash
cd ../Web-App
cp .env.example .env
```

### 3. Install Dependencies

```bash
# Backend
cd API && npm install

# Frontend
cd ../Web-App && npm install
```

### 4. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 5. Run the Application

```bash
# Terminal 1 - Backend
cd API && npm run dev

# Terminal 2 - Frontend
cd Web-App && npm run dev
```

#### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- API Docs: http://localhost:3000/api/v1/docs

---

## Environment Setup

See detailed setup instructions in the documentation:
- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Database Setup](./docs/DATABASE_SETUP.md)
- [Firebase Setup](./docs/FIREBASE_SETUP.md)

---

## Running Tests

```bash
cd API

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Coverage Thresholds:** 70% (Statements, Branches, Functions, Lines)

---

## API Documentation

Visit http://localhost:3000/api/v1/docs for interactive Swagger documentation.

### Authentication

Login example:
```bash
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "YourP@ssw0rd123"
}
```

Tokens are set as httpOnly cookies (accessToken, refreshToken).

---

## Security

### Security Features

- JWT authentication with refresh tokens
- Role-based access control
- Rate limiting (5 login attempts/15min)
- Input validation (Joi)
- XSS protection
- CSRF protection
- Security headers (Helmet.js)
- HTTPS enforcement
- Comprehensive logging

### Security Best Practices

1. Never commit secrets - Use .env files
2. Rotate secrets regularly
3. Use HTTPS in production
4. Keep dependencies updated - Run npm audit
5. Review logs for suspicious activity
6. Backup database regularly

See [SECURITY.md](./SECURITY.md) for details.

---

## Deployment

### Production Checklist

- [ ] All environment variables configured
- [ ] JWT secrets are strong random values
- [ ] Database has strong password
- [ ] SSL/TLS certificates installed
- [ ] CORS origins restricted
- [ ] NODE_ENV=production set
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] All tests passing
- [ ] Security scan completed

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Documentation

- [Phase 1: Critical Security Fixes](./PHASE1_DOCUMENTATION.md)
- [Phase 2: Input Validation](./PHASE2_DOCUMENTATION.md)
- [Phase 3: Security Infrastructure](./PHASE3_DOCUMENTATION.md)
- [Phase 4: Testing & Quality](./PHASE4_DOCUMENTATION.md)
- [Phase 5: Documentation & DevOps](./PHASE5_DOCUMENTATION.md)

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Commit changes
6. Push to branch
7. Open Pull Request

---

## Support

- Documentation: [/docs](./docs/)
- API Docs: http://localhost:3000/api/v1/docs
- Issues: [GitHub Issues](https://github.com/kalibbalajohnson/Poultry-Management-System/issues)

---

**Built with ❤️ for poultry farmers worldwide**
