import React from 'react';
import ErrorBanner from './ErrorBanner';

interface ErrorHandlingProps {
  isLoading: boolean;
  error: string | null;
  networkError: boolean;
}

const ErrorHandling: React.FC<ErrorHandlingProps> = ({ isLoading, error, networkError }) => {
  if (isLoading) {
    return null;
  }

  return <ErrorBanner error={error} networkError={networkError} />;
};

export default ErrorHandling;