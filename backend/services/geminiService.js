const axios = require("axios");

async function generateMermaidDiagram(description) {
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const prompt = `Generate mermaid.js code for this diagram: ${description}`;

  const response = await axios.post(`${endpoint}?key=${apiKey}`, {
    contents: [{ parts: [{ text: prompt }] }],
  });

  // Extract mermaid code block if present
  const text = response.data.candidates[0].content.parts[0].text;
  const match = text.match(/```mermaid\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : text.trim();
}

module.exports = { generateMermaidDiagram };

