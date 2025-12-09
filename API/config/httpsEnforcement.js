/**
 * HTTPS Enforcement Middleware
 *
 * Redirects HTTP requests to HTTPS in production
 * Ensures secure communication for all API requests
 */

/**
 * Enforce HTTPS in production
 * Redirects all HTTP requests to HTTPS
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const enforceHTTPS = (req, res, next) => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already HTTPS
  // req.secure checks if connection is HTTPS
  // req.headers['x-forwarded-proto'] checks proxy/load balancer protocol
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  if (!isSecure) {
    // Construct HTTPS URL
    const httpsUrl = `https://${req.hostname}${req.url}`;

    // Log the redirect for monitoring
    console.warn(`Redirecting HTTP to HTTPS: ${req.url}`);

    // Redirect to HTTPS with 301 (Permanent Redirect)
    return res.redirect(301, httpsUrl);
  }

  next();
};

/**
 * Trust proxy setting
 * Required when behind a reverse proxy (nginx, load balancer)
 *
 * Add this to your Express app:
 * app.set('trust proxy', 1);
 */

export default enforceHTTPS;
