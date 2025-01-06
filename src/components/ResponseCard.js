import React from 'react';

function ResponseCard({ modelName, response, score }) {
  return (
    <div className="response-card">
      <div className="card-header">
        <h3>{modelName}</h3>
        {score !== null && (
          <div className="score-badge">
            {score.toFixed(1)}
          </div>
        )}
      </div>
      <div className="response-content">
        {response || 'Waiting for response...'}
      </div>
    </div>
  );
}

export default ResponseCard; 