import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Markdown from "react-markdown";
import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronRight,
  FaGripVertical,
} from "react-icons/fa";
import Mermaid from "./Mermaid"; // Component to render mermaid code
import QuizEditor from "./QuizEditor"; // Component for MCQ/TrueFalse
import "./CourseEditor.css"; // Add responsive, clean styles

// Helper for recursive rendering
const TopicNode = ({
  node,
  onUpdate,
  onAddChild,
  onRemove,
  onMove,
  parentId,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`topic-node depth-${depth}`}>
      <div className="topic-header">
        <span className="drag-handle">
          <FaGripVertical />
        </span>
        <button onClick={() => setExpanded((e) => !e)}>
          {expanded ? <FaChevronDown /> : <FaChevronRight />}
        </button>
        <input
          className="topic-title"
          value={node.title}
          onChange={(e) => onUpdate({ ...node, title: e.target.value })}
          placeholder="Section/Topic Title"
        />
        <select
          value={node.type}
          onChange={(e) => onUpdate({ ...node, type: e.target.value })}
        >
          <option value="section">Section</option>
          <option value="topic">Topic</option>
        </select>
        <button onClick={() => onAddChild(node.id)} title="Add Subtopic">
          <FaPlus />
        </button>
        {parentId && (
          <button onClick={() => onRemove(node.id)} title="Delete">
            <FaTrash />
          </button>
        )}
      </div>
      {expanded && (
        <div className="topic-content">
          <div className="split-editor">
            <textarea
              value={node.content}
              onChange={(e) => onUpdate({ ...node, content: e.target.value })}
              placeholder="Write notes in markdown..."
              rows={6}
            />
            <div className="markdown-preview">
              <Markdown>{node.content}</Markdown>
            </div>
          </div>
          <div className="media-inputs">
            <input
              type="url"
              value={node.videoUrls?.[0] || ""}
              onChange={(e) =>
                onUpdate({ ...node, videoUrls: [e.target.value] })
              }
              placeholder="Video URL"
            />
            <input
              type="url"
              value={node.imageUrls?.[0] || ""}
              onChange={(e) =>
                onUpdate({ ...node, imageUrls: [e.target.value] })
              }
              placeholder="Image URL"
            />
          </div>
          <Mermaid
            code={node.mermaid}
            onGenerate={async (desc) => {
              // Call backend Gemini endpoint
              const res = await fetch("/api/diagram/generate-mermaid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: desc }),
              });
              const data = await res.json();
              onUpdate({ ...node, mermaid: data.mermaid });
            }}
            onChange={(code) => onUpdate({ ...node, mermaid: code })}
          />
          <QuizEditor
            quiz={node.quiz}
            onChange={(quiz) => onUpdate({ ...node, quiz })}
          />
          <select
            value={node.quiz?.difficulty || "basic"}
            onChange={(e) =>
              onUpdate({
                ...node,
                quiz: { ...node.quiz, difficulty: e.target.value },
              })
            }
          >
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {/* Render children recursively */}
          {node.children && node.children.length > 0 && (
            <div className="topic-children">
              {node.children.map((child) => (
                <TopicNode
                  key={child.id}
                  node={child}
                  onUpdate={(updatedChild) => {
                    onUpdate({
                      ...node,
                      children: node.children.map((c) =>
                        c.id === updatedChild.id ? updatedChild : c
                      ),
                    });
                  }}
                  onAddChild={onAddChild}
                  onRemove={(childId) =>
                    onUpdate({
                      ...node,
                      children: node.children.filter((c) => c.id !== childId),
                    })
                  }
                  onMove={onMove}
                  parentId={node.id}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CourseEditor = ({ initialTree = [], onSave }) => {
  const [contentTree, setContentTree] = useState(initialTree);

  // Add, update, remove, move helpers
  const addNode = (parentId) => {
    const newNode = {
      id: uuidv4(),
      title: "",
      type: "topic",
      content: "",
      videoUrls: [],
      imageUrls: [],
      mermaid: "",
      quiz: { questions: [], difficulty: "basic" },
      children: [],
    };
    const addRec = (nodes) =>
      nodes.map((node) =>
        node.id === parentId
          ? { ...node, children: [...(node.children || []), newNode] }
          : { ...node, children: addRec(node.children || []) }
      );
    setContentTree(
      contentTree.length === 0 && !parentId ? [newNode] : addRec(contentTree)
    );
  };

  const updateNode = (updatedNode) => {
    const updateRec = (nodes) =>
      nodes.map((node) =>
        node.id === updatedNode.id
          ? updatedNode
          : { ...node, children: updateRec(node.children || []) }
      );
    setContentTree(updateRec(contentTree));
  };

  const removeNode = (id) => {
    const removeRec = (nodes) =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => ({ ...node, children: removeRec(node.children || []) }));
    setContentTree(removeRec(contentTree));
  };

  // TODO: Implement drag-and-drop for reordering nodes

  return (
    <div className="course-editor">
      <h2>Edit Course Content</h2>
      <button onClick={() => addNode(null)}>
        <FaPlus /> Add Root Section/Topic
      </button>
      <div className="content-tree">
        {contentTree.map((node) => (
          <TopicNode
            key={node.id}
            node={node}
            onUpdate={updateNode}
            onAddChild={addNode}
            onRemove={removeNode}
            onMove={() => {}} // Placeholder for drag-and-drop
            parentId={null}
          />
        ))}
      </div>
      <button className="save-btn" onClick={() => onSave(contentTree)}>
        Save Course
      </button>
    </div>
  );
};

export default CourseEditor;
