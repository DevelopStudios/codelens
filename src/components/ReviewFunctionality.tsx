import React from 'react';
import { ReviewOutput } from './ReviewOutput';

interface ReviewFunctionalityProps {
  code: string;
  activeTab: string;
  isGenerating: boolean;
  reviewStatus: 'idle' | 'reviewing' | 'complete' | 'error';
  streamedText: string;
  error: string | null;
  onGenerateReview: () => void;
}

const ReviewFunctionality: React.FC<ReviewFunctionalityProps> = ({
  code,
  activeTab,
  isGenerating,
  reviewStatus,
  streamedText,
  error,
  onGenerateReview,
}) => {
  return (
    <div className="review-functionality">
      <button
        onClick={onGenerateReview}
        disabled={!code || isGenerating}
        aria-disabled={!code || isGenerating}
        aria-label="Generate code review"
        id="review-button"
      >
        {isGenerating ? 'Generating review...' : 'Review'}
      </button>

      {isGenerating && (
        <div role="progressbar" aria-label="Review generation progress" aria-valuetext="Generating review..." />
      )}

      <ReviewOutput
        reviewStatus={reviewStatus}
        streamedText={streamedText}
        focus={activeTab}
        error={error}
      />
    </div>
  );
};

export default ReviewFunctionality;