// game-server/index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-question', async (req, res) => {
  const { notes } = req.body;

  if (!notes) return res.status(400).json({ error: "No notes provided" });

  // Truncate to ~6000 chars to fit context window
  const truncatedNotes = notes.slice(0, 6000);
  console.log(`📝 Received notes (${notes.length} chars). Sending to Ollama...`);

  const prompt = `
    You are a generator for a gamified quiz. 
    Analyze the following study notes and generate ONE multiple-choice question.
    
    NOTES:
    "${truncatedNotes}" 

    OUTPUT FORMAT:
    Respond ONLY with valid JSON. Do not add markdown formatting.
    Structure:
    {
      "question": "The question text?",
      "options": ["Wrong Answer 1", "Correct Answer", "Wrong Answer 2", "Wrong Answer 3"],
      "correctIndex": 1,
      "hint": "A short hint for the player"
    }
  `;

  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
        format: "json"
      })
    });

    const ollamaData = await response.json();
    console.log("🤖 Ollama says:", ollamaData.response);

    // Clean up and parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(ollamaData.response);
    } catch (e) {
      const match = ollamaData.response.match(/\{[\s\S]*\}/);
      if (match) parsedData = JSON.parse(match[0]);
      else throw new Error("No JSON found");
    }

    res.json(parsedData);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: 'Failed to generate question.' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));