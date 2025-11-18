import { generateMarkdownPage } from "./generateMarkdown";

export function generateElements({
  component,
  appState,
  markdownText,
  BOARD_DATA_KEY,
}) {
  const { scrollX, scrollY, zoom, width, height } = appState;

  const centerX = -scrollX + width / (2 * (zoom.value || zoom));
  const centerY = -scrollY + height / (2 * (zoom.value || zoom));

  const randomOffset = (range) => (Math.random() - 0.5) * range;
  const offsetX = randomOffset(200);
  const offsetY = randomOffset(150);

  const x = centerX + offsetX;
  const y = centerY + offsetY;

  // Placeholder markdown text
  const markdown_text = `${markdownText}`;

  // Default shapes map
  const componentsMap = {
    rectangle: {
      type: "rectangle",
      x: x - 125,
      y: y - 100,
      width: 250,
      height: 200,
      backgroundColor: "transparent",
      strokeColor: "#000000",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    ellipse: {
      type: "ellipse",
      x: x - 125,
      y: y - 100,
      width: 250,
      height: 200,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    diamond: {
      type: "diamond",
      x: x - 100,
      y: y - 100,
      width: 200,
      height: 200,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    text: {
      type: "text",
      x: x - 120 / 2,
      y: y - 20 / 2,
      text: "Sure Here is a text...",
      fontSize: 24,
      width: 100,
      height: 100,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      strokeColor: "#000000",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    markdown: generateMarkdownPage(
      centerX,
      centerY,
      markdown_text,
      BOARD_DATA_KEY
    ), // grouped markdown
  };

  const element = componentsMap[component] || componentsMap.rectangle;

  return Array.isArray(element) ? element : [element];
}
