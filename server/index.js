import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// CONNECTION SETTINGS
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'llama3.2:3b';

app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
    const { notes } = req.body;

    if (!notes || notes.length === 0) {
        return res.status(400).json({ error: 'No notes provided' });
    }

    console.log("📝 Received notes. Asking Ollama to generate a question...");

    // --- IMPROVED PROMPT FOR BETTER HINTS ---
    const prompt = `
You are a Dungeon Master designed to test knowledge based on the provided text.

TASK:
Generate 1 multiple-choice question based on the context below.

CRITICAL INSTRUCTION FOR HINTS:
The "hint" must be a specific conceptual clue related to the answer. 
- BAD HINT: "Read the first sentence." or "Look closely." or "It's in the text."
- GOOD HINT: "Think about which organ processes oxygen." or "Remember the date of the signing."

STRICT JSON FORMAT:
{
  "question": "The question text",
  "answers": ["Option A", "Option B", "Option C"],
  "correctIndex": 0,
  "hint": "A specific conceptual clue (max 10 words)"
}

Respond ONLY with the JSON. Do not add markdown formatting or extra text.

CONTEXT:
${notes}
    `;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                format: "json" // Forces Llama 3 to output valid JSON
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedText = data.response;

        console.log("🤖 Ollama replied:", generatedText);

        // Parse the result
        let gameData;
        try {
            gameData = JSON.parse(generatedText);
        } catch (parseError) {
            // Clean up if the model adds markdown ticks like ```json ... ```
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                gameData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not parse JSON from Ollama response");
            }
        }
        
        res.json(gameData);

    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ error: 'Failed to generate question', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔗 Connected to Ollama at ${OLLAMA_URL}`);
});