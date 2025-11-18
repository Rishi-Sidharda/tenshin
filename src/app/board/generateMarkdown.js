// generateMarkdown.js

const STORAGE_KEY = "tenshin";
const BOARD_DATA_KEY = "boardData";

import { useSearchParams } from "next/navigation";

// --- Configuration is now handled via function arguments, but we keep
// the line spacing constant locally as it's a structural element.
const LINE_SPACING = 10;

const generateGroupId = () =>
  `markdown-${Math.random().toString(36).substr(2, 9)}`;

// NOTE: wrapText now takes charFactor as an argument instead of using a global const.
function wrapText(text, fontSize, maxWidth, charFactor) {
  // Uses the passed-in charFactor for consistent line wrapping
  const approxCharWidth = fontSize * charFactor;
  const maxCharsPerLine = Math.floor(maxWidth / approxCharWidth);
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  let maxLineLength = 0;

  words.forEach((word) => {
    // 1. Handle extremely long words
    if (word.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        maxLineLength = Math.max(maxLineLength, currentLine.length);
      }
      lines.push(word);
      maxLineLength = Math.max(maxLineLength, word.length);
      currentLine = "";
      return;
    }

    // 2. Original wrapping logic
    const nextLine = currentLine + (currentLine ? " " : "") + word;

    if (nextLine.length <= maxCharsPerLine) {
      currentLine = nextLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        maxLineLength = Math.max(maxLineLength, currentLine.length);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
    maxLineLength = Math.max(maxLineLength, currentLine.length);
  }

  return { lines, maxLineLength };
}

// Function now accepts configuration parameters as arguments with defaults
export function generateMarkdownPage(
  centerX,
  centerY,
  markdownText,
  BOARD_DATA_KEY,
  // New Configurable Parameters with current defaults
  baseWidth = 650,
  paddingLeft = 40,
  paddingRight = 20,
  charFactor = 0.6
) {
  // --- Get current boardId from localStorage (unchanged) ---
  const params = new URLSearchParams(window.location.search);
  const boardId = params.get("id");

  if (!boardId) {
    console.warn(
      "generateMarkdownPage: no boardId found, cannot save markdown"
    );
  }

  if (typeof markdownText !== "string") {
    console.warn(
      "generateMarkdownPage received non-string content. Defaulting to empty string."
    );
    markdownText = "";
  }

  const markdownTextRaw = markdownText;

  markdownText = markdownText.replace(/\\n/g, "\n");

  const groupId = generateGroupId();

  // Content width starts with the space provided by the base width minus the configured paddings
  let maxContentWidth = baseWidth - paddingLeft - paddingRight;

  const jitterX = (Math.random() - 0.5) * 2;
  const jitterY = (Math.random() - 0.5) * 2;
  const safeCenterX = Math.round((centerX + jitterX) * 100) / 100;
  const safeCenterY = Math.round((centerY + jitterY) * 100) / 100;

  let contentHeight = paddingLeft; // Use paddingLeft for top padding
  const elements = [];

  const lines = markdownText.split("\n");
  const processedLines = [];

  lines.forEach((line) => {
    line = line.trim();
    if (!line) {
      contentHeight += LINE_SPACING * 2;
      processedLines.push({ type: "empty" });
      return;
    }

    let fontSize = 24;
    let isQuote = false;
    let isMem = false;

    if (line.startsWith("# ")) {
      fontSize = 36;
      line = line.replace(/^# /, "");
    } else if (line.startsWith(">> ")) {
      fontSize = 20;
      line = line.replace(/^>> /, "");
      isMem = true;
    } else if (line.startsWith("> ")) {
      fontSize = 20;
      line = line.replace(/^> /, "");
      isQuote = true;
    } else if (/^---+$/.test(line)) {
      processedLines.push({ type: "hr" });
      contentHeight += 20;
      return;
    }

    // Pass the current maxContentWidth AND charFactor for wrapping
    const wrapResult = wrapText(line, fontSize, maxContentWidth, charFactor);
    const wrappedLines = wrapResult.lines;
    const maxLineLength = wrapResult.maxLineLength;

    // Calculate the width required for the longest line/word using the consistent factor
    const approxCharWidth = fontSize * charFactor;
    const requiredLineWidth = maxLineLength * approxCharWidth;

    // Update the overall maximum required content width
    maxContentWidth = Math.max(maxContentWidth, requiredLineWidth);

    processedLines.push({
      type: "text",
      lines: wrappedLines,
      fontSize,
      isQuote,
      isMem,
    });
    contentHeight += wrappedLines.length * (fontSize + LINE_SPACING);

    if (fontSize === 36) contentHeight += 10;
  });

  // Calculate the final page width, using the base width as the minimum
  const finalPageWidth = Math.max(
    baseWidth,
    maxContentWidth + paddingLeft + paddingRight // Max content + configured margins
  );

  // Use paddingLeft for top/bottom margin consistency
  const pageHeight = contentHeight + paddingLeft;
  const topY = safeCenterY - pageHeight / 2;

  // Calculate element positions based on the final, potentially wider, page
  const contentWidth = finalPageWidth - paddingLeft - paddingRight; // The actual width available for text
  const pageRectLeftX = safeCenterX - finalPageWidth / 2;
  const textStartX = pageRectLeftX + paddingLeft; // Align the text content 'paddingLeft' away from the left edge

  const pageRect = {
    type: "rectangle",
    x: safeCenterX - finalPageWidth / 2, // Center the rectangle on the new width
    y: topY,
    width: finalPageWidth, // Use the calculated width
    height: pageHeight,
    strokeColor: "#000000",
    backgroundColor: "#ffffff",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    groupIds: [groupId],
  };
  elements.push(pageRect);

  let currentY = topY + paddingLeft;

  processedLines.forEach((item) => {
    if (item.type === "empty") {
      currentY += LINE_SPACING * 2;
    } else if (item.type === "hr") {
      const hrWidth = finalPageWidth - paddingLeft - paddingRight;
      elements.push({
        type: "line",
        x: safeCenterX - hrWidth / 2, // Center the HR
        y: currentY,
        width: hrWidth, // Use adjusted HR width
        height: 0,
        strokeColor: "#000000",
        strokeWidth: 2,
        roughness: 1,
        opacity: 100,
        groupIds: [groupId],
      });
      currentY += 20;
    } else if (item.type === "text") {
      const strokeColor = item.isMem
        ? "#ff8383"
        : item.isQuote
        ? "#555555"
        : "#000000";
      const backgroundColor =
        item.isMem || item.isQuote ? "#f0f0f0" : "transparent";

      item.lines.forEach((lineText) => {
        elements.push({
          type: "text",
          x: textStartX, // Use the adjusted start X position (aligned with left padding)
          y: currentY,
          text: lineText,
          fontSize: item.fontSize,
          width: contentWidth, // Use the adjusted content width
          height: item.fontSize + 8,
          fontFamily: 1,
          textAlign: "left",
          verticalAlign: "top",
          strokeColor,
          backgroundColor,
          strokeWidth: 1,
          roughness: 1,
          opacity: 100,
          groupIds: [groupId],
        });
        currentY += item.fontSize + LINE_SPACING;
      });

      if (item.fontSize === 36) currentY += 10;
    }
  });

  // --- SAVE TO boardsData (unchanged) ---
  if (boardId) {
    try {
      // Load all boards
      const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);
      const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};

      // Ensure board exists
      const oldBoard = boardsData[boardId] || {};

      // Preserve all existing sections exactly as handleSave() expects
      const newRegistry = {
        ...(oldBoard.markdown_registry || {}),
        [groupId]: {
          id: groupId,
          text: markdownTextRaw,
        },
      };

      const updatedBoard = {
        ...oldBoard,
        elements: oldBoard.elements || [],
        files: oldBoard.files || {},
        appState: oldBoard.appState || {},
        markdown_registry: newRegistry,

        // keep hashes untouched — handleSave() recalculates them
        elements_hash: oldBoard.elements_hash,
        files_hash: oldBoard.files_hash,
        appState_hash: oldBoard.appState_hash,
        markdown_hash: oldBoard.markdown_hash,
      };

      boardsData[boardId] = updatedBoard;

      localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(boardsData));

      console.log(`Markdown saved to board ${boardId}`, groupId);
    } catch (e) {
      console.error("Failed to save markdown to registry", e);
    }
  }

  return elements;
}
