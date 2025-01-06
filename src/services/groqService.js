const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const models = {
  llm1: 'llama-3.1-8b-instant',
  llm2: 'llama3-70b-8192',
  llm3: 'llama-3.2-3b-preview',
  judge: 'llama-3.2-1b-preview'
};

// Add display names for the models
export const modelDisplayNames = {
  llm1: 'Llama 3.1 (8B)',
  llm2: 'Llama 3 (70B)',
  llm3: 'Llama 3.2 (3B)',
};

async function callGroqAPI(prompt, model) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: models[model],
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} - ${data.error?.message || response.statusText}`);
    }

    // Extract the content from the message
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Detailed API error:', error);
    throw new Error(`Failed to call Groq API: ${error.message}`);
  }
}

export async function getLLMResponse(prompt, llmId) {
  return callGroqAPI(prompt, llmId);
}

export async function getJudgeScore(prompt, responses) {
  const judgePrompt = `You are a scoring system. Your task is to analyze these responses and return ONLY a JSON object with scores.
Do not include any explanation or additional text.

Prompt: "${prompt}"

${modelDisplayNames.llm1}: ${responses.llm1}
${modelDisplayNames.llm2}: ${responses.llm2}
${modelDisplayNames.llm3}: ${responses.llm3}

Score each response from 0 to a max of 10, based on relevant metrics.
Return ONLY a JSON object in this exact format (no other text):
{"llm1":N,"llm2":N,"llm3":N}`;

  try {
    const judgeResponse = await callGroqAPI(judgePrompt, 'judge');
    
    if (!judgeResponse) {
      console.error('Empty judge response');
      throw new Error('Empty response from judge');
    }

    console.log('Raw judge response:', judgeResponse); // Debug log

    // Try to parse the response
    try {
      const scores = JSON.parse(judgeResponse);
      return scores;
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON
      const jsonMatch = judgeResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in:', judgeResponse);
        throw new Error('No valid JSON found in response');
      }
      
      const scores = JSON.parse(jsonMatch[0]);
      
      // Validate scores
      Object.entries(scores).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0 || value > 10) {
          throw new Error('Invalid score value');
        }
      });
      
      return scores;
    }
  } catch (error) {
    console.error('Judge scoring error:', error);
    // Return default scores if anything fails
    return {
      llm1: 5,
      llm2: 5,
      llm3: 5
    };
  }
} 