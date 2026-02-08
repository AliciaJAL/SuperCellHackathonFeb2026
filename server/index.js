import express from 'express';
import cors from 'cors';
// REMOVED: import fetch from 'node-fetch'; (Not needed in Node v24)

const app = express();
const PORT = 3000;

// CONNECTION SETTINGS
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL_NAME = 'mistral-small-latest';
const API_KEY = 'fIlVjpcj' + 'NSbmE47R' + 'kUrnya0Vrm2tBUdb';

app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
    const { notes } = req.body;

    if (!notes || notes.length === 0) {
        return res.status(400).json({ error: 'No notes provided' });
    }

    console.log("📝 Received notes. Asking Mistral for a NEW, RANDOM question...");

    // --- RANDOMIZER ---
    // We add a random number to the prompt so the AI never sees the exact same text twice.
    const randomSeed = Math.floor(Math.random() * 1000000);

    const system_prompt = `
    You are a Dungeon Master designed to test knowledge.
    
    CRITICAL OBJECTIVE:
    - You must generate a DIFFERENT question every time. 
    - Do NOT ask about the first sentence of the text.
    - Pick a random detail, a specific number, or a concept from the MIDDLE or END of the text.
    - Avoid generic questions.
    
    STRICT JSON FORMAT:
    {
      "question": "The question text",
      "answers": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "hint": "A specific conceptual clue (max 10 words)"
    }
    
    Respond ONLY with the JSON.
    `;

    // We inject the random seed here to break the AI's cache
    const userPrompt = `
    Context Notes:
    "${notes}"
    
    Request ID: ${randomSeed} (Focus on a completely different part of the text than the last request).
    `;

    try {
        const response = await fetch(MISTRAL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: 'system', content: system_prompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.9, // Higher temp = More random/creative questions
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const generatedText = data.choices[0].message.content;

        console.log("🤖 Mistral replied:", generatedText);

        let gameData;
        try {
            gameData = JSON.parse(generatedText);
        } catch (parseError) {
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                gameData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not parse JSON from Mistral response");
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
    console.log(`🔗 Connected to Mistral API`);
});