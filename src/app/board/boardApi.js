// boardApi.js
let excalidrawApi = null;

export const setExcalidrawApi = (api) => {
  if (!api) {
    console.warn("❌ Tried to set empty Excalidraw API");
    return;
  }
  excalidrawApi = api;
  console.log("✅ Excalidraw API initialized");
};

export const getExcalidrawApi = () => excalidrawApi;

export const drawExcalidrawElements = async (component, markdown) => {
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

  // Base existing elements
  const currentElements = excalidrawApi.getSceneElements() ?? [];

  // ⚙️ If markdown — do two-phase rendering
  if (component === "markdown") {
    const markdownText = `${markdown}`;

    // Step 1: Now add the real markdown
    const markdownElements = convertToExcalidrawElements(
      generateElements({ component, appState, markdownText })
    );

    // Remove fake text element by filtering it out
    const sceneWithoutFake = excalidrawApi
      .getSceneElements()
      .filter((el) => el.text !== "gibbera;dflasdjfpaupaiwerhadsdgjasdf");

    excalidrawApi.updateScene({
      elements: [...sceneWithoutFake, ...markdownElements],
    });

    return;
  }

  // 🧩 Default single-phase rendering for everything else
  const newElements = convertToExcalidrawElements(
    generateElements({ component, appState })
  );

  excalidrawApi.updateScene({
    elements: [...currentElements, ...newElements],
  });

};
