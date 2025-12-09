# Security Policy

## Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, please report security issues via email to: **security@poultrypal.com** (or project maintainer email)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and provide updates every 7 days until resolved.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **HttpOnly cookies** for token storage (XSS protection)
- **Strong password policy**: 8+ chars, uppercase, lowercase, number, special character
- **Password hashing** with bcrypt (10 rounds)
- **Role-based access control** (Manager/Worker)
- **Token expiration**: Access tokens (1h), Refresh tokens (7d)

### Input Validation
- **Joi validation** on all API endpoints
- **Zod validation** on frontend forms
- **XSS prevention** through input sanitization
- **SQL/NoSQL injection prevention** via parameterized queries
- **Mass assignment protection** with field whitelisting

### Rate Limiting
- **Authentication endpoints**: 5 attempts per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Resource creation**: 20 requests per 15 minutes
- **File uploads**: 10 requests per 15 minutes

### Security Headers (Helmet.js)
- Content-Security-Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing prevention)
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy

### Data Protection
- **HTTPS enforcement** in production
- **Environment-based CORS** configuration
- **Sensitive data exclusion** from logs
- **Database connection encryption** (MongoDB TLS)

### Logging & Monitoring
- **Winston-based logging** (error, warn, info, http, debug)
- **Security event tracking** (failed logins, unauthorized access)
- **Request/response logging** with sanitization
- **Error tracking** with context

---

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use .env files
   - Add .env to .gitignore
   - Use .env.example as template

2. **Rotate secrets regularly**
   - JWT secrets every 90 days
   - Database passwords every 180 days
   - API keys when compromised

3. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   npm update
   ```

4. **Use secure coding practices**
   - Validate all inputs
   - Sanitize outputs
   - Use parameterized queries
   - Avoid eval() and similar

5. **Handle errors properly**
   - Don't expose stack traces in production
   - Log errors securely
   - Provide generic error messages to users

### For Deployers

1. **Use HTTPS in production**
   - Install SSL/TLS certificates
   - Redirect HTTP to HTTPS
   - Enable HSTS

2. **Secure environment variables**
   - Use secrets management (AWS Secrets Manager, Vault)
   - Never log environment variables
   - Restrict access to .env files

3. **Configure firewalls**
   - Only expose necessary ports
   - Use security groups/firewall rules
   - Enable DDoS protection

4. **Enable monitoring**
   - Set up log aggregation
   - Configure alerts for suspicious activity
   - Monitor error rates

5. **Regular backups**
   - Automated daily backups
   - Test restore procedures
   - Encrypt backups

### For Users

1. **Use strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, special characters
   - Don't reuse passwords

2. **Protect credentials**
   - Don't share passwords
   - Log out when done
   - Use different passwords for different services

3. **Report suspicious activity**
   - Unauthorized access attempts
   - Unexpected behavior
   - Suspicious emails

---

## Authentication Flow

```
1. User submits credentials → POST /api/v1/user/login
2. Server validates credentials (bcrypt comparison)
3. Server generates JWT tokens (access + refresh)
4. Tokens set as httpOnly cookies
5. Subsequent requests include cookies automatically
6. Server validates token on each request
7. Token refresh when access token expires
8. Logout clears cookies
```

---

## Authorization Model

### Roles

| Role    | Permissions |
|---------|-------------|
| Manager | Full access to farm data, user management, reports |
| Worker  | Read/write access to daily operations, limited reports |

### Resource Access

All resources are scoped to user's farmId:
```javascript
// Users can only access their own farm's data
const batches = await Batch.find({ farmId: req.user.farmId });
```

---

## Data Protection

### Sensitive Data

Never log or expose:
- Passwords (even hashed)
- JWT secrets
- API keys
- Database credentials
- User personal information in errors

### Encryption

- **In Transit**: HTTPS/TLS 1.2+
- **At Rest**: MongoDB encryption at rest (optional)
- **Passwords**: bcrypt with 10 rounds
- **Tokens**: Signed JWTs with HS256

---

## Incident Response

### If Security Breach Occurs

1. **Immediate Actions**
   - Identify affected systems
   - Isolate compromised components
   - Preserve logs and evidence

2. **Containment**
   - Revoke compromised credentials
   - Rotate secrets
   - Block malicious IPs

3. **Investigation**
   - Analyze logs
   - Determine scope of breach
   - Identify root cause

4. **Recovery**
   - Patch vulnerabilities
   - Restore from backups if needed
   - Verify system integrity

5. **Notification**
   - Inform affected users
   - Report to authorities if required
   - Document incident

6. **Post-Incident**
   - Review and update security measures
   - Conduct security training
   - Update documentation

---

## Security Checklist

### Before Deployment

- [ ] All secrets in environment variables
- [ ] JWT secrets are strong and unique
- [ ] HTTPS enabled and enforced
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database access restricted
- [ ] Firewall rules configured
- [ ] Monitoring and alerting set up
- [ ] Backup and restore tested
- [ ] npm audit shows no vulnerabilities
- [ ] Security scan completed
- [ ] Penetration testing completed
- [ ] Incident response plan documented

---

## Compliance

### OWASP Top 10 2021

| Risk | Mitigation |
|------|------------|
| A01: Broken Access Control | JWT auth, role-based access, farmId scoping |
| A02: Cryptographic Failures | HTTPS, bcrypt, secure cookies |
| A03: Injection | Input validation, parameterized queries |
| A04: Insecure Design | Security by design, rate limiting |
| A05: Security Misconfiguration | Helmet.js, secure defaults |
| A06: Vulnerable Components | Regular npm audit, updates |
| A07: Auth/Auth Failures | Strong passwords, JWT, rate limiting |
| A08: Software Integrity | Dependency verification, npm ci |
| A09: Logging Failures | Winston logging, security events |
| A10: SSRF | Input validation, URL whitelisting |

---

## Contact

For security concerns:
- Email: security@poultrypal.com
- PGP Key: [Link to public key]

For general support:
- GitHub Issues: [Link]
- Documentation: [Link]

---

**Last Updated**: December 2025
**Version**: 1.0
