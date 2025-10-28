// boardApi.js
let excalidrawApi = null;

export const setExcalidrawApi = (api) => {
  excalidrawApi = api;
};

export const getExcalidrawApi = () => excalidrawApi;

// The same function you want globally accessible
export const handleCommandPallet = async () => {
  if (!excalidrawApi) return;

  const { convertToExcalidrawElements } = await import(
    "@excalidraw/excalidraw"
  );
  const { generateElements } = await import("./generateElements");

  const newElements = convertToExcalidrawElements(generateElements());

  excalidrawApi.updateScene({
    elements: [...excalidrawApi.getSceneElements(), ...newElements],
  });
};
