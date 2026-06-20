import React from 'react';

interface ReviewFocusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

const ReviewFocusTabs: React.FC<ReviewFocusTabsProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="review-focus-tabs" role="tablist" aria-label="Review focus">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          id={tab.id + '-tab'}
          aria-controls={tab.id + '-panel'}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ReviewFocusTabs;