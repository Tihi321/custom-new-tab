// Custom New Tab - Popup Script

// DOM elements
const urlInput = document.getElementById("url-input");
const saveBtn = document.getElementById("save-btn");
const toggleBtn = document.getElementById("toggle-btn");
const statusDiv = document.getElementById("status");

let currentSettings = {
  customUrl: "",
  isEnabled: true,
};

// Load current settings
function loadSettings() {
  chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
    if (response) {
      currentSettings = response;
      urlInput.value = response.customUrl;
      updateToggleButton(response.isEnabled);
    }
  });
}

// Update the toggle button appearance
function updateToggleButton(isEnabled) {
  if (isEnabled) {
    toggleBtn.textContent = "Disable Custom URL";
    toggleBtn.classList.remove("disabled");
    toggleBtn.classList.add("enabled");
  } else {
    toggleBtn.textContent = "Enable Custom URL";
    toggleBtn.classList.remove("enabled");
    toggleBtn.classList.add("disabled");
  }
  currentSettings.isEnabled = isEnabled;
}

// Show status message
function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = isError ? "status error" : "status success";
  statusDiv.style.display = "block";
  
  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 3000);
}

// Validate URL
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Save URL
saveBtn.addEventListener("click", () => {
  const url = urlInput.value.trim();
  
  if (!url) {
    showStatus("Please enter a URL", true);
    return;
  }
  
  if (!isValidUrl(url)) {
    showStatus("Please enter a valid URL (must start with http:// or https://)", true);
    return;
  }
  
  currentSettings.customUrl = url;
  
  chrome.runtime.sendMessage(
    { 
      action: "saveSettings", 
      customUrl: url,
      isEnabled: currentSettings.isEnabled
    },
    (response) => {
      if (response && response.success) {
        showStatus("URL saved successfully!");
      } else {
        showStatus("Failed to save URL", true);
      }
    }
  );
});

// Toggle enable/disable
toggleBtn.addEventListener("click", () => {
  const newState = !currentSettings.isEnabled;
  
  chrome.runtime.sendMessage(
    { 
      action: "saveSettings", 
      customUrl: currentSettings.customUrl,
      isEnabled: newState
    },
    (response) => {
      if (response && response.success) {
        updateToggleButton(newState);
        showStatus(newState ? "Custom URL enabled!" : "Custom URL disabled!");
      } else {
        showStatus("Failed to update setting", true);
      }
    }
  );
});

// Allow Enter key to save
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveBtn.click();
  }
});

// Load settings when popup opens
loadSettings();

