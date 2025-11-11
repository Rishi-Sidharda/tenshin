// boardApi.js
let excalidrawApi = null;

/**
 * Store the Excalidraw API globally after it's ready.
 */
export const setExcalidrawApi = (api) => {
  if (!api) {
    console.warn("❌ Tried to set empty Excalidraw API");
    return;
  }
  excalidrawApi = api;
  console.log("✅ Excalidraw API initialized");
};

/**
 * Retrieve the API anywhere.
 */
export const getExcalidrawApi = () => excalidrawApi;

/**
 * Safely draw an element on the canvas (centered on current view).
 */
export const drawExcalidrawElements = async (component) => {
  // Guard: must be in the browser
  if (typeof window === "undefined") {
    console.warn("⚠️ drawExcalidrawElements called on server");
    return;
  }

  // Guard: must have API ready
  if (!excalidrawApi || typeof excalidrawApi.updateScene !== "function") {
    console.warn("⚠️ Excalidraw API not ready yet");
    return;
  }

  // Dynamically import only when client-side
  const { convertToExcalidrawElements } = await import(
    "@excalidraw/excalidraw"
  );
  const { generateElements } = await import("./generateElements");

  // ✅ Get current app state to compute center coordinates
  const appState = excalidrawApi.getAppState();

  // Generate new centered elements
  const newElements = convertToExcalidrawElements(
    generateElements({ component, appState })
  );

  // Append elements safely
  const currentElements = excalidrawApi.getSceneElements() ?? [];

  excalidrawApi.updateScene({
    elements: [...currentElements, ...newElements],
  });

  console.log(`✅ Added "${component}"`);
};
