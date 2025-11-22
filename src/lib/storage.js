// lib/storage.js - FINAL VERSION WITH TWO DEDICATED STORES AND ERROR FIXES

import { openDB } from "idb";

// --- INDEXEDDB SETUP ---

const DB_NAME = "BoardStorage";
const DB_VERSION = 2;

/**
 * Opens and initializes the IndexedDB database, creating two object stores.
 * @returns {Promise<IDBDatabase>} The initialized database instance.
 */
async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store 1: For the heavy board data object (keyed by BOARD_DATA_KEY)
      if (!db.objectStoreNames.contains("boardDataStore")) {
        db.createObjectStore("boardDataStore", { keyPath: "key" });
      }
      // Store 2: For the lightweight metadata object (keyed by STORAGE_KEY)
      if (!db.objectStoreNames.contains("tenshinStore")) {
        db.createObjectStore("tenshinStore", { keyPath: "key" });
      }
    },
  });
}

// --- EXPORTED STORAGE FUNCTIONS ---

/**
 * Loads board content from IndexedDB and updates the Excalidraw scene.
 */
export async function loadBoardData({
  api,
  boardId,
  isLoaded,
  setIsLoaded,
  BOARD_DATA_KEY,
}) {
  // 🛑 Guard: Prevent execution if key is null/undefined
  if (!api || !boardId || isLoaded || !BOARD_DATA_KEY) return;

  try {
    const db = await getDb();

    // 1. Load the entire object containing ALL board data from the boardDataStore
    const fullBoardsDataObject =
      (await db.get("boardDataStore", BOARD_DATA_KEY)) || {};

    // 2. Access the specific board using boardId
    const boardContent = fullBoardsDataObject[boardId];

    if (boardContent) {
      const fixedAppState = {
        ...boardContent.appState,
        collaborators: new Map(),
      };

      setTimeout(() => {
        api.updateScene({
          elements: boardContent.elements || [],
          appState: fixedAppState,
          files: boardContent.files || {},
        });
        api.scrollToContent(boardContent.elements || []);
        setIsLoaded(true);
      }, 300);
    } else {
      setIsLoaded(true);
    }
  } catch (error) {
    console.error("Error loading board from IndexedDB:", error);
    setIsLoaded(true);
  }
}

/**
 * Handles Excalidraw element change event, checking for selected markdown elements.
 */
export async function handleChange({
  elements,
  state,
  boardId,
  BOARD_DATA_KEY,
  setShowMarkdownButton,
  setSelectedMarkdownText,
  setSelectedMarkdownGroupId,
}) {
  // 🛑 Guard: Ensure BOARD_DATA_KEY is present
  if (!BOARD_DATA_KEY) return;

  const { selectedElementIds } = state;

  // No selection, hide button and clear text
  if (!selectedElementIds || Object.keys(selectedElementIds).length === 0) {
    setShowMarkdownButton(false);
    setSelectedMarkdownText(null);
    setSelectedMarkdownGroupId(null);
    return;
  }

  const selectedElements = elements.filter((el) => selectedElementIds[el.id]);

  const db = await getDb();

  // 1. Load the full boardsData object
  const fullBoardsDataObject =
    (await db.get("boardDataStore", BOARD_DATA_KEY)) || {};

  // 2. Access the specific board and registry
  const currentBoard = fullBoardsDataObject[boardId] || {};
  const markdownRegistry = currentBoard.markdown_registry || {};

  // Find first markdown element among selection
  const markdownElement = selectedElements.find((el) =>
    el.groupIds?.some(
      (id) => id.startsWith("markdown-") && markdownRegistry[id],
    ),
  );

  if (markdownElement) {
    setShowMarkdownButton(true);

    const markdownGroupId = markdownElement.groupIds.find((id) =>
      id.startsWith("markdown-"),
    );

    const markdownTextRaw = markdownRegistry[markdownGroupId]?.text || "";
    const markdownGroupIdRaw = markdownRegistry[markdownGroupId]?.id || "";

    setSelectedMarkdownText(markdownTextRaw);
    setSelectedMarkdownGroupId(markdownGroupIdRaw);
  } else {
    setShowMarkdownButton(false);
    setSelectedMarkdownText(null);
    setSelectedMarkdownGroupId(null);
  }
}

/**
 * Deletes the currently selected markdown group from the canvas and storage.
 */
export async function deleteMarkdown({
  api,
  boardId,
  selectedMarkdownGroupId,
  BOARD_DATA_KEY,
  setSelectedMarkdownText,
  setShowMarkdownButton,
}) {
  // 🛑 Guard: Ensure BOARD_DATA_KEY is present
  if (!selectedMarkdownGroupId || !BOARD_DATA_KEY) return;

  // 1️⃣ Remove matching elements from the canvas
  const currentElements = api.getSceneElements();
  const updatedElements = currentElements.filter(
    (el) => !el.groupIds?.includes(selectedMarkdownGroupId),
  );
  api.updateScene({ elements: updatedElements });

  // 2️⃣ Update markdown_registry in IndexedDB
  const db = await getDb();

  // Load the full boards data object
  const boardsData = (await db.get("boardDataStore", BOARD_DATA_KEY)) || {};

  if (boardsData[boardId]?.markdown_registry) {
    // Delete the entry from the JS object
    delete boardsData[boardId].markdown_registry[selectedMarkdownGroupId];

    // Write the full boardsData object back
    await db.put("boardDataStore", { key: BOARD_DATA_KEY, ...boardsData });
  }

  // 3️⃣ Reset UI state
  setSelectedMarkdownText(null);
  setShowMarkdownButton(false);
}

/**
 * Saves the current Excalidraw scene to IndexedDB.
 */
export async function handleSave({
  api,
  boardId,
  STORAGE_KEY,
  BOARD_DATA_KEY,
  user,
}) {
  // 🛑 Guard: Ensure all required keys are present before starting DB access
  if (!api || !boardId || !STORAGE_KEY || !BOARD_DATA_KEY) {
    return;
  }

  // Get live data
  const elements = api.getSceneElements();
  const files = api.getFiles();
  const rawAppState = api.getAppState();

  // 2. PREPARE SAFE APP STATE
  const safeAppState = {
    theme: rawAppState.theme,
    gridSize: rawAppState.gridSize,
    zoom: rawAppState.zoom?.value,
    viewBackgroundColor: rawAppState.viewBackgroundColor,
    name: rawAppState.name,
    scrollX: Math.round(rawAppState.scrollX),
    scrollY: Math.round(rawAppState.scrollY),
  };

  // 3. ASYNCHRONOUS DATA LOAD
  const db = await getDb();

  // Load tenshin (metadata) from tenshinStore
  const tenshin = (await db.get("tenshinStore", STORAGE_KEY)) || {
    key: STORAGE_KEY, // Key is required for db.put
    boards: {},
    folders: {},
    ui: { collapsedFolders: {} },
    userId: user?.id,
  };

  // Load the whole boardsData object from boardDataStore
  const boardsData = (await db.get("boardDataStore", BOARD_DATA_KEY)) || {
    key: BOARD_DATA_KEY, // Key is required for db.put
  };

  const oldBoard = boardsData[boardId] || {};
  const oldRegistry = oldBoard.markdown_registry || {};

  // 4. CALCULATE NEW HASHES
  const newHashes = {
    elements:
      elements.length + ":" + (elements[elements.length - 1]?.version ?? 0),
    files: Object.keys(files).length.toString(),
    appState: [
      safeAppState.scrollX,
      safeAppState.scrollY,
      safeAppState.theme,
      safeAppState.viewBackgroundColor,
    ].join("|"),
    markdown: Object.keys(oldRegistry).length.toString(),
  };

  const oldHashes = {
    elements: oldBoard.elements_hash,
    files: oldBoard.files_hash,
    appState: oldBoard.appState_hash,
    markdown: oldBoard.markdown_hash,
  };

  // 5. CONDITIONAL UPDATE
  let somethingChanged = false;
  const updatedBoard = { ...oldBoard };

  if (oldHashes.elements !== newHashes.elements) {
    updatedBoard.elements = elements;
    updatedBoard.elements_hash = newHashes.elements;
    somethingChanged = true;
  }

  if (oldHashes.files !== newHashes.files) {
    updatedBoard.files = files;
    updatedBoard.files_hash = newHashes.files;
    somethingChanged = true;
  }

  if (oldHashes.appState !== newHashes.appState) {
    updatedBoard.appState = safeAppState;
    updatedBoard.appState_hash = newHashes.appState;
    somethingChanged = true;
  }

  if (oldHashes.markdown !== newHashes.markdown) {
    updatedBoard.markdown_registry = { ...oldRegistry };
    updatedBoard.markdown_hash = newHashes.markdown;
    somethingChanged = true;
  }

  // 6. UPDATE METADATA & ASYNCHRONOUS SAVE
  if (somethingChanged) {
    // Update the specific board entry inside the boardsData object
    boardsData[boardId] = updatedBoard;

    // Update metadata object (tenshin)
    if (!tenshin.boards[boardId]) {
      tenshin.boards[boardId] = {
        id: boardId,
        name: updatedBoard.appState?.name || "Untitled Board",
        icon: "Brush",
      };
    }
    tenshin.boards[boardId].updatedAt = new Date().toISOString();
  }

  if (user) {
    tenshin.userId = user.id;
  }

  if (somethingChanged) {
    // ASYNC WRITE 1: Write the updated boardsData object to its dedicated store
    // boardsData contains the key property: { key: BOARD_DATA_KEY, boardId1: {...}, ... }
    await db.put("boardDataStore", boardsData);

    // ASYNC WRITE 2: Write the updated tenshin metadata to its dedicated store
    await db.put("tenshinStore", tenshin);
  } else {
    // console.log("Autosave: No changes detected, write skipped.");
  }
}

/**
 * Saves markdown text and its group ID to the markdown_registry of a specific board
 * in IndexedDB using a "Fire-and-Forget" approach.
 * WARNING: The caller will not know if the save operation succeeded or failed immediately.
 * * @param {string} boardId - The ID of the board being modified.
 * @param {string} groupId - The unique group ID assigned to the new markdown elements.
 * @param {string} markdownTextRaw - The raw markdown text content.
 * @param {string} BOARD_DATA_KEY - The user-specific key for the board data store.
 */
export function saveMarkdownToRegistry({
  boardId,
  groupId,
  markdownTextRaw,
  BOARD_DATA_KEY,
}) {
  // 🛑 Guard: Prevent execution if essential keys/IDs are missing
  if (!boardId || !groupId || !BOARD_DATA_KEY) {
    console.warn("saveMarkdownToRegistry skipped: Missing required ID or key.");
    return;
  }

  // Use a Promise chain instead of async/await so the function can be called synchronously
  getDb() // Assumes getDb() is defined and returns a Promise<IDBDatabase>
    .then((db) => {
      // 1. Load the entire container object containing ALL boards
      return db.get("boardDataStore", BOARD_DATA_KEY).then((boardsData) => {
        boardsData = boardsData || { key: BOARD_DATA_KEY };

        // 2. Ensure board exists or initialize it
        const oldBoard = boardsData[boardId] || {};

        // 3. Create the new registry entry
        const newRegistry = {
          ...(oldBoard.markdown_registry || {}),
          [groupId]: {
            id: groupId,
            text: markdownTextRaw,
          },
        };

        // 4. Create the updated board record, preserving data and hashes
        const updatedBoard = {
          ...oldBoard,
          elements: oldBoard.elements || [],
          files: oldBoard.files || {},
          appState: oldBoard.appState || {},
          markdown_registry: newRegistry,

          // Preserve hashes for handleSave() comparison on next autosave
          elements_hash: oldBoard.elements_hash,
          files_hash: oldBoard.files_hash,
          appState_hash: oldBoard.appState_hash,
          markdown_hash: oldBoard.markdown_hash,
        };

        // 5. Update the board entry inside the main container object
        boardsData[boardId] = updatedBoard;

        // 6. ASYNC Write the entire container object back to IndexedDB
        return db.put("boardDataStore", boardsData);
      });
    })
    .then(() => {
      console.log(
        `Markdown saved (fire-and-forget) to board ${boardId}, group: ${groupId}`,
      );
    })
    .catch((e) => {
      // 7. Catch and log errors, but don't disrupt the main thread
      console.error(
        "Failed to save markdown to registry in IndexedDB (Fire-and-Forget Error):",
        e,
      );
    });
}
