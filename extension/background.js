chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('[background] Received external message:', request, 'from:', sender);

  if (request.action === 'ping') {
    sendResponse({ ok: true, status: 'active', version: '1.0.0' });
    return true;
  }

  if (request.action === 'generate') {
    // Locate the labs.google tab
    chrome.tabs.query({ url: "*://labs.google/fx/tools/flow*" }, (tabs) => {
      if (tabs && tabs.length > 0) {
        // Find if any tab is ready or pick the first one
        const targetTab = tabs[0];
        
        // Forward message to the google tab content script
        chrome.tabs.sendMessage(targetTab.id, request, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[background] Tab send message error:', chrome.runtime.lastError);
            sendResponse({ ok: false, error: 'Failed to communicate with Google Flow tab: ' + chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        // Tab not found. Let's open it and notify the user
        chrome.tabs.create({ url: "https://labs.google/fx/tools/flow", active: true }, (newTab) => {
          sendResponse({ 
            ok: false, 
            error: 'Google Flow tab was not open. We have opened a new tab for you. Please check it is signed in, then try again.' 
          });
        });
      }
    });
    return true; // Keep channel open for async response
  }

  sendResponse({ ok: false, error: 'Unknown action: ' + request.action });
  return false;
});
