require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');
const path = require('path');
const pdfParse = require('pdf-parse').defaut|| require('pdf-parse');

const app = express();
let savedDocumentText = "";
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

    app.post('/analyse', upload.single('pdf'), async (req, res) => {
  try {
      res.json({
      summary: ["This is a sample summary of the document."],
      risks: ["No major risks detected."],
      clauses: ["Clause analysis will appear here."]
    });
  } catch (err) {
    return res.status(500).json({
      summary: ["Error"],
      risks: ["Try again"]
    });
  }
});
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Analyze this legal document. Return ONLY a raw JSON object, no markdown, no backticks, no extra text:
{"summary": ["point 1", "point 2", "point 3"], "risks": ["risk 1", "risk 2", "risk 3"]}

Document: ${pdfText}`
      }]
    });

    const response = completion.choices[0].message.content;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      summary: ["Error analyzing document"],
      risks: ["Please try again"]
    });
  }
});

app.post('/translate', async (req, res) => {
  try {
    const { data, lang } = req.body;
    const langName = lang === "hi" ? "Hindi" : "Bengali";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Translate ONLY the text values in this JSON to ${langName}.
Keep the exact same JSON structure and keys.
Return ONLY the raw JSON object, absolutely no markdown, no backticks, no explanation.
Input: ${JSON.stringify(data)}`
      }],
      temperature: 0.1
    });

    const response = completion.choices[0].message.content;
    const start = response.indexOf('{');
    const end = response.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No JSON found");
    
    const jsonStr = response.substring(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    res.json(parsed);

  } catch (error) {
    console.error("Translate error:", error.message);
    res.status(500).json({
      summary: ["Translation error"],
      risks: ["Please try again"]
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
