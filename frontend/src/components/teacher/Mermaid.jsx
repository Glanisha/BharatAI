import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { FaMagic, FaEdit } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const Mermaid = ({ code, onChange }) => {
  const [desc, setDesc] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "monospace",
    });
  }, []);

  // Render mermaid diagram
  const renderDiagram = (code) => {
    if (!code || code.trim().length === 0) {
      return {
        __html:
          '<div class="text-gray-500 text-center p-4">No diagram code provided</div>',
      };
    }

    try {
      // Clean the code before parsing
      const cleanedCode = code
        .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-printable characters
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/\n\s*\n/g, "\n") // Remove empty lines
        .trim();

      // Generate unique ID for each diagram
      const diagramId = `mermaid-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Validate and render
      mermaid.parse(cleanedCode);
      const svg = mermaid.render(diagramId, cleanedCode);

      setError("");
      return { __html: svg };
    } catch (e) {
      console.error("Mermaid render error:", e);
      setError("Invalid mermaid syntax. Please check your diagram code.");
      return {
        __html: `<div class="text-red-500 text-center p-4">Error: Invalid diagram syntax. Please try regenerating or edit manually.</div>`,
      };
    }
  };

  const handleGenerate = async () => {
    if (!desc.trim()) {
      setError("Please enter a description");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/diagram/generate-mermaid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ description: desc }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        onChange(data.mermaid || "");
        setShowEditor(true);
        setDesc(""); // Clear description after successful generation
      } else {
        setError(data.message || "Failed to generate diagram");
      }
    } catch (error) {
      console.error("Generation error:", error);
      if (error.message.includes("404")) {
        setError(
          "Diagram generation service not available. Please check if the backend is running."
        );
      } else if (error.message.includes("JSON")) {
        setError("Invalid response from server. Please try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white dark:bg-[#101010] rounded-lg shadow p-4 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowEditor((v) => !v)}
          title="Edit Mermaid Code"
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#f8f8f8] dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#222] text-sm transition"
        >
          <FaEdit /> {showEditor ? "Hide" : "Edit"}
        </motion.button>
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Describe diagram (e.g. flowchart of login process)"
          className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#101010] text-[#080808] dark:text-[#f8f8f8] text-sm"
          disabled={generating}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleGenerate}
          disabled={generating || !desc.trim()}
          title="Generate from Description"
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#f8f8f8] dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#222] text-sm transition disabled:opacity-50"
        >
          <FaMagic className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : "Generate"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showEditor && (
          <motion.textarea
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full px-2 py-1 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#101010] text-[#080808] dark:text-[#f8f8f8] text-sm mb-2 font-mono"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            placeholder="Enter Mermaid diagram code here..."
          />
        )}
      </AnimatePresence>

      <div className="mt-2">
        <AnimatePresence>
          {code && (
            <motion.div
              key="diagram"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              dangerouslySetInnerHTML={renderDiagram(code)}
              className="bg-[#f8f8f8] dark:bg-[#181818] p-3 rounded overflow-auto"
            />
          )}
        </AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-600 dark:text-red-400 mt-2 text-sm"
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Mermaid;
