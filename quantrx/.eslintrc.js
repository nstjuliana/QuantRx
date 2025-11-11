/**
 * ESLint Configuration
 *
 * Based on project-rules.md ESLint standards for QuantRx.
 */

module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript', // Even though we're using JS, this provides good rules
  ],
  rules: {
    // Project-specific rules
    'no-console': 'warn', // Allow console in development, warn in production
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',

    // React-specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import organization (handled by import/order if available)
    // For now, we'll rely on manual organization as per project rules

    // JSDoc requirements
    'require-jsdoc': 'off', // We'll enforce this manually as per project rules
    'valid-jsdoc': 'off', // We'll use JSDoc comments but not enforce format strictly
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
};
