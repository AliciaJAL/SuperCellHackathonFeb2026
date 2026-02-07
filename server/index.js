app.post('/api/generate-question', async (req, res) => {
    const { notes } = req.body;
  
    const prompt = `
  You are a helpful educational assistant.
  Generate a multiple-choice question from these notes:
  
  ${notes}
  
  Requirements:
  - 1 question
  - 3 answer choices
  - Correct answer indicated as an index
  - Provide a hint
  Respond ONLY in JSON format like this:
  
  {
    "question": "Question text here",
    "answers": ["Option 1", "Option 2", "Option 3"],
    "correctIndex": 0,
    "hint": "A helpful hint here"
  }
  `;
  
    try {
      exec(`ollama generate llama3.2:3b "${prompt}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Ollama error:', error);
          return res.status(500).json({ error: 'LLM generation failed' });
        }
  
        // Clean stdout: remove line breaks or extra text before parsing
        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}') + 1;
  
        if (jsonStart === -1 || jsonEnd === -1) {
          console.error('No JSON found in Ollama output:', stdout);
          return res.status(500).json({ error: 'Invalid LLM output' });
        }
  
        const jsonString = stdout.substring(jsonStart, jsonEnd);
  
        let data;
        try {
          data = JSON.parse(jsonString);
        } catch (e) {
          console.error('Failed to parse JSON:', e, 'stdout:', stdout);
          return res.status(500).json({ error: 'Failed to parse LLM output' });
        }
  
        console.log('Generated question:', data); // <-- log to verify
        res.json(data);
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });