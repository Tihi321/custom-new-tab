/// <reference types="chrome"/>

// Default settings
const DEFAULT_SETTINGS = {
  customUrl: "https://www.google.com",
  isEnabled: true,
  openOnIconClick: false,
};

// Initialize extension with default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["customUrl", "isEnabled", "openOnIconClick"], (result) => {
    if (!result.customUrl) {
      chrome.storage.sync.set({ customUrl: DEFAULT_SETTINGS.customUrl });
    }
    if (result.isEnabled === undefined) {
      chrome.storage.sync.set({ isEnabled: DEFAULT_SETTINGS.isEnabled });
    }
    if (result.openOnIconClick === undefined) {
      chrome.storage.sync.set({ openOnIconClick: DEFAULT_SETTINGS.openOnIconClick });
    }
    // Set initial popup state
    updatePopupState(result.openOnIconClick || false);
  });

  // Create context menu items
  chrome.contextMenus.create({
    id: "openSettings",
    title: "Open Settings",
    contexts: ["action"],
  });

  chrome.contextMenus.create({
    id: "openCustomUrl",
    title: "Open Custom URL",
    contexts: ["action"],
  });
});

// Update popup state based on openOnIconClick setting
function updatePopupState(openOnIconClick: boolean): void {
  if (openOnIconClick) {
    // Remove popup so onClicked event fires
    chrome.action.setPopup({ popup: "" });
  } else {
    // Set popup to show settings
    chrome.action.setPopup({ popup: "popup.html" });
  }
}

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
    chrome.storage.sync.get(["customUrl", "isEnabled", "openOnIconClick"], (result) => {
      sendResponse({
        customUrl: result.customUrl || DEFAULT_SETTINGS.customUrl,
        isEnabled: result.isEnabled !== undefined ? result.isEnabled : DEFAULT_SETTINGS.isEnabled,
        openOnIconClick: result.openOnIconClick || DEFAULT_SETTINGS.openOnIconClick,
      });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === "saveSettings") {
    const { customUrl, isEnabled, openOnIconClick } = message;
    chrome.storage.sync.set({ customUrl, isEnabled, openOnIconClick }, () => {
      // Update popup state when settings change
      updatePopupState(openOnIconClick);
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle extension icon click (only fires when popup is not set)
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(["customUrl"], (result) => {
    const customUrl = result.customUrl || DEFAULT_SETTINGS.customUrl;

    if (customUrl) {
      // Open the custom URL in a new tab
      chrome.tabs.create({ url: customUrl });
    }
  });
});

// Listen for storage changes to update popup state dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.openOnIconClick) {
    updatePopupState(changes.openOnIconClick.newValue);
  }
});

// Set popup state on startup
chrome.storage.sync.get(["openOnIconClick"], (result) => {
  updatePopupState(result.openOnIconClick || false);
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSettings") {
    chrome.runtime.openOptionsPage();
  } else if (info.menuItemId === "openCustomUrl") {
    chrome.storage.sync.get(["customUrl"], (result) => {
      const customUrl = result.customUrl || DEFAULT_SETTINGS.customUrl;
      if (customUrl) {
        chrome.tabs.create({ url: customUrl });
      }
    });
  }
});
