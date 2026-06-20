import React from 'react';

interface ErrorBannerProps {
  error: string | null;
  networkError: boolean;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, networkError }) => {
  if (!error && !networkError) {
    return null;
  }

  return (
    <div
      className="error-banner"
      role="alert"
      aria-live="assertive"
      id="error-banner"
    >
      {networkError ? (
        <p>Network error: Please check your connection</p>
      ) : (
        <p>{error}</p>
      )}
    </div>
  );
};

export default ErrorBanner;