import { generateMarkdownPage } from "./generateMarkdown";

export function generateElements({ component, appState }) {
  const { scrollX, scrollY, zoom, width, height } = appState;

  const centerX = -scrollX + width / (2 * (zoom.value || zoom));
  const centerY = -scrollY + height / (2 * (zoom.value || zoom));

  const randomOffset = (range) => (Math.random() - 0.5) * range;
  const offsetX = randomOffset(200);
  const offsetY = randomOffset(150);

  const x = centerX + offsetX;
  const y = centerY + offsetY;

  // Placeholder markdown text
  const placeholderMarkdown = `
# API Overview

This API allows users to authenticate, fetch resources, and update data. Below is a detailed description of the endpoints and how they interact. The text is long enough to wrap naturally within the available width.

> Remember: Always use HTTPS and include an authorization token in the headers.
>> ok this is a memo and you can use this and see this.

After a successful authentication, you’ll receive a JSON response that includes your session details, permissions, and expiration time. If authentication fails, the response will include an appropriate error message.

---

# Sample Request



`;

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
      text: "Created at",
      fontSize: 24,
      width: 100,
      height: 100,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      strokeColor: "#2ECC71",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    markdown: generateMarkdownPage(centerX, centerY, placeholderMarkdown), // grouped markdown
  };

  const element = componentsMap[component] || componentsMap.rectangle;

  return Array.isArray(element) ? element : [element];
}
