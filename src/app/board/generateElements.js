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
# Project Overview

This project aims to test the dynamic resizing of text boxes in our markdown re
nderer. The paragraph below is intentionally long, including multiple sentences, commas, and various punctuation marks to push the limits of our wrapping logic. Every single word should wrap correctly within the rectangle width, and the rectangle height should grow accordingly.

> Quote Block Example: This quote is very long and designed to check if the wrapping and responsive behavior works properly. The background and stroke color should be different from normal text, and the text should still respect the left and right padding of the rectangle.

Here is another paragraph that is extremely verbose, containing multiple clauses, explanations, and exampl
es. It should span multiple lines and demonstrate that both paragraph text and quote text behave as expected when reaching the edges of the rectangle. Ensure that spacing between lines remains consistent and visually pleasing.

---

# Conclusion

Final notes on testing the markdown generator. Make sure headers, quotes, paragraphs, and horizontal rules all display correctly. Very long lines should wrap, and the rectangle height should expand dynamically to accommodate the content without cutting anything off.

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
