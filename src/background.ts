/// <reference types="chrome"/>

// Make this file a module by adding an export
export {};

// Default settings
const DEFAULT_SETTINGS = {
  customUrl: "https://www.google.com",
  isEnabled: true,
};

// Initialize extension with default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["customUrl", "isEnabled"], (result) => {
    if (!result.customUrl) {
      chrome.storage.sync.set({ customUrl: DEFAULT_SETTINGS.customUrl });
    }
    if (result.isEnabled === undefined) {
      chrome.storage.sync.set({ isEnabled: DEFAULT_SETTINGS.isEnabled });
    }
  });
});

// Listen for new tabs being created (fallback for browsers that don't respect chrome_url_overrides)
chrome.tabs.onCreated.addListener((tab) => {
  // Check if it's a new tab (no URL or chrome://newtab/)
  if (
    !tab.url ||
    tab.url === "chrome://newtab/" ||
    tab.url === "about:blank" ||
    tab.url.includes("chrome://new-tab-page")
  ) {
    chrome.storage.sync.get(["customUrl", "isEnabled"], (result) => {
      const isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
      const customUrl = result.customUrl || DEFAULT_SETTINGS.customUrl;

      if (isEnabled && customUrl && typeof tab.id === "number") {
        const tabId = tab.id; // Store in a const to satisfy TypeScript
        // Small delay to ensure tab is ready
        setTimeout(() => {
          chrome.tabs.update(tabId, { url: customUrl });
        }, 100);
      }
    });
  }
});

// Handle messages from popup or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSettings") {
    chrome.storage.sync.get(["customUrl", "isEnabled"], (result) => {
      sendResponse({
        customUrl: result.customUrl || DEFAULT_SETTINGS.customUrl,
        isEnabled: result.isEnabled !== undefined ? result.isEnabled : DEFAULT_SETTINGS.isEnabled,
      });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === "saveSettings") {
    const { customUrl, isEnabled } = message;
    chrome.storage.sync.set({ customUrl, isEnabled }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
