// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[content] Received message from background:', request);

  if (request.action === 'generate') {
    handleGenerate(request)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('[content] Generation failed:', error);
        sendResponse({ ok: false, error: error.message || String(error) });
      });
    return true; // Keep channel open for async response
  }

  sendResponse({ ok: false, error: 'Unknown action: ' + request.action });
  return false;
});

// Main generation driver running inside labs.google context
async function handleGenerate(request) {
  // 1. Get Project ID
  const projectId = discoverProjectId();
  if (!projectId) {
    throw new Error('Could not determine Flow projectId from the current page. Please open a project in Google Flow tab.');
  }

  // 2. Fetch Active Google Session Token
  const token = await fetchSessionToken();
  if (!token) {
    throw new Error('No active Google session found. Please sign in to Google Flow first.');
  }

  // 3. Generate enterprise reCAPTCHA token
  const recaptchaToken = await generateRecaptcha(request);
  if (!recaptchaToken) {
    throw new Error('Failed to generate reCAPTCHA token.');
  }

  // 4. Build payload with user options
  const model = request.options?.model || 'NARWHAL'; 
  const arMode = request.options?.aspectRatio || '16:9';
  const aspectRatios = {
    '1:1': 'IMAGE_ASPECT_RATIO_SQUARE',
    '16:9': 'IMAGE_ASPECT_RATIO_WIDE_LANDSCAPE',
    '9:16': 'IMAGE_ASPECT_RATIO_WIDE_PORTRAIT',
    '4:3': 'IMAGE_ASPECT_RATIO_STANDARD_LANDSCAPE',
    '3:4': 'IMAGE_ASPECT_RATIO_STANDARD_PORTRAIT'
  };
  const arKey = aspectRatios[arMode] || aspectRatios['16:9'];

  let seedVal = request.options?.seed;
  if (seedVal === null || seedVal === undefined) {
    seedVal = Math.floor(Math.random() * 2147483648);
  }
  seedVal = Math.abs(Math.trunc(Number(seedVal) || 0)) % 2147483648;

  const clientContext = {
    recaptchaContext: { token: recaptchaToken, applicationType: 'RECAPTCHA_APPLICATION_TYPE_WEB' },
    projectId: projectId,
    tool: 'PINHOLE'
  };
  
  const payload = {
    clientContext: Object.assign({}, clientContext, { sessionId: ';' + Date.now() }),
    mediaGenerationContext: { batchId: crypto.randomUUID() },
    useNewMedia: true,
    requests: [{
      clientContext: clientContext,
      imageModelName: model,
      imageAspectRatio: arKey,
      structuredPrompt: { parts: [{ text: String(request.prompt) }] },
      seed: seedVal
    }]
  };

  // 5. Send generation request
  const endpoint = `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`;
  console.log('[content] Sending generate request payload to:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const resultText = await response.text();
  if (!response.ok) {
    throw new Error(`Google Flow HTTP error ${response.status}: ${resultText.substring(0, 300)}`);
  }

  const data = JSON.parse(resultText);
  if (!data || !data.media || data.media.length === 0) {
    throw new Error('Generation succeeded but returned empty media list.');
  }

  // 6. Convert generated image fifeUrl to base64
  const mediaResult = [];
  for (const item of data.media) {
    const g = item.image && item.image.generatedImage;
    if (g) {
      let b64 = null;
      if (g.fifeUrl) {
        try {
          const imgResp = await fetch(g.fifeUrl);
          const blob = await imgResp.blob();
          b64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('[content] Failed to download generated image fifeUrl:', e);
        }
      }
      mediaResult.push({
        id: item.id || crypto.randomUUID(),
        url: g.fifeUrl || '',
        encodedImage: b64 || g.encodedImage || ''
      });
    }
  }

  return { ok: true, media: mediaResult };
}

// Helpers
function discoverProjectId() {
  function findUuid(str) {
    const m = str && str.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return m ? m[0] : null;
  }
  
  // Try matching URL path containing project/
  const pm = location.href.match(/project[\\/=]([0-9a-f-]{36})/i);
  if (pm) return pm[1];
  
  // Try NEXT_DATA tags
  try {
    const s = document.getElementById('__NEXT_DATA__');
    if (s && s.textContent) {
      const mm = s.textContent.match(/"projectId"\\s*:\\s*"([0-9a-f-]{36})"/i);
      if (mm) return mm[1];
    }
  } catch (e) {}

  // Fallback: any uuid in page URL
  return findUuid(location.href);
}

async function fetchSessionToken() {
  try {
    const sessionResp = await fetch('https://labs.google/fx/api/auth/session', { credentials: 'include' });
    const sessionData = await sessionResp.json();
    return sessionData?.access_token || null;
  } catch (e) {
    console.error('[content] fetchSessionToken error:', e);
    return null;
  }
}

async function generateRecaptcha(request) {
  return request.recaptchaToken || null;
}


