"use client";
import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// BLOCK REGISTRY - Add new block types here
// ============================================================================
const BLOCK_REGISTRY = {
  paragraph: {
    label: "Text",
    icon: "T",
    create: () => ({ type: "paragraph", content: "" }),
  },
  h1: {
    label: "Heading 1",
    icon: "H1",
    create: () => ({ type: "h1", content: "" }),
  },
  h2: {
    label: "Heading 2",
    icon: "H2",
    create: () => ({ type: "h2", content: "" }),
  },
  h3: {
    label: "Heading 3",
    icon: "H3",
    create: () => ({ type: "h3", content: "" }),
  },
};

// ============================================================================
// COMMAND PALETTE - Handles / menu with keyboard navigation
// ============================================================================
function CommandPalette({ search, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredBlocks = Object.entries(BLOCK_REGISTRY).filter(([key, block]) =>
    block.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredBlocks.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredBlocks.length) % filteredBlocks.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredBlocks[selectedIndex]) {
          onSelect(filteredBlocks[selectedIndex][0]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredBlocks, selectedIndex, onSelect, onClose]);

  if (filteredBlocks.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: "4px",
        background: "#2f2f2f",
        border: "1px solid #4a4a4a",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        minWidth: "240px",
        maxHeight: "300px",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {filteredBlocks.map(([key, block], idx) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "none",
            background: idx === selectedIndex ? "#3a3a3a" : "transparent",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#e3e2e0",
          }}
        >
          <span style={{ fontWeight: "600", minWidth: "24px" }}>
            {block.icon}
          </span>
          <span>{block.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// DRAG HANDLE ICON
// ============================================================================
function DragHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        cursor: "grab",
        padding: "4px",
        opacity: 0,
        transition: "opacity 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
      }}
      className="drag-handle"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#6b6b6b">
        <circle cx="4" cy="4" r="1.5" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="4" cy="8" r="1.5" />
        <circle cx="12" cy="8" r="1.5" />
        <circle cx="4" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    </div>
  );
}

// ============================================================================
// BLOCK COMPONENT - Individual block with all functionality
// ============================================================================
function Block({
  block,
  blocks,
  updateBlock,
  deleteBlock,
  addBlockAfter,
  moveBlock,
  focusBlock,
  isFocused,
}) {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const inputRef = useRef(null);
  const blockRef = useRef(null);
  const dragStartY = useRef(0);
  const currentIndexRef = useRef(0);

  // Focus when needed
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // Get placeholder based on block type and focus
  const getPlaceholder = () => {
    if (!isFocused) return "";

    switch (block.type) {
      case "h1":
        return "Heading 1";
      case "h2":
        return "Heading 2";
      case "h3":
        return "Heading 3";
      default:
        return "Type / for commands";
    }
  };

  // Handle text changes and detect /
  const handleChange = (e) => {
    const value = e.target.value;

    if (value.endsWith("/")) {
      setShowCommandPalette(true);
      setCommandSearch("");
      updateBlock(block.id, { content: value.slice(0, -1) });
    } else if (showCommandPalette) {
      const lastSlashIndex = value.lastIndexOf("/");
      if (lastSlashIndex === -1) {
        setShowCommandPalette(false);
        updateBlock(block.id, { content: value });
      } else {
        setCommandSearch(value.slice(lastSlashIndex + 1));
        updateBlock(block.id, { content: value.slice(0, lastSlashIndex) });
      }
    } else {
      updateBlock(block.id, { content: value });
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Don't interfere with command palette navigation
    if (showCommandPalette) {
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      addBlockAfter(block.id);
    } else if (
      e.key === "Backspace" &&
      block.content === "" &&
      blocks.length > 1
    ) {
      e.preventDefault();
      const index = blocks.findIndex((b) => b.id === block.id);
      deleteBlock(block.id);
      if (index > 0) {
        focusBlock(blocks[index - 1].id);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const index = blocks.findIndex((b) => b.id === block.id);
      if (index > 0) {
        focusBlock(blocks[index - 1].id);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const index = blocks.findIndex((b) => b.id === block.id);
      if (index < blocks.length - 1) {
        focusBlock(blocks[index + 1].id);
      }
    }
  };

  // Select block type from command palette
  const handleCommandSelect = (blockType) => {
    updateBlock(block.id, { type: blockType });
    setShowCommandPalette(false);
    setCommandSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Drag functionality
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragOffset(0);
    dragStartY.current = e.clientY;
    currentIndexRef.current = blocks.findIndex((b) => b.id === block.id);
    e.preventDefault();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    setDragOffset(deltaY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const blockHeight = 40;
    const indexOffset = Math.round(dragOffset / blockHeight);

    if (indexOffset !== 0) {
      const currentIndex = blocks.findIndex((b) => b.id === block.id);
      const newIndex = Math.max(
        0,
        Math.min(blocks.length - 1, currentIndex + indexOffset)
      );
      const actualOffset = newIndex - currentIndex;

      if (actualOffset !== 0) {
        moveBlock(block.id, actualOffset);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, dragOffset, blocks]);

  // Get style based on block type
  const getBlockStyle = () => {
    const baseStyle = {
      width: "100%",
      background: "transparent",
      border: "none",
      color: "#e3e2e0",
      outline: "none",
      padding: "3px 0",
    };

    switch (block.type) {
      case "h1":
        return {
          ...baseStyle,
          fontSize: "32px",
          fontWeight: "700",
          lineHeight: "1.2",
        };
      case "h2":
        return {
          ...baseStyle,
          fontSize: "24px",
          fontWeight: "700",
          lineHeight: "1.3",
        };
      case "h3":
        return {
          ...baseStyle,
          fontSize: "18px",
          fontWeight: "700",
          lineHeight: "1.4",
        };
      default:
        return { ...baseStyle, fontSize: "16px", lineHeight: "1.5" };
    }
  };

  return (
    <div
      ref={blockRef}
      className="block-wrapper"
      style={{
        position: "relative",
        margin: "2px 0",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? `translateY(${dragOffset}px)` : "none",
        transition: isDragging ? "none" : "all 0.2s ease",
        zIndex: isDragging ? 1000 : 1,
      }}
      onMouseEnter={(e) => {
        const handle = e.currentTarget.querySelector(".drag-handle");
        if (handle) handle.style.opacity = "0.6";
      }}
      onMouseLeave={(e) => {
        const handle = e.currentTarget.querySelector(".drag-handle");
        if (handle && !isDragging) handle.style.opacity = "0";
      }}
    >
      <DragHandle onMouseDown={handleDragStart} />

      <div style={{ flex: 1, position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={block.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          style={getBlockStyle()}
        />

        {showCommandPalette && (
          <CommandPalette
            search={commandSearch}
            onSelect={handleCommandSelect}
            onClose={() => {
              setShowCommandPalette(false);
              setCommandSearch("");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EDITOR COMPONENT - Core editor functionality
// ============================================================================
export default function FloatingNotion({ onClose }) {
  const [title, setTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState([
    { id: Date.now(), type: "paragraph", content: "" },
  ]);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const updateBlock = (id, updates) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addBlockAfter = (id) => {
    const index = blocks.findIndex((b) => b.id === id);
    const newBlock = { id: Date.now(), type: "paragraph", content: "" };
    const newBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1),
    ];
    setBlocks(newBlocks);
    setFocusedBlockId(newBlock.id);
  };

  const moveBlock = (id, offset) => {
    const currentIndex = blocks.findIndex((b) => b.id === id);
    const newIndex = currentIndex + offset;

    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  const focusBlock = (id) => {
    setFocusedBlockId(id);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (blocks.length > 0) {
        setFocusedBlockId(blocks[0].id);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "70%",
          maxWidth: "900px",
          height: "90%",
          backgroundColor: "#191919",
          borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "48px 96px", overflowY: "auto", flex: 1 }}>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "40px",
              fontWeight: "700",
              color: "#e3e2e0",
              marginBottom: "24px",
              background: "transparent",
              padding: 0,
            }}
          />

          {blocks.map((block) => (
            <Block
              key={block.id}
              block={block}
              blocks={blocks}
              updateBlock={updateBlock}
              deleteBlock={deleteBlock}
              addBlockAfter={addBlockAfter}
              moveBlock={moveBlock}
              focusBlock={focusBlock}
              isFocused={focusedBlockId === block.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
