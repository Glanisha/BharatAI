const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { generateMermaidDiagram } = require("../services/geminiService");

const router = express.Router();

// Simple Mermaid syntax validator
const validateMermaidSyntax = (code) => {
  // Check for line breaks (essential for Mermaid)
  if (!code.includes('\n')) {
    throw new Error('Missing line breaks');
  }
  
  // Must have at least 2 lines
  if (code.split('\n').length < 2) {
    throw new Error('Insufficient line breaks');
  }
  
  // Must start with flowchart
  if (!code.trim().startsWith('flowchart')) {
    throw new Error('Must start with flowchart');
  }
  
  return true;
};

router.post("/generate-mermaid", authMiddleware, async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // Use actual Gemini service to generate mermaid code
    const mermaidCode = await generateMermaidDiagram(description);

    // Validate the generated code
    try {
      validateMermaidSyntax(mermaidCode);
    } catch (validationError) {
      console.warn("Generated code failed validation, using fallback");
      // Simple fallback
      const safeName = description.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 15) || 'Task';
      const fallbackCode = `flowchart TD
    A[Start] --> B[${safeName}]
    B --> C[End]`;

      return res.json({
        success: true,
        mermaid: fallbackCode,
      });
    }

    res.json({
      success: true,
      mermaid: mermaidCode,
    });
  } catch (error) {
    console.error("Diagram generation error:", error);
    
    // Emergency fallback
    const fallbackCode = `flowchart TD
    A[Start] --> B[Process]
    B --> C[End]`;
    
    res.json({
      success: true,
      mermaid: fallbackCode,
    });
  }
});

module.exports = router;
