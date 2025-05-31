const express = require("express");
const router = express.Router();
const { generateMermaidDiagram } = require("../services/geminiService");

router.post("/generate-mermaid", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description)
      return res.status(400).json({ error: "Description required" });

    const code = await generateMermaidDiagram(description);
    res.json({ mermaid: code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
