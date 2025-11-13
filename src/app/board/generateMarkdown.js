// generateMarkdown.js

const generateGroupId = () =>
  `markdown-${Math.random().toString(36).substr(2, 9)}`;

// Approximate text wrapping function
function wrapText(text, fontSize, maxWidth) {
 const approxCharWidth = fontSize * 0.7; // rough width per character
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
  // 🛑 FIX: Ensure markdownText is a string before calling .split()
  if (typeof markdownText !== 'string') {
      console.warn("generateMarkdownPage received non-string content. Defaulting to empty string.");
      markdownText = "";
  }

  // 🆕 TWEAK: Replace literal '\n' (backslash-n) with an actual newline character.
  markdownText = markdownText.replace(/\\n/g, '\n');

  const groupId = generateGroupId();
  const pageWidth = 650;
  const padding = 40;
  const lineSpacing = 10;
  const rightExtra = 20;

  // ✅ Add minor rounding and jitter to avoid subpixel cutoff
  const jitterX = (Math.random() - 0.5) * 2; // ±1px
  const jitterY = (Math.random() - 0.5) * 2;
  const safeCenterX = Math.round((centerX + jitterX) * 100) / 100;
  const safeCenterY = Math.round((centerY + jitterY) * 100) / 100;

  let contentHeight = padding;
  const elements = [];
  // Line 44: This is now safe and will split on both original newlines and the new ones from the '\n' replacement
  const lines = markdownText.split("\n");
  const processedLines = [];

  // ✅ Dummy invisible preload text (helps font render on first draw)
  elements.push({
    type: "text",
    x: safeCenterX,
    y: safeCenterY,
    text: " ",
    fontSize: 1,
    width: 1,
    height: 1,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "top",
    strokeColor: "transparent",
    backgroundColor: "transparent",
    strokeWidth: 0,
    roughness: 0,
    opacity: 0,
    groupIds: [],
  });

  // Process lines
  lines.forEach((line) => {
    line = line.trim();
    if (!line) {
      contentHeight += lineSpacing * 2;
      processedLines.push({ type: "empty" });
      return;
    }

    let fontSize = 24;
    let isQuote = false;
    let isMem = false;

    if (line.startsWith("# ")) {
      fontSize = 36;
      line = line.replace(/^# /, "");
    } else if (line.startsWith(">> ")) { // New condition: '>> ' for isMem
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

    const wrappedLines = wrapText(line, fontSize, pageWidth - 2);
    processedLines.push({
      type: "text",
      lines: wrappedLines,
      fontSize,
      isQuote,
      isMem,
    });
    contentHeight += wrappedLines.length * (fontSize + lineSpacing);

    if (fontSize === 36) contentHeight += 10; // extra spacing for headers
  });

  const pageHeight = contentHeight + padding;
  const topY = safeCenterY - pageHeight / 2;

  // Rectangle background
  const pageRect = {
    type: "rectangle",
    x: safeCenterX - pageWidth / 2,
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

  let currentY = topY + padding;

  processedLines.forEach((item) => {
    if (item.type === "empty") {
      currentY += lineSpacing * 2;
    } else if (item.type === "hr") {
      elements.push({
        type: "line",
        x: safeCenterX - (pageWidth - 2 * padding) / 2,
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
      const strokeColor = item.isMem
    ? "#ff8383" // New stroke color when isMem is TRUE (e.g., a shade of blue)
    : item.isQuote
    ? "#555555" // Original stroke color when isQuote is TRUE
    : "#000000"; // Default stroke color (when neither isMem nor isQuote is TRUE)

const backgroundColor = item.isMem
    ? "#f0f0f0" // New background color when isMem is TRUE (e.g., light blue)
    : item.isQuote
    ? "#f0f0f0" // Original background color when isQuote is TRUE
    : "transparent"; // Default background color

      item.lines.forEach((lineText) => {
        elements.push({
          type: "text",
          x: safeCenterX - (pageWidth - 2 * padding) / 2 ,
          y: currentY,
          text: lineText,
          fontSize: item.fontSize,
          width: pageWidth - 2, // keep wide enough for wrapping
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

      if (item.fontSize === 36) currentY += 10;
    }
  });

  return elements;
}