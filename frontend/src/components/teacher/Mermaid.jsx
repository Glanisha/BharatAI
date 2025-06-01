import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { FaMagic, FaEdit } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { FaCopy } from "react-icons/fa";

const Mermaid = ({ code, onChange }) => {
  const [desc, setDesc] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [diagramHtml, setDiagramHtml] = useState("");
  // Use a media query to detect dark mode for SSR safety
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    setIsDark(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "monospace",
    });
  }, [isDark]);

  useEffect(() => {
    if (!code || code.trim().length === 0) {
      setDiagramHtml(
        '<div class="text-gray-500 text-center p-4">No diagram code provided</div>'
      );
      setError("");
      return;
    }
    let cancelled = false;
    async function renderMermaid() {
      try {
        let cleanedCode = code
          .replace(/[^\x20-\x7E\n\r\t]/g, "")
          .replace(/\s+/g, " ")
          .replace(/\n\s*\n/g, "\n")
          .trim();

        cleanedCode = cleanedCode.replace(
          /^(flowchart|graph)\s+([A-Za-z]+)\s*/i,
          (match, p1, p2) => `${p1} ${p2}\n`
        );

        const diagramId = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Set theme dynamically
        mermaid.initialize({
          startOnLoad: true,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "monospace",
        });

        await mermaid.parse(cleanedCode);
        const { svg } = await mermaid.render(diagramId, cleanedCode);

        if (!cancelled) {
          setDiagramHtml(svg);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setDiagramHtml(
            '<div class="text-red-500 text-center p-4">Error: Invalid diagram syntax. Please try regenerating or edit manually.</div>'
          );
          setError("Invalid mermaid syntax. Please check your diagram code.");
        }
      }
    }
    renderMermaid();
    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

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
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/diagram/generate-mermaid`,
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
      className={`w-full max-w-2xl mx-auto rounded-xl shadow p-6 mt-6 ${
        isDark ? "bg-neutral-900" : "bg-neutral-50 border border-neutral-100"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowEditor((v) => !v)}
          title="Edit Mermaid Code"
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition
            ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-50"
                : "bg-white border border-neutral-200 hover:bg-neutral-100 text-[#7c3aed]"
            }`}
        >
          <FaEdit /> {showEditor ? "Hide Editor" : "Edit Code"}
        </motion.button>
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Describe diagram (e.g. flowchart of making tea)"
          className={`flex-1 px-3 py-1 rounded border text-sm
            ${
              isDark
                ? "border-neutral-700 bg-neutral-900 text-neutral-50"
                : "border-neutral-200 bg-white text-[#080808] placeholder:text-neutral-400"
            }`}
          disabled={generating}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleGenerate}
          disabled={generating || !desc.trim()}
          title="Generate from Description"
          className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition disabled:opacity-50"
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
            className={`w-full px-3 py-2 rounded border mb-2 font-mono text-sm
              ${
                isDark
                  ? "border-neutral-700 bg-neutral-900 text-neutral-50"
                  : "border-neutral-200 bg-white text-[#080808] placeholder:text-neutral-400"
              }`}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            placeholder="Enter Mermaid diagram code here..."
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-2 mb-1">
        <span
          className={`text-xs font-semibold ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          Preview
        </span>
        <button
          className={`flex items-center gap-1 text-xs transition
            ${
              isDark
                ? "text-indigo-300 hover:text-indigo-100"
                : "text-[#7c3aed] hover:text-indigo-700"
            }`}
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
          title="Copy Mermaid code"
        >
          <FaCopy /> Copy Code
        </button>
      </div>

      <div
        className={`bg-neutral-50 dark:bg-neutral-800 p-4 rounded mb-2 overflow-auto border ${
          isDark ? "border-neutral-700" : "border-neutral-200"
        }`}
      >
        <AnimatePresence>
          {code && (
            <motion.div
              key="diagram"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              dangerouslySetInnerHTML={{ __html: diagramHtml }}
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
