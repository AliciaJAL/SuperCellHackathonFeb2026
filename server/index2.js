import express from "express";
import { generateImage } from "./generate.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/generate-door", async (req, res) => {
  try {
    const { theme, style } = req.body;

    const prompt = `
      300x680px door,
      background,
      theme: ${theme},
      art style: ${style},
      2D game asset,
      front view,
      no text
    `;

    const imagePath = await generateImage(prompt);

    res.json({
      success: true,
      imageUrl: "/" + imagePath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
