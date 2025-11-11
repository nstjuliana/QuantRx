/**
 * Performance tracking utilities for monitoring application performance
 *
 * This utility provides simple performance measurement tools to track
 * operation duration, identify bottlenecks, and monitor API response times.
 * Can be extended to integrate with performance monitoring services.
 *
 * @module lib/utils/performance
 */

import { logPerformanceWarning } from './logger.js';

/**
 * Performance threshold constants (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  API_CALL: 2000,      // 2 seconds for API calls
  CALCULATION: 1000,   // 1 second for calculations
  DATABASE_QUERY: 500, // 500ms for database queries
  PAGE_LOAD: 3000,     // 3 seconds for page loads
  IMAGE_LOAD: 1000     // 1 second for image loads
};

/**
 * Performance tracker class for measuring operation duration
 */
export class PerformanceTracker {
  constructor(operationName, context = {}) {
    this.operationName = operationName;
    this.context = context;
    this.startTime = performance.now();
    this.checkpoints = [];
  }

  /**
   * Add a checkpoint to track intermediate progress
   * @param {string} name - Checkpoint name
   * @param {Object} [data] - Additional data for this checkpoint
   */
  checkpoint(name, data = {}) {
    const now = performance.now();
    const duration = now - this.startTime;

    this.checkpoints.push({
      name,
      timestamp: now,
      durationFromStart: duration,
      data
    });

    return duration;
  }

  /**
   * End the performance tracking and log results
   * @param {Object} [finalData] - Final data to include in the log
   * @returns {Object} Performance results
   */
  end(finalData = {}) {
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;

    const results = {
      operationName: this.operationName,
      totalDuration,
      startTime: this.startTime,
      endTime,
      checkpoints: this.checkpoints,
      context: this.context,
      finalData
    };

    // Check if performance threshold was exceeded
    const threshold = this.getThreshold();
    if (threshold && totalDuration > threshold) {
      logPerformanceWarning(this.operationName, totalDuration, {
        ...this.context,
        ...finalData,
        checkpoints: this.checkpoints.length,
        threshold
      });
    }

    return results;
  }

  /**
   * Get the performance threshold for this operation type
   * @returns {number|null} Threshold in milliseconds, or null if not defined
   */
  getThreshold() {
    const operationType = this.operationName.toLowerCase();

    if (operationType.includes('api') || operationType.includes('call')) {
      return PERFORMANCE_THRESHOLDS.API_CALL;
    }

    if (operationType.includes('calculation') || operationType.includes('compute')) {
      return PERFORMANCE_THRESHOLDS.CALCULATION;
    }

    if (operationType.includes('query') || operationType.includes('database')) {
      return PERFORMANCE_THRESHOLDS.DATABASE_QUERY;
    }

    if (operationType.includes('load') || operationType.includes('render')) {
      return PERFORMANCE_THRESHOLDS.PAGE_LOAD;
    }

    return null;
  }
}

/**
 * Simple timing function for quick measurements
 * @param {string} label - Timer label for identification
 * @returns {Function} Function to call when timing is complete
 */
export function startTimer(label) {
  const startTime = performance.now();

  return (context = {}) => {
    const duration = performance.now() - startTime;

    // Log performance warning if threshold exceeded
    const threshold = getThresholdForLabel(label);
    if (threshold && duration > threshold) {
      logPerformanceWarning(label, duration, context);
    }

    return {
      label,
      duration,
      context
    };
  };
}

/**
 * Time an async function and return its result with timing data
 * @param {string} label - Timer label
 * @param {Function} asyncFn - Async function to time
 * @param {Array} [args] - Arguments to pass to the function
 * @returns {Promise<Object>} Object with result and timing data
 */
export async function timeAsyncFunction(label, asyncFn, args = []) {
  const endTimer = startTimer(label);
  try {
    const result = await asyncFn(...args);
    const timing = endTimer({ success: true });
    return {
      result,
      timing
    };
  } catch (error) {
    const timing = endTimer({ success: false, error: error.message });
    throw error;
  }
}

/**
 * Measure React component render time
 * @param {string} componentName - Name of the component
 * @returns {Object} Performance measurement utilities
 */
export function measureComponentRender(componentName) {
  let renderCount = 0;
  let lastRenderTime = 0;

  return {
    startRender: () => {
      lastRenderTime = performance.now();
      renderCount++;
    },

    endRender: (props = {}) => {
      const renderDuration = performance.now() - lastRenderTime;

      // Log slow renders (over 16ms = dropped frame at 60fps)
      if (renderDuration > 16) {
        logPerformanceWarning(`${componentName} render`, renderDuration, {
          renderCount,
          propsCount: Object.keys(props).length
        });
      }

      return {
        componentName,
        renderDuration,
        renderCount
      };
    },

    getRenderCount: () => renderCount
  };
}

/**
 * Track API call performance
 * @param {string} endpoint - API endpoint being called
 * @param {Object} [context] - Additional context
 * @returns {Function} Function to call when API call completes
 */
export function trackApiCall(endpoint, context = {}) {
  const tracker = new PerformanceTracker(`API Call: ${endpoint}`, {
    endpoint,
    ...context
  });

  return (response, error = null) => {
    const results = tracker.end({
      success: !error,
      error: error?.message,
      statusCode: response?.status
    });

    return results;
  };
}

/**
 * Track calculation performance
 * @param {string} calculationType - Type of calculation
 * @param {Object} [inputs] - Calculation inputs summary
 * @returns {Function} Function to call when calculation completes
 */
export function trackCalculation(calculationType, inputs = {}) {
  const tracker = new PerformanceTracker(`Calculation: ${calculationType}`, {
    calculationType,
    inputs: {
      hasDrugName: !!inputs.drugName,
      hasNdc: !!inputs.ndc,
      sigLength: inputs.sig?.length || 0
    }
  });

  return (result, error = null) => {
    const results = tracker.end({
      success: !error,
      error: error?.message,
      result: result ? {
        status: result.status,
        calculatedQuantity: result.calculation?.calculatedQuantity
      } : null
    });

    return results;
  };
}

/**
 * Get performance threshold for a label
 * @param {string} label - Performance label
 * @returns {number|null} Threshold in milliseconds
 */
function getThresholdForLabel(label) {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes('api') || lowerLabel.includes('fetch')) {
    return PERFORMANCE_THRESHOLDS.API_CALL;
  }

  if (lowerLabel.includes('calculation') || lowerLabel.includes('compute')) {
    return PERFORMANCE_THRESHOLDS.CALCULATION;
  }

  if (lowerLabel.includes('query') || lowerLabel.includes('db')) {
    return PERFORMANCE_THRESHOLDS.DATABASE_QUERY;
  }

  if (lowerLabel.includes('load') || lowerLabel.includes('render')) {
    return PERFORMANCE_THRESHOLDS.PAGE_LOAD;
  }

  return null;
}

/**
 * Performance monitoring hooks for React components
 */
export const performanceHooks = {
  /**
   * Hook to measure component render time
   * Usage: const renderTimer = useRenderTimer('ComponentName');
   * Call renderTimer.end() in useEffect to measure render time
   */
  useRenderTimer: (componentName) => {
    const renderTimer = startTimer(`${componentName} render`);

    return {
      end: (context = {}) => renderTimer(context)
    };
  },

  /**
   * Hook to track async operations
   * Usage: const asyncTimer = useAsyncTimer('data fetch');
   * await asyncTimer.time(asyncOperation());
   */
  useAsyncTimer: (operationName) => {
    return {
      time: (asyncFn, args = []) =>
        timeAsyncFunction(operationName, asyncFn, args)
    };
  }
};

/**
 * Performance metrics aggregator
 * Collects performance data for analysis
 */
export class PerformanceMetrics {
  constructor() {
    this.metrics = [];
    this.maxMetrics = 1000; // Prevent memory leaks
  }

  /**
   * Add a performance measurement
   * @param {Object} metric - Performance metric data
   */
  addMetric(metric) {
    this.metrics.push({
      ...metric,
      timestamp: new Date().toISOString()
    });

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get metrics for a specific operation
   * @param {string} operationName - Name of the operation
   * @param {number} [limit] - Maximum number of metrics to return
   * @returns {Array} Array of matching metrics
   */
  getMetrics(operationName, limit = 50) {
    return this.metrics
      .filter(metric => metric.operationName === operationName)
      .slice(-limit);
  }

  /**
   * Get performance statistics for an operation
   * @param {string} operationName - Name of the operation
   * @returns {Object} Performance statistics
   */
  getStats(operationName) {
    const operationMetrics = this.getMetrics(operationName, 100);

    if (operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.totalDuration);

    return {
      operationName,
      count: operationMetrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      p95: calculatePercentile(durations, 95),
      latest: operationMetrics[operationMetrics.length - 1]
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }
}

/**
 * Calculate percentile from an array of numbers
 * @param {Array<number>} values - Array of values
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} Percentile value
 */
function calculatePercentile(values, percentile) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

// Global performance metrics instance
export const globalMetrics = new PerformanceMetrics();
