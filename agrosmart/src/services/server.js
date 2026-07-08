const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai'); // Gemini AI SDK
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIX: Official SDK ke according 'new' keyword nahi lagaya jata hai
const ai = GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'AgroSmart AI Backend is running securely! 🚀' });
});

// Crop Advisory Route
app.post('/api/crop-advisory', async (req, res) => {
    try {
        const { state, soilType, landSize, budget } = req.body;

        const prompt = `
          You are an expert Indian Agronomist. A farmer has provided the following details:
          - Location/State: ${state}
          - Current Month: ${currentMonth}
          - Soil Type: ${soilType}
          - Land Size: ${landSize} acres
          - Budget: ₹${budget}

          Suggest only some best crops.

          For each crop provide:
            • Crop Name
            • Sowing Time
            • Harvest Time
            • Estimated ROI

          Keep each point within 1 line.
          Maximum response length: 150 words.
          Use points only.
          Do not write long explanations.
          Answer in hindi text.
          And use english text for english words.
          
          Write all these in hindi text
            • Crop Name
            • Sowing Time
            • Harvest Time
            • Estimated ROI
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        res.json({
            success: true,
            advice: response.text
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: 'AI processing failed', error: error.message });
    }
});

// Disease Lab Route
app.post('/api/analyze-disease', upload.single('image'), async (req, res) => {
  try {
    const { description } = req.body;

    if (!req.file && !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide an image or description."
      });
    }

    let contents = [];

    let prompt = `
You are an expert agricultural plant pathologist.
Analyze the plant disease based on the provided image and/or description.

Description:
${description || "No description provided"}

Provide:
1. Disease Name
2. Symptoms
3. Possible Causes
4. Organic Remedies
5. Chemical Remedies
6. Prevention Tips
7. Don't use more than 120 words
8. Answer in hindi text.
9. And use english text for english words and Chemical names.
10. Give in Points.

Keep the answer simple and farmer-friendly.
`;

    contents.push(prompt);

    if (req.file) {
      contents.push({
        inlineData: {
          mimeType: req.file.mimetype,
          data: req.file.buffer.toString("base64")
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents
    });

    res.json({
      success: true,
      advice: response.text
    });

  } catch (error) {
    console.error("--- ASLI ERROR YAHAN HAI ---");
    console.error(error.message); 
    res.status(500).json({
      success: false,
      message: "Disease analysis failed",
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is successfully running on http://localhost:${PORT}`);
});


