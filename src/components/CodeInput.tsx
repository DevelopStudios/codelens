import React from 'react';

interface CodeInputProps {
  code: string;
  onCodeChange: (code: string) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, onCodeChange }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(event.target.value);
  };

  const handleClear = () => {
    onCodeChange('');
  };

  return (
    <div className="code-input">
      <textarea
        id="code-input"
        aria-label="Code input area"
        aria-describedby="code-input-instructions"
        value={code}
        onChange={handleInputChange}
        placeholder="Paste your code here..."
        className="code-textarea"
      />
      {code && (
        <button
          aria-label="Clear code input"
          onClick={handleClear}
          className="clear-button"
        >
          Clear
        </button>
      )}
      <span id="code-input-instructions" style={{ display: 'none' }}>Enter code to review</span>
    </div>
  );
};

export default CodeInput;