import { useState } from 'react';
import PromptInput from './components/PromptInput';
import ResponseCard from './components/ResponseCard';
import { getLLMResponse, getJudgeScore, modelDisplayNames } from './services/groqService';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({
    llm1: '',
    llm2: '',
    llm3: '',
  });
  const [scores, setScores] = useState({
    llm1: null,
    llm2: null,
    llm3: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Add console logs for debugging
      console.log('Starting API calls with prompt:', prompt);

      // Get responses one at a time to better identify which call fails
      const llm1Response = await getLLMResponse(prompt, 'llm1');
      console.log('LLM1 response received');
      
      const llm2Response = await getLLMResponse(prompt, 'llm2');
      console.log('LLM2 response received');
      
      const llm3Response = await getLLMResponse(prompt, 'llm3');
      console.log('LLM3 response received');

      const newResponses = {
        llm1: llm1Response,
        llm2: llm2Response,
        llm3: llm3Response,
      };
      
      setResponses(newResponses);
      console.log('All responses set, getting judge scores');

      // Get scores from judge LLM
      const scores = await getJudgeScore(prompt, newResponses);
      setScores(scores);
      console.log('Scores received:', scores);

    } catch (error) {
      console.error('Detailed error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>LLM Evaluation Platform</h1>
        
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="responses-grid">
          {Object.entries(responses).map(([llm, response]) => (
            <ResponseCard
              key={llm}
              modelId={llm}
              modelName={modelDisplayNames[llm]}
              response={response}
              score={scores[llm]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
