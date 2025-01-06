import React from 'react';

function PromptInput({ prompt, setPrompt, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="prompt-form">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        rows={4}
        className="prompt-input"
        disabled={loading}
      />
      <button type="submit" disabled={loading || !prompt}>
        {loading ? 'Evaluating...' : 'Submit'}
      </button>
    </form>
  );
}

export default PromptInput; 