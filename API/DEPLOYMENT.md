# Production Deployment Checklist

This document provides a comprehensive checklist for deploying the PoultryPal API to production.

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Create production `.env` file with all required variables
- [ ] Generate secure JWT secrets (min 32 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Configure production MongoDB connection string
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS origins for production frontend
- [ ] Set production `FRONTEND_URL` for email links
- [ ] Review and set appropriate rate limits
- [ ] Configure logging level (recommend `info` or `warn`)

### 2. Database Setup

- [ ] Set up production MongoDB instance (MongoDB Atlas or self-hosted)
- [ ] Create database user with appropriate permissions
- [ ] Configure MongoDB authentication
- [ ] Set up database backups (automated daily backups recommended)
- [ ] Test database connectivity from application server
- [ ] Run migrations
  ```bash
  npm run migrate:up
  ```
- [ ] Verify migration status
  ```bash
  npm run migrate:status
  ```
- [ ] Create database indexes (handled by migrations)

### 3. Security Audit

- [ ] Run npm audit and fix vulnerabilities
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Verify no hardcoded secrets in code
- [ ] Ensure `.env` file is in `.gitignore`
- [ ] Review CORS configuration
- [ ] Verify Helmet.js security headers are enabled
- [ ] Test rate limiting is working
- [ ] Verify JWT token expiration times are appropriate
- [ ] Ensure refresh tokens are httpOnly cookies
- [ ] Test password reset flow with production email service
- [ ] Verify email verification works with production URLs

### 4. Code Quality & Testing

- [ ] All tests passing
  ```bash
  npm run test:ci
  ```
- [ ] Code coverage meets thresholds
  ```bash
  npm run test:coverage
  ```
- [ ] ESLint passing with no errors
  ```bash
  npm run lint
  ```
- [ ] No `console.log` statements in source code (except logger)
- [ ] All API endpoints documented in `API_DOCUMENTATION.md`
- [ ] Swagger documentation is up to date

### 5. Infrastructure Setup

#### Docker Deployment

- [ ] Build Docker image
  ```bash
  docker build -t poultrypal-api:latest .
  ```
- [ ] Test Docker image locally
  ```bash
  docker run -p 3000:3000 --env-file .env poultrypal-api:latest
  ```
- [ ] Push image to container registry
  ```bash
  docker tag poultrypal-api:latest your-registry/poultrypal-api:v1.0.0
  docker push your-registry/poultrypal-api:v1.0.0
  ```
- [ ] Configure Docker secrets for sensitive data

#### Kubernetes (if applicable)

- [ ] Create Kubernetes namespace
- [ ] Configure ConfigMaps for environment variables
- [ ] Configure Secrets for sensitive data
- [ ] Set up persistent volumes for MongoDB
- [ ] Configure ingress rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure horizontal pod autoscaling
- [ ] Set resource limits and requests

#### Traditional Server

- [ ] Install Node.js 20.x LTS
- [ ] Install PM2 or similar process manager
- [ ] Configure nginx reverse proxy
- [ ] Set up SSL/TLS certificates (Let's Encrypt recommended)
- [ ] Configure firewall rules
- [ ] Set up log rotation

### 6. Monitoring & Observability

- [ ] Verify health check endpoint works
  ```bash
  curl https://your-domain.com/api/v1/health
  ```
- [ ] Set up monitoring alerts for health checks
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Configure log aggregation (CloudWatch, Datadog, etc.)
- [ ] Monitor metrics endpoint
  ```bash
  curl https://your-domain.com/api/v1/metrics
  ```
- [ ] Set up database monitoring
- [ ] Configure alerts for high memory/CPU usage
- [ ] Set up alerts for high error rates

### 7. Performance Optimization

- [ ] Enable gzip compression (handled by nginx/reverse proxy)
- [ ] Configure CDN for static assets (if any)
- [ ] Optimize database queries with proper indexes
- [ ] Test API response times under load
- [ ] Configure caching headers appropriately
- [ ] Review and optimize database connection pooling

### 8. Backup & Disaster Recovery

- [ ] Automated database backups configured
- [ ] Test database restore procedure
- [ ] Document recovery time objective (RTO)
- [ ] Document recovery point objective (RPO)
- [ ] Store backups in separate geographic location
- [ ] Test disaster recovery plan

## Deployment Steps

### Option 1: Docker Compose (Single Server)

1. **Prepare environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Pull latest images
   docker-compose -f docker-compose.prod.yml pull

   # Start services
   docker-compose -f docker-compose.prod.yml up -d

   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f api
   ```

3. **Verify deployment**
   ```bash
   # Check health
   curl http://localhost:3000/api/v1/health

   # Check all containers running
   docker-compose -f docker-compose.prod.yml ps
   ```

### Option 2: Kubernetes

1. **Create namespace**
   ```bash
   kubectl create namespace poultrypal-prod
   ```

2. **Configure secrets**
   ```bash
   kubectl create secret generic api-secrets \
     --from-literal=jwt-secret=YOUR_JWT_SECRET \
     --from-literal=jwt-refresh-secret=YOUR_REFRESH_SECRET \
     --from-literal=mongodb-uri=YOUR_MONGODB_URI \
     -n poultrypal-prod
   ```

3. **Deploy application**
   ```bash
   kubectl apply -f k8s/ -n poultrypal-prod
   ```

4. **Verify deployment**
   ```bash
   kubectl get pods -n poultrypal-prod
   kubectl logs -f deployment/poultrypal-api -n poultrypal-prod
   ```

### Option 3: Traditional Server with PM2

1. **Clone repository**
   ```bash
   git clone https://github.com/your-org/poultrypal.git
   cd poultrypal/API
   ```

2. **Install dependencies**
   ```bash
   npm ci --production
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Run migrations**
   ```bash
   npm run migrate:up
   ```

5. **Start with PM2**
   ```bash
   pm2 start server.js --name poultrypal-api
   pm2 save
   pm2 startup
   ```

6. **Configure nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

## Post-Deployment Verification

### 1. Smoke Tests

- [ ] Health check returns 200
  ```bash
  curl https://api.yourdomain.com/api/v1/health
  ```
- [ ] Readiness probe returns 200
  ```bash
  curl https://api.yourdomain.com/api/v1/ready
  ```
- [ ] Liveness probe returns 200
  ```bash
  curl https://api.yourdomain.com/api/v1/alive
  ```
- [ ] Swagger documentation accessible
  ```bash
  curl https://api.yourdomain.com/api/v1/docs
  ```

### 2. Functional Tests

- [ ] User signup works
- [ ] User login works
- [ ] Token refresh works
- [ ] Password reset flow works
- [ ] Email verification works
- [ ] Protected endpoints require authentication
- [ ] Rate limiting is enforced

### 3. Performance Tests

- [ ] Response times acceptable (< 500ms for most endpoints)
- [ ] Load test with expected traffic
- [ ] Memory usage stable
- [ ] CPU usage acceptable
- [ ] Database connection pool not exhausted

### 4. Security Tests

- [ ] HTTPS enforced (no HTTP access)
- [ ] Security headers present (Helmet.js)
- [ ] CORS properly configured
- [ ] Rate limiting working
- [ ] SQL injection tests pass
- [ ] XSS tests pass
- [ ] Authentication bypass tests fail

## Rollback Plan

If deployment fails or critical issues are discovered:

### Docker Compose
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
mongorestore --uri="$MONGODB_URI" backup-YYYYMMDD/

# Deploy previous version
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
# Rollback to previous version
kubectl rollout undo deployment/poultrypal-api -n poultrypal-prod

# Restore database if needed
kubectl exec -it mongodb-pod -n poultrypal-prod -- mongorestore /backups/backup-YYYYMMDD/
```

### PM2
```bash
# Stop application
pm2 stop poultrypal-api

# Restore database
mongorestore --uri="$MONGODB_URI" backup-YYYYMMDD/

# Checkout previous version
git checkout v1.0.0

# Install dependencies
npm ci --production

# Restart
pm2 restart poultrypal-api
```

## Monitoring After Deployment

### First Hour
- [ ] Monitor error rates
- [ ] Check CPU/memory usage
- [ ] Verify all health checks passing
- [ ] Review application logs

### First Day
- [ ] Review all API endpoints usage
- [ ] Check database performance
- [ ] Monitor response times
- [ ] Review error logs

### First Week
- [ ] Analyze performance trends
- [ ] Review security logs
- [ ] Check backup success
- [ ] Gather user feedback

## Common Issues & Solutions

### Issue: Database connection fails
**Solution**: Verify MongoDB URI, check network connectivity, ensure database credentials are correct

### Issue: High memory usage
**Solution**: Check for memory leaks, review database connection pooling, consider scaling horizontally

### Issue: Slow response times
**Solution**: Add database indexes, optimize queries, enable caching, scale resources

### Issue: Authentication errors
**Solution**: Verify JWT secrets match, check token expiration times, ensure cookies are httpOnly

### Issue: CORS errors
**Solution**: Verify CORS_ORIGINS environment variable includes frontend domain

## Support & Escalation

If critical issues occur during deployment:

1. **Check logs**
   ```bash
   # Docker
   docker-compose -f docker-compose.prod.yml logs -f api

   # PM2
   pm2 logs poultrypal-api

   # Kubernetes
   kubectl logs -f deployment/poultrypal-api -n poultrypal-prod
   ```

2. **Check health status**
   ```bash
   curl https://api.yourdomain.com/api/v1/health
   ```

3. **Review metrics**
   ```bash
   curl https://api.yourdomain.com/api/v1/metrics
   ```

4. **Database status**
   ```bash
   # Connect to MongoDB
   mongosh "$MONGODB_URI"

   # Check status
   db.serverStatus()
   ```

5. **Rollback if necessary** (see Rollback Plan above)

## Maintenance Windows

Schedule regular maintenance windows for:
- Security updates (monthly)
- Database maintenance (monthly)
- Log rotation (weekly)
- Backup verification (weekly)
- Performance optimization (quarterly)

## Documentation

Ensure the following documentation is up to date:
- [ ] API_DOCUMENTATION.md
- [ ] README.md
- [ ] migrations/README.md
- [ ] DEPLOYMENT.md (this file)
- [ ] Runbook for on-call engineers
- [ ] Architecture diagrams

## Final Sign-Off

- [ ] Development team lead approval
- [ ] DevOps/Infrastructure approval
- [ ] Security team approval
- [ ] Product owner approval
- [ ] All checklist items completed
- [ ] Rollback plan tested
- [ ] Monitoring configured
- [ ] Documentation updated

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Approved By**: _______________
