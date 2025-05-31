import React, { useState } from "react";
import mermaid from "mermaid";
import { FaMagic, FaEdit } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const Mermaid = ({ code, onGenerate, onChange }) => {
  const [desc, setDesc] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  // Render mermaid diagram
  const renderDiagram = (code) => {
    try {
      const svg = mermaid.render("mermaid-svg", code);
      setError("");
      return { __html: svg };
    } catch (e) {
      setError("Invalid mermaid code.");
      return { __html: "" };
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
          placeholder="Describe diagram (e.g. flowchart of login process)"
          className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#101010] text-[#080808] dark:text-[#f8f8f8] text-sm"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={async () => {
            if (!desc.trim()) return;
            const res = await fetch("/api/diagram/generate-mermaid", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: desc }),
            });
            const data = await res.json();
            onChange(data.mermaid || "");
            setShowEditor(true);
          }}
          title="Generate from Description"
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#f8f8f8] dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#222] text-sm transition"
        >
          <FaMagic /> Generate
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
            className="w-full px-2 py-1 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#101010] text-[#080808] dark:text-[#f8f8f8] text-sm mb-2"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            placeholder="Paste or edit mermaid code here..."
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
              className="bg-[#f8f8f8] dark:bg-[#181818] p-3 rounded"
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
