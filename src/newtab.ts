/// <reference types="chrome"/>

// Redirect to custom URL or show default page
chrome.storage.sync.get(["customUrl", "isEnabled"], (result) => {
  const isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
  const customUrl = result.customUrl || "https://www.google.com";

  if (isEnabled && customUrl) {
    // Redirect to the custom URL
    window.location.href = customUrl;
  } else {
    // Show a simple page indicating custom URL is disabled
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin: 0;
        padding: 20px;
      ">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Custom New Tab</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
          Custom URL is currently disabled
        </p>
        <button id="open-settings" style="
          padding: 12px 24px;
          font-size: 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
          Open Settings
        </button>
      </div>
    `;

    const openSettingsBtn = document.getElementById("open-settings");
    openSettingsBtn?.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }
});
