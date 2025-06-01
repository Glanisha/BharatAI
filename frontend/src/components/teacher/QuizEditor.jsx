import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const defaultQuestion = {
  question: "",
  type: "mcq",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

const QuizEditor = ({
  quiz = { questions: [], difficulty: "basic" },
  onChange,
}) => {
  const [questions, setQuestions] = useState(quiz.questions || []);
  const { isDark } = useTheme();

  const addQuestion = (type = "mcq") => {
    const newQ =
      type === "mcq"
        ? { ...defaultQuestion }
        : {
            question: "",
            type: "truefalse",
            options: ["True", "False"],
            correctAnswer: 0,
          };
    const updated = [...questions, newQ];
    setQuestions(updated);
    onChange({ ...quiz, questions: updated });
  };

  const updateQuestion = (idx, updated) => {
    const newQuestions = questions.map((q, i) => (i === idx ? updated : q));
    setQuestions(newQuestions);
    onChange({ ...quiz, questions: newQuestions });
  };

  const removeQuestion = (idx) => {
    const newQuestions = questions.filter((_, i) => i !== idx);
    setQuestions(newQuestions);
    onChange({ ...quiz, questions: newQuestions });
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-lg shadow p-4 mt-4 border
    ${isDark ? "bg-[#101010] border-[#222]" : "bg-white border-neutral-200"}
  `}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`font-semibold text-lg ${
            isDark ? "text-[#f8f8f8]" : "text-[#080808]"
          }`}
        >
          Quiz
        </span>
        <button
          type="button"
          className={`flex items-center gap-1 px-2 py-1 rounded border text-sm transition
          ${
            isDark
              ? "bg-[#181818] border-[#222] hover:bg-[#222] text-[#a78bfa]"
              : "bg-white border-neutral-200 hover:bg-neutral-100 text-[#7c3aed]"
          }`}
          onClick={() => addQuestion("mcq")}
        >
          <FaPlus /> MCQ
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 px-2 py-1 rounded border text-sm transition
          ${
            isDark
              ? "bg-[#181818] border-[#222] hover:bg-[#222] text-[#a78bfa]"
              : "bg-white border-neutral-200 hover:bg-neutral-100 text-[#7c3aed]"
          }`}
          onClick={() => addQuestion("truefalse")}
        >
          <FaPlus /> True/False
        </button>
      </div>
      <AnimatePresence>
        {questions.map((q, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`mb-6 rounded p-4 shadow-sm border
            ${
              isDark
                ? "bg-[#181818] border-[#222]"
                : "bg-white border-neutral-200"
            }
          `}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={q.question}
                onChange={(e) =>
                  updateQuestion(idx, { ...q, question: e.target.value })
                }
                placeholder="Question"
                className={`flex-1 px-3 py-2 rounded border focus:outline-none focus:ring-2 text-sm transition
                ${
                  isDark
                    ? "border-[#222] bg-[#101010] text-[#f8f8f8] focus:ring-[#a78bfa]/10"
                    : "border-neutral-200 bg-neutral-50 text-[#080808] focus:ring-[#7c3aed]/10"
                }`}
              />
              <select
                value={q.type}
                onChange={(e) => {
                  if (e.target.value === "mcq") {
                    updateQuestion(idx, {
                      ...q,
                      type: "mcq",
                      options: ["", "", "", ""],
                      correctAnswer: 0,
                    });
                  } else {
                    updateQuestion(idx, {
                      ...q,
                      type: "truefalse",
                      options: ["True", "False"],
                      correctAnswer: 0,
                    });
                  }
                }}
                className={`px-2 py-1 rounded border text-sm
                ${
                  isDark
                    ? "border-[#222] bg-[#101010] text-[#f8f8f8]"
                    : "border-neutral-200 bg-neutral-50 text-[#080808]"
                }`}
              >
                <option value="mcq">MCQ</option>
                <option value="truefalse">True/False</option>
              </select>
              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                title="Delete"
                className={`p-2 rounded transition
                ${
                  isDark
                    ? "hover:bg-[#222] text-red-400"
                    : "hover:bg-red-100 text-red-600"
                }`}
              >
                <FaTrash />
              </button>
            </div>
            {q.type === "mcq" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {q.options.map((opt, oidx) => (
                  <div key={oidx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oidx] = e.target.value;
                        updateQuestion(idx, { ...q, options: newOpts });
                      }}
                      placeholder={`Option ${oidx + 1}`}
                      className={`flex-1 px-2 py-1 rounded border text-sm
                      ${
                        isDark
                          ? "border-[#222] bg-[#101010] text-[#f8f8f8]"
                          : "border-neutral-200 bg-neutral-50 text-[#080808]"
                      }`}
                    />
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      checked={q.correctAnswer === oidx}
                      onChange={() =>
                        updateQuestion(idx, { ...q, correctAnswer: oidx })
                      }
                      title="Mark as correct"
                      className={`accent-[#7c3aed] ${
                        isDark ? "dark:accent-[#a78bfa]" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 mt-2">
                {["True", "False"].map((opt, oidx) => (
                  <label
                    key={opt}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`correct-tf-${idx}`}
                      checked={q.correctAnswer === oidx}
                      onChange={() =>
                        updateQuestion(idx, { ...q, correctAnswer: oidx })
                      }
                      className={`accent-[#7c3aed] ${
                        isDark ? "dark:accent-[#a78bfa]" : ""
                      }`}
                    />
                    <span
                      className={isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
                    >
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default QuizEditor;
