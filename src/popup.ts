/// <reference types="chrome"/>

// DOM elements
const urlInput = document.getElementById("url-input") as HTMLInputElement;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
const toggleBtn = document.getElementById("toggle-btn") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;
const openOnClickCheckbox = document.getElementById("open-on-click") as HTMLInputElement;

let currentSettings = {
  customUrl: "",
  isEnabled: true,
  openOnIconClick: false,
};

// Load current settings
function loadSettings(): void {
  chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
    if (response) {
      currentSettings = response;
      urlInput.value = response.customUrl;
      updateToggleButton(response.isEnabled);
      openOnClickCheckbox.checked = response.openOnIconClick || false;
    }
  });
}

// Update the toggle button appearance
function updateToggleButton(isEnabled: boolean): void {
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
function showStatus(message: string, isError: boolean = false): void {
  statusDiv.textContent = message;
  statusDiv.className = isError ? "status error" : "status success";
  statusDiv.style.display = "block";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 3000);
}

// Validate URL
function isValidUrl(urlString: string): boolean {
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
      isEnabled: currentSettings.isEnabled,
      openOnIconClick: currentSettings.openOnIconClick,
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
      isEnabled: newState,
      openOnIconClick: currentSettings.openOnIconClick,
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

// Toggle open on icon click
openOnClickCheckbox.addEventListener("change", () => {
  currentSettings.openOnIconClick = openOnClickCheckbox.checked;

  chrome.runtime.sendMessage(
    {
      action: "saveSettings",
      customUrl: currentSettings.customUrl,
      isEnabled: currentSettings.isEnabled,
      openOnIconClick: currentSettings.openOnIconClick,
    },
    (response) => {
      if (response && response.success) {
        showStatus(
          currentSettings.openOnIconClick
            ? "Extension icon will now open URL!"
            : "Extension icon will show settings"
        );
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
