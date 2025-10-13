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

// Helper function to check if a URL is a new tab URL
function isNewTabUrl(url: string): boolean {
  return (
    url === "chrome://newtab/" ||
    url === "about:blank" ||
    url === "edge://newtab/" ||
    url === "about:newtab" ||
    url.includes("chrome://new-tab-page") ||
    url.includes("edge://new-tab-page") ||
    url.startsWith("chrome-extension://") // Extension new tab pages
  );
}

// Listen for new tabs being created (fallback for browsers that don't respect chrome_url_overrides)
chrome.tabs.onCreated.addListener((tab) => {
  // If tab has a pendingUrl, it's opening with a specific destination - don't redirect
  if (tab.pendingUrl && !isNewTabUrl(tab.pendingUrl)) {
    return;
  }

  // If tab has a URL that's not a new tab page, don't redirect
  if (tab.url && !isNewTabUrl(tab.url)) {
    return;
  }

  // This is a new empty tab - redirect it
  chrome.storage.sync.get(["customUrl", "isEnabled"], (result) => {
    const isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    const customUrl = result.customUrl || DEFAULT_SETTINGS.customUrl;

    if (isEnabled && customUrl && typeof tab.id === "number") {
      const tabId = tab.id;
      // Small delay to ensure tab is ready
      setTimeout(() => {
        chrome.tabs.update(tabId, { url: customUrl });
      }, 100);
    }
  });
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
