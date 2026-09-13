const express = require("express");

const app = express();
app.use(express.json());

const GEORGE_BASE =
  "A 20 year old white British male, lean athletic build, short dark hair, " +
  "taking a mirror selfie in a clean minimal modern London flat bedroom. " +
  "Phone covering his face. Natural window light. Realistic, candid, shot on iPhone. " +
  "Not posed, genuine feel. Minimal background - white or grey walls, clean shelves, simple unmade bed. " +
  "The photo looks like a real person's social media post, not a stock photo or advertisement.";

app.get("/", (req, res) => {
  res.json({ status: "running", service: "MyAttire Content System" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/generate", async (req, res) => {
  try {
    const { outfit, style_notes } = req.body;
    if (!outfit) return res.status(400).json({ error: "outfit is required" });

    const prompt = `${GEORGE_BASE} He is wearing: ${outfit}. ${
      style_notes || "Clean, minimal, effortless. Nothing try-hard."
    }`;

    console.log("Generating image...");

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1792",
        quality: "medium",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI error", details: data });
    }

    const imageB64 = data.data[0].b64_json;
    console.log("Image generated successfully");

    res.json({
      success: true,
      image_b64: imageB64,
      outfit,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Content System running on port ${PORT}`));
