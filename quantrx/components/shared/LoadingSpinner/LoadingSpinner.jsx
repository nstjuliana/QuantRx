/**
 * LoadingSpinner Component
 *
 * Reusable loading spinner component for the QuantRx application.
 * Provides consistent loading state visualization.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the spinner ('small', 'medium', 'large')
 * @param {string} [props.color='#1976D2'] - Color of the spinner
 * @param {string} [props.message] - Optional loading message
 */

'use client';

/**
 * LoadingSpinner Component
 *
 * @param {Object} props
 * @param {string} [props.size='medium']
 * @param {string} [props.color='#1976D2']
 * @param {string} [props.message]
 * @returns {JSX.Element} Loading spinner with optional message
 */
export function LoadingSpinner({
  size = 'medium',
  color = '#1976D2',
  message
}) {
  // Size configurations
  const sizes = {
    small: { spinner: 20, border: 2 },
    medium: { spinner: 40, border: 4 },
    large: { spinner: 60, border: 6 },
  };

  const { spinner: spinnerSize, border: borderWidth } = sizes[size] || sizes.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '16px',
    }}>
      {/* Spinner */}
      <div
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: `${borderWidth}px solid #E0E0E0`,
          borderTop: `${borderWidth}px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
        aria-label="Loading"
      />

      {/* Optional message */}
      {message && (
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#757575',
          textAlign: 'center',
          lineHeight: 1.43,
        }}>
          {message}
        </p>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
