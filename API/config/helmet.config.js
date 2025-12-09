/**
 * Helmet.js Security Headers Configuration
 *
 * Configures HTTP security headers to protect against common vulnerabilities
 * Addresses OWASP Top 10 security recommendations
 */

import helmet from 'helmet';

/**
 * Helmet Configuration
 * Sets secure HTTP headers to protect against:
 * - XSS attacks
 * - Clickjacking
 * - MIME sniffing
 * - And other common vulnerabilities
 */
export const helmetConfig = helmet({
  // Content Security Policy - Prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'blob:',
        'https://firebasestorage.googleapis.com',
      ],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'https://firebasestorage.googleapis.com',
        'https://*.googleapis.com',
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Set to true if you need stricter isolation

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin', // Allow cross-origin requests for API
  },

  // DNS Prefetch Control - Control browser DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // Expect-CT - Certificate Transparency
  expectCt: {
    maxAge: 86400, // 24 hours
    enforce: process.env.NODE_ENV === 'production',
  },

  // X-Frame-Options - Prevents clickjacking
  frameguard: {
    action: 'deny', // Don't allow site to be framed
  },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open - Sets X-Download-Options for IE8+
  ieNoOpen: true,

  // X-Content-Type-Options - Prevent MIME sniffing
  noSniff: true,

  // Origin-Agent-Cluster header
  originAgentCluster: true,

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-XSS-Protection
  xssFilter: true,
});

/**
 * Development Helmet Configuration
 * Less restrictive for local development
 */
export const helmetDevConfig = helmet({
  contentSecurityPolicy: false, // Disable CSP in development
  crossOriginEmbedderPolicy: false,
  hidePoweredBy: true,
  hsts: false, // No HSTS in development (no HTTPS)
});

/**
 * Get appropriate Helmet configuration based on environment
 */
export const getHelmetConfig = () => {
  return process.env.NODE_ENV === 'production' ? helmetConfig : helmetDevConfig;
};

export default helmetConfig;
