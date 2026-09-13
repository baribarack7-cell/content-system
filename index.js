const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GEORGE_BASE =
  "A 20 year old white British male, lean athletic build, dark hair, " +
  "taking a mirror selfie in a clean minimal modern London flat bedroom. " +
  "Phone covering his face. Natural window light. Realistic, candid, shot on iPhone. " +
  "Not posed, genuine feel. Minimal background — white/grey walls, clean shelves, simple bed.";

app.get("/", (req, res) => {
  res.json({
    status: "running",
    service: "MyAttire Content System",
    endpoints: {
      generate: "POST /generate — generate a George outfit image",
      health: "GET /health",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/generate", async (req, res) => {
  try {
    const { outfit, style_notes } = req.body;

    if (!outfit) {
      return res.status(400).json({ error: "outfit is required" });
    }

    const prompt = `${GEORGE_BASE} He is wearing: ${outfit}. ${
      style_notes || "Clean, minimal, effortless style. Nothing try-hard."
    }`;

    console.log("Generating image with prompt:", prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    res.json({
      success: true,
      image_url: imageUrl,
      outfit,
      revised_prompt: revisedPrompt,
    });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({
      error: err.message,
      type: err.constructor.name,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Content System running on port ${PORT}`);
});
