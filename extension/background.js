chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('[background] Received external message:', request, 'from:', sender);

  if (request.action === 'ping') {
    chrome.tabs.query({ url: "*://labs.google/fx/tools/flow*" }, (tabs) => {
      const tabOpen = tabs && tabs.length > 0;
      sendResponse({ ok: true, status: 'active', version: '1.0.0', tabOpen: tabOpen });
    });
    return true;
  }

  if (request.action === 'generate') {
    // Locate the labs.google tab
    chrome.tabs.query({ url: "*://labs.google/fx/tools/flow*" }, async (tabs) => {
      if (tabs && tabs.length > 0) {
        const targetTab = tabs[0];
        
        try {
          console.log('[background] Running recaptcha generator in main world of tab:', targetTab.id);
          const results = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            world: 'MAIN',
            func: async () => {
              return new Promise((resolve) => {
                let done = false;
                const t = setTimeout(() => {
                  if (!done) { done = true; resolve(null); }
                }, 10000);

                if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) {
                  console.warn('[injected-recaptcha] grecaptcha is undefined on target tab');
                  done = true;
                  clearTimeout(t);
                  resolve(null);
                  return;
                }
                grecaptcha.enterprise.ready(() => {
                  grecaptcha.enterprise.execute('6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV', { action: 'IMAGE_GENERATION' })
                    .then(token => {
                      if (done) return;
                      done = true;
                      clearTimeout(t);
                      resolve(token);
                    })
                    .catch(err => {
                      console.error('[injected-recaptcha] execute error:', err);
                      if (done) return;
                      done = true;
                      clearTimeout(t);
                      resolve(null);
                    });
                });
              });
            }
          });

          const recaptchaToken = results && results[0] && results[0].result;
          if (!recaptchaToken) {
            sendResponse({ ok: false, error: 'Failed to generate reCAPTCHA token in Google Flow tab context (script returned null).' });
            return;
          }

          // Forward to content.js with the collected recaptchaToken
          const forwardPayload = Object.assign({}, request, { recaptchaToken: recaptchaToken });
          chrome.tabs.sendMessage(targetTab.id, forwardPayload, (response) => {
            if (chrome.runtime.lastError) {
              console.error('[background] Tab send message error:', chrome.runtime.lastError);
              sendResponse({ ok: false, error: 'Failed to communicate with Google Flow tab: ' + chrome.runtime.lastError.message });
            } else {
              sendResponse(response);
            }
          });
        } catch (err) {
          console.error('[background] Script injection failed:', err);
          sendResponse({ ok: false, error: 'Script injection error: ' + (err.message || String(err)) });
        }
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
