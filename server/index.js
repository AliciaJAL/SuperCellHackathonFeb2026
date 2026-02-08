// server/index.js
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();  // <- THIS is the app Node needs
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
    const { notes } = req.body;

    if (!notes || notes.length === 0) {
        return res.status(400).json({ error: 'No notes provided' });
    }

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

    exec(`ollama generate llama3.2:3b "${prompt}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Ollama error:', error);
            return res.status(500).json({ error: 'LLM generation failed' });
        }

        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}') + 1;

        if (jsonStart === -1 || jsonEnd === -1) {
            return res.status(500).json({ error: 'Invalid LLM output' });
        }

        try {
            const data = JSON.parse(stdout.substring(jsonStart, jsonEnd));
            res.json(data);
        } catch (e) {
            console.error('Failed to parse JSON:', e, 'stdout:', stdout);
            return res.status(500).json({ error: 'Failed to parse LLM output' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
