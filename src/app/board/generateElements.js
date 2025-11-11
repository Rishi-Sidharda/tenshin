export function generateElements({ component, appState }) {
  // appState should come from excalidrawRef.current.getAppState()
  const { scrollX, scrollY, zoom, width, height } = appState;

  // Center of the current visible canvas (accounting for zoom and scroll)
  const centerX = -scrollX + width / (2 * zoom.value || zoom);
  const centerY = -scrollY + height / (2 * zoom.value || zoom);

  const timeStamp = new Date().toLocaleTimeString();

  const componentsMap = {
    rectangle: {
      type: "rectangle",
      x: centerX - 75,
      y: centerY - 50,
      width: 150,
      height: 100,
      backgroundColor: "#EAF2F8",
      strokeColor: "#3498DB",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    ellipse: {
      type: "ellipse",
      x: centerX - 60,
      y: centerY - 60,
      width: 120,
      height: 120,
      strokeColor: "#E67E22",
      backgroundColor: "#FCF3CF",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    diamond: {
      type: "diamond",
      x: centerX - 50,
      y: centerY - 50,
      width: 100,
      height: 100,
      strokeColor: "#9B59B6",
      backgroundColor: "#F5EEF8",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
    text: {
      type: "text",
      x: centerX - 120 / 2,
      y: centerY - 20 / 2,
      text: `Created at ${timeStamp}`,
      fontSize: 24,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      strokeColor: "#2ECC71",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 1,
      opacity: 100,
    },
  };

  const element = componentsMap[component] || componentsMap.rectangle;

  return [element];
}
