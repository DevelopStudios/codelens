import React from 'react';

interface ModelLoadingProps {
  isLoading: boolean;
  progress: number;
  error: string | null;
}

const ModelLoading: React.FC<ModelLoadingProps> = ({ isLoading, progress, error }) => {
  if (isLoading) {
    return (
      <div className="model-loading">
        <p id="loading-text" aria-live="polite">Loading model... {progress}%</p>
        <div
          role="progressbar"
          aria-label="Model loading progress"
          aria-valuenow={String(progress)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-labelledby="progress-label"
          style={{ width: `${progress}%`, height: '4px', backgroundColor: '#007bff' }}
        ></div>
        <span id="progress-label" style={{ display: 'none' }}>Model loading progress: {progress}%</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-error" role="alert" aria-live="assertive">
        {error}
      </div>
    );
  }

  return null;
};

export default ModelLoading;