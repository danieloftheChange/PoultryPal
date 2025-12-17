/**
 * Simple in-memory metrics collection
 * For production, consider using Prometheus, StatsD, or DataDog
 */

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byRoute: {},
      },
      responseTimes: {
        total: 0,
        count: 0,
        min: Infinity,
        max: 0,
        avg: 0,
      },
      errors: {
        total: 0,
        byType: {},
      },
    };
    this.startTime = Date.now();
  }

  recordRequest(method, route, statusCode, responseTime) {
    // Increment total
    this.metrics.requests.total++;

    // Track by method
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;

    // Track by status code
    const statusGroup = `${Math.floor(statusCode / 100)}xx`;
    this.metrics.requests.byStatus[statusGroup] = (this.metrics.requests.byStatus[statusGroup] || 0) + 1;

    // Track by route
    this.metrics.requests.byRoute[route] = (this.metrics.requests.byRoute[route] || 0) + 1;

    // Track response time
    this.metrics.responseTimes.total += responseTime;
    this.metrics.responseTimes.count++;
    this.metrics.responseTimes.min = Math.min(this.metrics.responseTimes.min, responseTime);
    this.metrics.responseTimes.max = Math.max(this.metrics.responseTimes.max, responseTime);
    this.metrics.responseTimes.avg = this.metrics.responseTimes.total / this.metrics.responseTimes.count;
  }

  recordError(errorType) {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
  }

  reset() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byRoute: {},
      },
      responseTimes: {
        total: 0,
        count: 0,
        min: Infinity,
        max: 0,
        avg: 0,
      },
      errors: {
        total: 0,
        byType: {},
      },
    };
    this.startTime = Date.now();
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

export default metricsCollector;
