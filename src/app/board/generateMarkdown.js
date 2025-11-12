// generateMarkdown.js

const generateGroupId = () =>
  `markdown-${Math.random().toString(36).substr(2, 9)}`;

// Approximate text wrapping function
function wrapText(text, fontSize, maxWidth) {
  const approxCharWidth = fontSize * 0.6; // rough width per character
  const maxCharsPerLine = Math.floor(maxWidth / approxCharWidth);
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if (
      (currentLine + (currentLine ? " " : "") + word).length <= maxCharsPerLine
    ) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

export function generateMarkdownPage(centerX, centerY, markdownText) {
  const groupId = generateGroupId();
  const pageWidth = 650;
  const padding = 40;
  const lineSpacing = 10;

  let contentHeight = padding; // top padding
  const elements = [];
  const lines = markdownText.split("\n");

  const processedLines = [];

  // Preprocess lines to handle wrapping and calculate total height
  lines.forEach((line) => {
    line = line.trim();
    if (!line) {
      contentHeight += lineSpacing * 2;
      processedLines.push({ type: "empty" });
      return;
    }

    let fontSize = 24;
    let isQuote = false;

    if (line.startsWith("# ")) {
      fontSize = 36;
      line = line.replace(/^# /, "");
    } else if (line.startsWith("> ")) {
      fontSize = 20;
      line = line.replace(/^> /, "");
      isQuote = true;
    } else if (/^---+$/.test(line)) {
      processedLines.push({ type: "hr" });
      contentHeight += 20;
      return;
    }

    const wrappedLines = wrapText(line, fontSize, pageWidth - 2 * padding);
    processedLines.push({
      type: "text",
      lines: wrappedLines,
      fontSize,
      isQuote,
    });
    contentHeight += wrappedLines.length * (fontSize + lineSpacing);

    if (fontSize === 36) contentHeight += 10; // extra spacing for headers
  });

  const pageHeight = contentHeight + padding; // add bottom padding
  const topY = centerY - pageHeight / 2;

  // Rectangle background
  const pageRect = {
    type: "rectangle",
    x: centerX - pageWidth / 2,
    y: topY,
    width: pageWidth,
    height: pageHeight,
    strokeColor: "#000000",
    backgroundColor: "#ffffff",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    groupIds: [groupId],
  };

  elements.push(pageRect);

  // Place text elements
  let currentY = topY + padding;

  processedLines.forEach((item) => {
    if (item.type === "empty") {
      currentY += lineSpacing * 2;
    } else if (item.type === "hr") {
      elements.push({
        type: "line",
        x: centerX - (pageWidth - 2 * padding) / 2,
        y: currentY,
        width: pageWidth - 2 * padding,
        height: 0,
        strokeColor: "#000000",
        strokeWidth: 2,
        roughness: 1,
        opacity: 100,
        groupIds: [groupId],
      });
      currentY += 20;
    } else if (item.type === "text") {
      const strokeColor = item.isQuote ? "#555555" : "#000000";
      const backgroundColor = item.isQuote ? "#f0f0f0" : "transparent";

      item.lines.forEach((lineText) => {
        elements.push({
          type: "text",
          x: centerX - (pageWidth - 2 * padding) / 2,
          y: currentY,
          text: lineText,
          fontSize: item.fontSize,
          width: pageWidth - 2 * padding,
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
        currentY += item.fontSize + lineSpacing;
      });

      if (item.fontSize === 36) currentY += 10; // extra spacing for headers
    }
  });

  return elements;
}
