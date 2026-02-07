import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
  const { notes } = req.body;

  // Create the prompt for Ollama
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
    // Call Ollama CLI
    exec(`ollama generate llama3.2:3b "${prompt}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'LLM generation failed' });
      }

      // Parse the JSON from Ollama's output
      let data;
      try {
        data = JSON.parse(stdout);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse LLM output' });
      }

      res.json(data);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
