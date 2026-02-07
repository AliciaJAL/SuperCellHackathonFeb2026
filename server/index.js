import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
  const { notes } = req.body;

  const prompt = `
You are a helpful educational assistant. Generate a multiple-choice question from these notes:

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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = completion.choices[0].message.content;

    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse LLM output' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
