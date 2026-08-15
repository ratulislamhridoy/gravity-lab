/**
 * Gravity AI Studio - App Controller
 * Custom Dark Glass Notification & Toast System
 */

// Custom Modern Alert Modal Function
window.showCustomAlert = function(message, title = 'Notice', type = 'warning') {
  const modal = document.getElementById('customAlertModal');
  const iconBox = document.getElementById('customAlertIconBox');
  const titleEl = document.getElementById('customAlertTitle');
  const msgEl = document.getElementById('customAlertMessage');
  const okBtn = document.getElementById('customAlertOkBtn');
  if (!modal || !msgEl) {
    console.log('[ALERT]:', message);
    return;
  }

  titleEl.textContent = title;
  msgEl.textContent = message;

  const msgLower = (typeof message === 'string') ? message.toLowerCase() : '';

  if (type === 'error' || msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('offline')) {
    iconBox.innerHTML = '❌';
    iconBox.style.background = 'rgba(239, 68, 68, 0.12)';
    iconBox.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    iconBox.style.color = '#ef4444';
    if (title === 'Notice') titleEl.textContent = 'Error';
  } else if (type === 'success' || msgLower.includes('success') || msgLower.includes('saved')) {
    iconBox.innerHTML = '✨';
    iconBox.style.background = 'rgba(205, 252, 82, 0.12)';
    iconBox.style.borderColor = 'rgba(205, 252, 82, 0.3)';
    iconBox.style.color = '#cdfc52';
    if (title === 'Notice') titleEl.textContent = 'Success';
  } else if (type === 'info' || msgLower.includes('copied')) {
    iconBox.innerHTML = '📋';
    iconBox.style.background = 'rgba(92, 98, 236, 0.12)';
    iconBox.style.borderColor = 'rgba(92, 98, 236, 0.3)';
    iconBox.style.color = '#5c62ec';
    if (title === 'Notice') titleEl.textContent = 'Copied';
  } else {
    iconBox.innerHTML = '⚠️';
    iconBox.style.background = 'rgba(251, 191, 36, 0.12)';
    iconBox.style.borderColor = 'rgba(251, 191, 36, 0.3)';
    iconBox.style.color = '#fbbf24';
    if (title === 'Notice') titleEl.textContent = 'Attention';
  }

  modal.classList.remove('hidden');

  const closeAlert = () => {
    modal.classList.add('hidden');
    okBtn.removeEventListener('click', closeAlert);
    document.removeEventListener('keydown', handleKey);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      closeAlert();
    }
  };

  okBtn.onclick = closeAlert;
  document.addEventListener('keydown', handleKey);
};

// Custom Floating Toast Notification Function
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    pointer-events: auto;
    background: rgba(22, 22, 28, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.4)' : type === 'warning' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(205, 252, 82, 0.4)'};
    color: #ededf0;
    padding: 12px 20px;
    border-radius: 14px;
    font-size: 13.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.6);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: translateY(15px) scale(0.95);
    font-family: inherit;
  `;

  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

// Override window.alert to automatically use modern alerts and toasts
window.alert = function(msg) {
  if (typeof msg === 'string' && (msg.toLowerCase().includes('copied') || msg.toLowerCase().includes('successfully saved'))) {
    window.showToast(msg, 'success');
  } else {
    window.showCustomAlert(msg);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const appBody = document.getElementById('appBody');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const dashboardView = document.getElementById('dashboardView');
  const studioView = document.getElementById('studioView');
  const pageTitle = document.getElementById('pageTitle');
  const backToDashBtn = document.getElementById('backToDashBtn');

  // API Key Modal Elements
  const apiKeyModal = document.getElementById('apiKeyModal');
  const openApiKeyModal = document.getElementById('openApiKeyModal');
  const topApiKeyBtn = document.getElementById('topApiKeyBtn');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiKeyStatusTxt = document.getElementById('apiKeyStatusTxt');

  // Tool #1 Elements
  const iconNicheInput = document.getElementById('iconNicheInput');
  const modelSelect = document.getElementById('modelSelect');
  const rowsInput = document.getElementById('rowsInput');
  const colsInput = document.getElementById('colsInput');
  const totalIconCount = document.getElementById('totalIconCount');
  const lineWeightSelect = document.getElementById('lineWeightSelect');
  const spacingRange = document.getElementById('spacingRange');
  const spacingVal = document.getElementById('spacingVal');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const promptResultBox = document.getElementById('promptResultBox');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const downloadPromptBtn = document.getElementById('downloadPromptBtn');
  const downloadPromptCsvBtn = document.getElementById('downloadPromptCsvBtn');
  const bulkActions = document.getElementById('bulkActions');
  const sendAllToFlowBtn = document.getElementById('sendAllToFlowBtn');
  
  const promptImgUploadBtn = document.getElementById('promptImgUploadBtn');
  const promptImgInput = document.getElementById('promptImgInput');
  const promptImgPreviewContainer = document.getElementById('promptImgPreviewContainer');
  // Non-Blocking Web Worker Vectorization Engine
  class VectorWorkerManager {
    constructor() {
      this.worker = null;
      this.callbacks = new Map();
      this.jobId = 0;
      this.initWorker();
    }

    initWorker() {
      try {
        if (window.Worker) {
          this.worker = new Worker('vectorWorker.js');
          this.worker.onmessage = (e) => {
            const data = e.data;
            if (data && data.id && this.callbacks.has(data.id)) {
              const { resolve, reject } = this.callbacks.get(data.id);
              this.callbacks.delete(data.id);
              if (data.status === 'SUCCESS') {
                resolve(data);
              } else {
                reject(new Error(data.error || 'Vectorization failed'));
              }
            }
          };
          this.worker.onerror = (err) => {
            console.warn('Vector Worker Error:', err);
          };
        }
      } catch (err) {
        console.warn('Vector Worker Initialization Notice:', err);
      }
    }

    vectorizeTile(imgData, width, height, options = {}) {
      return new Promise((resolve, reject) => {
        if (!this.worker) {
          // Fallback if worker not supported
          resolve({ status: 'SUCCESS', pathD: `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`, width, height });
          return;
        }

        const id = ++this.jobId;
        this.callbacks.set(id, { resolve, reject });
        this.worker.postMessage({
          type: 'VECTORIZE_TILE',
          id: id,
          imgData: imgData,
          width: width,
          height: height,
          threshold: options.threshold || 128
        });
      });
    }
  }

  window.vectorWorkerManager = new VectorWorkerManager();

  // Tool #3 Elements
  const tool3View = document.getElementById('tool3View');
  const flowProfileSelect = document.getElementById('flowProfileSelect');
  const addProfileBtn = document.getElementById('addProfileBtn');
  const flowProfileUseCheckbox = document.getElementById('flowProfileUseCheckbox');
  const connectionBadge = document.getElementById('connectionBadge');
  const btnFlowOpen = document.getElementById('btnFlowOpen');
  const btnFlowConnect = document.getElementById('btnFlowConnect');
  const btnFlowDisconnect = document.getElementById('btnFlowDisconnect');
  const connectionDetail = document.getElementById('connectionDetail');
  const flowOutputDir = document.getElementById('flowOutputDir');
  const flowImagesPerPrompt = document.getElementById('flowImagesPerPrompt');
  const flowAspectRatio = document.getElementById('flowAspectRatio');
  const flowModel = document.getElementById('flowModel');
  const btnUploadTxt = document.getElementById('btnUploadTxt');
  const txtFileInput = document.getElementById('txtFileInput');
  const flowPromptsArea = document.getElementById('flowPromptsArea');
  const btnFlowStart = document.getElementById('btnFlowStart');
  const btnFlowStop = document.getElementById('btnFlowStop');
  const flowRunProgress = document.getElementById('flowRunProgress');
  const flowProgressBar = document.getElementById('flowProgressBar');
  const flowProgressBarInner = document.getElementById('flowProgressBarInner');
  const flowResultGallery = document.getElementById('flowResultGallery');
  const flowEmptyState = document.getElementById('flowEmptyState');

  // Tool #2 Elements
  const tool2View = document.getElementById('tool2View');
  const bannerTitle = document.getElementById('bannerTitle');
  const bannerCountText = document.getElementById('bannerCountText');
  const bannerLeftBg = document.getElementById('bannerLeftBg');
  const bannerRightBg = document.getElementById('bannerRightBg');
  const featuredIconDropzone = document.getElementById('featuredIconDropzone');
  const featuredIconInput = document.getElementById('featuredIconInput');
  const featuredIconFileName = document.getElementById('featuredIconFileName');
  const gridIconsDropzone = document.getElementById('gridIconsDropzone');
  const gridIconsFileInput = document.getElementById('gridIconsFileInput');
  const bannerIconsCountBadge = document.getElementById('bannerIconsCountBadge');
  const btnClearBannerIcons = document.getElementById('btnClearBannerIcons');
  const btnRenderBanner = document.getElementById('btnRenderBanner');
  const btnDownloadBanner = document.getElementById('btnDownloadBanner');
  const bannerCanvas = document.getElementById('bannerCanvas');



  // Custom Animated Dropdowns Initializer
  function initCustomAnimatedSelects() {
    document.querySelectorAll('select.ctl-select').forEach(select => {
      if (!select || !select.options || select.options.length === 0) return;
      if (select.getAttribute('data-customized') === 'true') return;
      select.setAttribute('data-customized', 'true');
      select.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (select.style.flex) {
        wrapper.style.flex = select.style.flex;
      }

      const trigger = document.createElement('div');
      trigger.className = 'custom-select-trigger';

      const selectedOption = select.options[select.selectedIndex] || select.options[0];
      const triggerText = document.createElement('span');
      triggerText.textContent = selectedOption ? selectedOption.text : '';

      const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrowSvg.setAttribute('class', 'custom-select-arrow');
      arrowSvg.setAttribute('viewBox', '0 0 24 24');
      arrowSvg.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';

      trigger.appendChild(triggerText);
      trigger.appendChild(arrowSvg);
      wrapper.appendChild(trigger);

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-select-options';

      Array.from(select.options).forEach(opt => {
        const optionDiv = document.createElement('div');
        optionDiv.className = `custom-option ${opt.selected ? 'selected' : ''}`;
        optionDiv.textContent = opt.text;
        optionDiv.dataset.value = opt.value;

        optionDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));

          triggerText.textContent = opt.text;
          optionsContainer.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
          optionDiv.classList.add('selected');

          wrapper.classList.remove('open');
        });

        optionsContainer.appendChild(optionDiv);
      });

      wrapper.appendChild(optionsContainer);
      if (select.parentNode) {
        select.parentNode.insertBefore(wrapper, select.nextSibling);
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
          if (w !== wrapper) w.classList.remove('open');
        });
        wrapper.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        wrapper.classList.remove('open');
      });
    });
  }

  // Refresh custom animated select UI wrapper when select options change dynamically
  function updateCustomSelectUI(select) {
    if (typeof select === 'string') {
      select = document.getElementById(select);
    }
    if (!select || typeof select.removeAttribute !== 'function') return;
    const wrapper = select.nextElementSibling;
    if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
      wrapper.remove();
    }
    select.removeAttribute('data-customized');
    select.style.display = '';
    initCustomAnimatedSelects();
  }

  // Initialize Custom Select Dropdowns
  initCustomAnimatedSelects();

  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    appBody.classList.toggle('sidebar-collapsed');
  });

  // API Key Management (Structured Dynamic Multi-Input Rows)
  const apiKeyRowsContainer = document.getElementById('apiKeyRowsContainer');
  const addApiKeyRowBtn = document.getElementById('addApiKeyRowBtn');

  function getApiKeys() {
    const raw = localStorage.getItem('gravity_gemini_keys') || localStorage.getItem('gravity_gemini_key') || '';
    if (!raw.trim()) return [];
    return raw.split(/[\n,\s]+/).map(k => k.trim()).filter(k => k.length > 5);
  }

  function getApiKey() {
    const keys = getApiKeys();
    return keys.length > 0 ? keys[0] : '';
  }

  function createApiKeyRow(value = '') {
    const row = document.createElement('div');
    row.className = 'api-key-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    
    row.innerHTML = `
      <input type="text" class="ctl-input api-key-row-input" value="${value}" placeholder="Paste Gemini API Key here (AIzaSy...)" style="font-family: monospace; font-size: 12px; flex: 1; padding: 8px 12px;" />
      <button type="button" class="btn btn-dark small remove-key-row-btn" style="padding: 6px 10px; color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3);" title="Remove key">🗑️</button>
    `;

    row.querySelector('.remove-key-row-btn').addEventListener('click', () => {
      if (apiKeyRowsContainer.children.length > 1) {
        row.remove();
      } else {
        row.querySelector('.api-key-row-input').value = '';
      }
      updateKeyCountBadge();
    });

    row.querySelector('.api-key-row-input').addEventListener('input', updateKeyCountBadge);

    return row;
  }

  function updateKeyCountBadge() {
    const inputs = document.querySelectorAll('.api-key-row-input');
    let count = 0;
    inputs.forEach(inp => {
      const val = inp && inp.value ? inp.value.trim() : '';
      if (val.length > 5) count++;
    });

    const countTxt = document.getElementById('apiKeysCountTxt');
    if (count > 0) {
      if (apiKeyStatusTxt) apiKeyStatusTxt.textContent = `API Keys: ${count} Active`;
      if (topApiKeyBtn) topApiKeyBtn.textContent = `🔑 ${count} API Key${count > 1 ? 's' : ''} Configured`;
      if (countTxt) countTxt.textContent = `✓ ${count} Gemini API Key${count > 1 ? 's' : ''} loaded and active`;
    } else {
      if (apiKeyStatusTxt) apiKeyStatusTxt.textContent = 'API Keys: Not Set';
      if (topApiKeyBtn) topApiKeyBtn.textContent = '🔑 Set Gemini API Keys';
      if (countTxt) countTxt.textContent = '0 API Keys configured';
    }
  }

  function renderApiKeyRows() {
    if (!apiKeyRowsContainer) return;
    apiKeyRowsContainer.innerHTML = '';
    const keys = getApiKeys();
    
    if (keys.length === 0) {
      apiKeyRowsContainer.appendChild(createApiKeyRow(''));
    } else {
      keys.forEach(k => {
        apiKeyRowsContainer.appendChild(createApiKeyRow(k));
      });
    }
    updateKeyCountBadge();
  }

  if (addApiKeyRowBtn) {
    addApiKeyRowBtn.addEventListener('click', () => {
      const newRow = createApiKeyRow('');
      apiKeyRowsContainer.appendChild(newRow);
      const newInp = newRow.querySelector('.api-key-row-input');
      if (newInp) newInp.focus();
      updateKeyCountBadge();
    });
  }

  if (modelSelect) {
    const savedModel = localStorage.getItem('gravity_gemini_model');
    if (savedModel) modelSelect.value = savedModel;
  }

  if (openApiKeyModal) {
    openApiKeyModal.addEventListener('click', () => {
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      if (apiKeyModal) apiKeyModal.classList.remove('hidden');
    });
  }
  if (topApiKeyBtn) {
    topApiKeyBtn.addEventListener('click', () => {
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      if (apiKeyModal) apiKeyModal.classList.remove('hidden');
    });
  }
  const inToolApiKeyBtn = document.getElementById('inToolApiKeyBtn');
  if (inToolApiKeyBtn) {
    inToolApiKeyBtn.addEventListener('click', () => {
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      if (apiKeyModal) apiKeyModal.classList.remove('hidden');
    });
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', () => {
      const inputs = document.querySelectorAll('.api-key-row-input');
      const keys = [];
      inputs.forEach(inp => {
        const val = inp.value.trim();
        if (val.length > 5 && !keys.includes(val)) {
          keys.push(val);
        }
      });

      if (modelSelect) {
        localStorage.setItem('gravity_gemini_model', modelSelect.value);
      }

      if (keys.length > 0) {
        localStorage.setItem('gravity_gemini_keys', keys.join('\n'));
        localStorage.setItem('gravity_gemini_key', keys[0]); // Legacy compatibility
        updateKeyCountBadge();
        if (apiKeyModal) apiKeyModal.classList.add('hidden');
        alert(`Successfully saved ${keys.length} Gemini API Key${keys.length > 1 ? 's' : ''} & Default Model settings!`);
      } else {
        alert('Please enter at least one valid Gemini API Key.');
      }
    });
  }

  if (apiKeyModal) {
    apiKeyModal.addEventListener('click', (e) => {
      if (e.target === apiKeyModal) apiKeyModal.classList.add('hidden');
    });
  }

  renderApiKeyRows();

  updateKeyCountBadge();

  // Gling Light/Dark Theme Toggling
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const currentTheme = localStorage.getItem('gravity_theme') || 'light';
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      themeToggleBtn.textContent = '☀️ Light';
    } else {
      document.documentElement.classList.remove('dark-mode');
      themeToggleBtn.textContent = '🌙 Dark';
    }

    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark-mode');
      const isDark = document.documentElement.classList.contains('dark-mode');
      localStorage.setItem('gravity_theme', isDark ? 'dark' : 'light');
      themeToggleBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    });
  }

  // Sidebar Toggling
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('sidebar-collapsed');
    });
  }

  // Navigation & Tool Launch
  document.querySelectorAll('.launch').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolId = btn.getAttribute('data-launch');
      if (toolId === 'icon-sheet-prompt') {
        launchTool1();
      } else if (toolId === 'google-flow-gen') {
        launchTool3();
      } else if (toolId === 'icon-sheet-slicer') {
        launchTool4();
      }
    });
  });

  // Tool #3 Prompt Sync & Counter Logic
  const btnSyncFromTool1 = document.getElementById('btnSyncFromTool1');
  const promptCountBadge = document.getElementById('promptCountBadge');

  function getCleanPromptsFromTool1() {
    const promptElems = document.querySelectorAll('#promptResultBox .bulk-prompt-text');
    const prompts = [];
    promptElems.forEach(el => {
      let text = el.textContent || el.innerText || '';
      text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (text) prompts.push(text);
    });
    return prompts;
  }

  function getCleanFlowPrompts() {
    if (!flowPromptsArea) return [];
    const text = flowPromptsArea.value.trim();
    if (!text) return [];

    return text
      .split(/\r?\n/)
      .map(p => p.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  function updateFlowPromptCount() {
    if (!flowPromptsArea || !promptCountBadge) return;
    const prompts = getCleanFlowPrompts();
    const count = prompts.length;
    promptCountBadge.textContent = `${count} Prompt${count === 1 ? '' : 's'}`;
  }

  if (flowPromptsArea) {
    flowPromptsArea.addEventListener('input', updateFlowPromptCount);
  }

  if (btnSyncFromTool1) {
    btnSyncFromTool1.addEventListener('click', () => {
      const prompts = getCleanPromptsFromTool1();
      if (prompts.length === 0) {
        alert('No prompts found in Icon Sheet Generator (Tool #1). Please generate prompts in Tool #1 first!');
        return;
      }

      if (flowPromptsArea) {
        flowPromptsArea.value = prompts.join('\n');
        updateFlowPromptCount();
        alert(`Successfully synced ${prompts.length} prompt${prompts.length > 1 ? 's' : ''} from Tool #1!`);
      }
    });
  }

  if (sendAllToFlowBtn) {
    sendAllToFlowBtn.addEventListener('click', () => {
      const prompts = getCleanPromptsFromTool1();
      if (prompts.length === 0) {
        alert('No prompts found in Icon Sheet Generator (Tool #1). Please generate prompts in Tool #1 first!');
        return;
      }

      if (flowPromptsArea) {
        flowPromptsArea.value = prompts.join('\n');
        updateFlowPromptCount();
      }
      launchTool3();
    });
  }

  const btnClearPrompts = document.getElementById('btnClearPrompts');
  if (btnClearPrompts && flowPromptsArea) {
    btnClearPrompts.addEventListener('click', () => {
      flowPromptsArea.value = '';
      updateFlowPromptCount();
    });
  }

  if (flowResultGallery) {
    flowResultGallery.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.btn-copy-prompt');
      if (copyBtn) {
        const prompt = copyBtn.getAttribute('data-prompt');
        if (prompt) {
          navigator.clipboard.writeText(prompt);
          if (typeof window.showCustomAlert === 'function') {
            window.showCustomAlert('Prompt copied to clipboard!', 'Success', 'info');
          } else {
            alert('Prompt copied to clipboard!');
          }
        }
        return;
      }

      const imgPreview = e.target.closest('.flow-img-preview');
      if (imgPreview) {
        const imgUrl = imgPreview.getAttribute('data-img-url') || (imgPreview.querySelector('img') ? imgPreview.querySelector('img').src : null);
        if (imgUrl) {
          const lightbox = document.getElementById('promptLightboxModal');
          const lightboxImg = document.getElementById('lightboxImg');
          if (lightbox && lightboxImg) {
            lightboxImg.src = imgUrl;
            lightbox.style.display = 'flex';
          }
        }
      }
    });
  }

  // Lightbox modal close triggers
  const btnCloseLb = document.getElementById('lightboxCloseBtn');
  const lbModal = document.getElementById('promptLightboxModal');
  if (btnCloseLb && lbModal) {
    btnCloseLb.addEventListener('click', () => {
      lbModal.style.display = 'none';
    });
    lbModal.addEventListener('click', (e) => {
      if (e.target === lbModal) {
        lbModal.style.display = 'none';
      }
    });
  }


  if (backToDashBtn) {
    backToDashBtn.addEventListener('click', () => {
      if (dashboardView) dashboardView.classList.remove('hidden');
      if (studioView) studioView.classList.add('hidden');
      if (tool2View) tool2View.classList.add('hidden');
      if (tool3View) tool3View.classList.add('hidden');
      if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
      backToDashBtn.style.display = 'none';
      pageTitle.textContent = 'Studio Dashboard';
      appBody.classList.remove('in-tool-view');
    });
  }

  function launchTool1() {
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.remove('hidden');
    if (tool2View) tool2View.classList.add('hidden');
    if (tool3View) tool3View.classList.add('hidden');
    if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
    backToDashBtn.style.display = 'inline-block';
    pageTitle.textContent = 'Icon Sheet Prompt Generator';
    appBody.classList.add('in-tool-view');
  }

  function launchTool2() {
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.add('hidden');
    if (tool2View) tool2View.classList.remove('hidden');
    if (tool3View) tool3View.classList.add('hidden');
    if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
    backToDashBtn.style.display = 'inline-block';
    pageTitle.textContent = 'Icon Pack Banner Generator';
    appBody.classList.add('in-tool-view');
    if (typeof renderBannerCanvas === 'function') renderBannerCanvas();
  }

  function launchTool3(preloadedPrompt = '') {
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.add('hidden');
    if (tool2View) tool2View.classList.add('hidden');
    if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
    if (tool3View) tool3View.classList.remove('hidden');
    backToDashBtn.style.display = 'inline-block';
    pageTitle.textContent = 'Google Flow Generator';
    appBody.classList.add('in-tool-view');
    if (preloadedPrompt) {
      const cleanPrompt = (preloadedPrompt || '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanPrompt) {
        if (flowPromptsArea && flowPromptsArea.value.trim()) {
          flowPromptsArea.value += '\n\n' + cleanPrompt;
        } else if (flowPromptsArea) {
          flowPromptsArea.value = cleanPrompt;
        }
        updateFlowPromptCount();
      }
    }
    // Initialize connection to WebSocket when launching tool
    initFlowConnection();
  }

  function launchTool4() {
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.add('hidden');
    if (tool2View) tool2View.classList.add('hidden');
    if (tool3View) tool3View.classList.add('hidden');
    const t4 = document.getElementById('tool4View');
    if (t4) t4.classList.remove('hidden');
    backToDashBtn.style.display = 'inline-block';
    pageTitle.textContent = 'Icon Sheet Slicer & Vectorizer';
    appBody.classList.add('in-tool-view');
    initFlowConnection(); // Connect WebSocket immediately
  }

  // Live Grid Icon Calculator
  function updateTotalIcons() {
    const r = parseInt(rowsInput.value) || 1;
    const c = parseInt(colsInput.value) || 1;
    totalIconCount.textContent = (r * c).toString();
  }

  rowsInput.addEventListener('input', updateTotalIcons);
  colsInput.addEventListener('input', updateTotalIcons);

  spacingRange.addEventListener('input', () => {
    const val = parseInt(spacingRange.value);
    const labels = ['Tight Spacing', 'Compact Spacing', 'Medium Grid Spacing', 'Spacious Spacing', 'Wide Grid Spacing'];
    spacingVal.textContent = labels[val - 1] || 'Medium Grid Spacing';
  });

  // Dynamic thumbnail renderer for multiple prompt images (stacked layout)
  function renderPromptThumbnails() {
    if (!promptImgPreviewContainer) return;
    
    if (uploadedPromptImages.length === 0) {
      promptImgPreviewContainer.style.display = 'none';
      promptImgPreviewContainer.innerHTML = '';
      if (promptImgUploadBtn) promptImgUploadBtn.style.display = 'flex';
      return;
    }

    promptImgPreviewContainer.style.display = 'flex';
    
    // We render up to 3 stacked images to show preview of deck, and a badge with total count.
    const maxStack = Math.min(uploadedPromptImages.length, 3);
    let imagesHtml = '';
    for (let idx = 0; idx < maxStack; idx++) {
      const img = uploadedPromptImages[idx];
      const offsetLeft = idx * 6; // overlap offset
      const zIndex = idx + 1;
      imagesHtml += `
        <img class="prompt-thumb-img-click" data-index="${idx}" src="data:${img.mimeType};base64,${img.data}" 
             style="position: absolute; left: ${offsetLeft}px; top: 0; width: 34px; height: 34px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(128,128,128,0.25); z-index: ${zIndex}; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" />
      `;
    }

    const totalWidth = 34 + (maxStack - 1) * 6;

    promptImgPreviewContainer.innerHTML = `
      <div style="position: relative; width: ${totalWidth}px; height: 34px; cursor: pointer; flex-shrink: 0; margin-right: 4px;" id="promptImgStackWrapper">
        ${imagesHtml}
        <!-- Badge for total images count -->
        <span style="position: absolute; top: -6px; right: -6px; background: var(--secondary, #ff6b6b); color: #fff; font-size: 9px; font-weight: bold; border-radius: 10px; padding: 2px 6px; z-index: 20; border: 1px solid rgba(0,0,0,0.2); box-shadow: 0 2px 4px rgba(0,0,0,0.3); pointer-events: none;">
          ${uploadedPromptImages.length}
        </span>
        <!-- Single cross button to clear all -->
        <button type="button" id="clearAllPromptImgBtn" style="position: absolute; bottom: -6px; right: -6px; background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 14px; height: 14px; font-size: 8px; line-height: 12px; text-align: center; cursor: pointer; padding: 0; border-radius: 50%; z-index: 20; font-weight: bold; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
    `;

    // Attach click listeners to clear all button
    const clearAllBtn = document.getElementById('clearAllPromptImgBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening lightbox
        uploadedPromptImages = [];
        renderPromptThumbnails();
      });
    }

    // Attach click listeners to stack wrapper to open lightbox (defaults to first image index 0)
    const stackWrapper = document.getElementById('promptImgStackWrapper');
    if (stackWrapper) {
      stackWrapper.addEventListener('click', (e) => {
        if (e.target.id === 'clearAllPromptImgBtn') return; // clicked clear all button
        openLightbox(0);
      });
    }
  }

  // Lightbox index and handlers
  let currentLightboxIndex = 0;
  
  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    const modal = document.getElementById('promptLightboxModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  function updateLightbox() {
    const imgEl = document.getElementById('lightboxImg');
    const indicatorEl = document.getElementById('lightboxIndicator');
    const stripEl = document.getElementById('lightboxThumbStrip');
    if (!imgEl || !uploadedPromptImages[currentLightboxIndex]) return;
    
    const img = uploadedPromptImages[currentLightboxIndex];
    imgEl.src = `data:${img.mimeType};base64,${img.data}`;
    if (indicatorEl) {
      indicatorEl.textContent = `${currentLightboxIndex + 1} of ${uploadedPromptImages.length}`;
    }

    // Render horizontal thumbnail strip
    if (stripEl) {
      stripEl.innerHTML = uploadedPromptImages.map((t, idx) => {
        const isActive = idx === currentLightboxIndex;
        const activeBorder = isActive ? 'border: 2px solid var(--primary, #00cb76); opacity: 1;' : 'border: 1px solid rgba(255,255,255,0.2); opacity: 0.5;';
        return `
          <div class="lightbox-strip-item" data-index="${idx}" style="width: 44px; height: 44px; border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0; transition: all 0.2s; ${activeBorder}">
            <img src="data:${t.mimeType};base64,${t.data}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        `;
      }).join('');

      // Add click listeners to strip items to navigate
      stripEl.querySelectorAll('.lightbox-strip-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-index'));
          currentLightboxIndex = idx;
          updateLightbox();
        });
      });
    }
  }
  
  // Hook up lightbox controls
  const lightboxModal = document.getElementById('promptLightboxModal');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxDeleteBtn = document.getElementById('lightboxDeleteBtn');
  
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => {
      if (lightboxModal) lightboxModal.style.display = 'none';
    });
  }
  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => {
      if (uploadedPromptImages.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex - 1 + uploadedPromptImages.length) % uploadedPromptImages.length;
      updateLightbox();
    });
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => {
      if (uploadedPromptImages.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex + 1) % uploadedPromptImages.length;
      updateLightbox();
    });
  }
  
  if (lightboxDeleteBtn) {
    lightboxDeleteBtn.addEventListener('click', () => {
      if (uploadedPromptImages.length === 0) return;
      
      // Delete current image
      uploadedPromptImages.splice(currentLightboxIndex, 1);
      renderPromptThumbnails();

      if (uploadedPromptImages.length === 0) {
        if (lightboxModal) lightboxModal.style.display = 'none';
      } else {
        if (currentLightboxIndex >= uploadedPromptImages.length) {
          currentLightboxIndex = uploadedPromptImages.length - 1;
        }
        updateLightbox();
      }
    });
  }
  
  // Close lightbox on escape key or backdrop click
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.style.display = 'none';
      }
    });
    
    window.addEventListener('keydown', (e) => {
      if (lightboxModal.style.display !== 'flex') return;
      if (e.key === 'Escape') {
        lightboxModal.style.display = 'none';
      } else if (e.key === 'ArrowLeft') {
        lightboxPrevBtn.click();
      } else if (e.key === 'ArrowRight') {
        lightboxNextBtn.click();
      }
    });
  }

  // Image-to-Prompt upload click/change handler
  if (promptImgUploadBtn && promptImgInput) {
    promptImgUploadBtn.addEventListener('click', () => {
      promptImgInput.click();
    });

    promptImgInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      let filesLoaded = 0;
      const targetCount = files.length;

      for (let i = 0; i < targetCount; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 512;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

            uploadedPromptImages.push({
              mimeType: 'image/jpeg',
              data: resizedBase64,
              name: file.name
            });

            filesLoaded++;
            if (filesLoaded === targetCount) {
              renderPromptThumbnails();
              promptImgInput.value = ''; // Reset input to allow re-uploading same files
            }
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /**
   * Batches up to 10 images into 1 Gemini Vision API request payload.
   * Asks Gemini to return a strict JSON Array with exactly 1 object per image.
   */
  async function processImageBatch(imagesBatch, apiKey, options) {
    if (!imagesBatch || !imagesBatch.length) return [];

    const model = options.model || 'gemini-1.5-flash';
    const rows = options.rows || 3;
    const cols = options.cols || 6;
    const total = options.total || (rows * cols);
    const lineWeight = options.lineWeight || 'medium vector outline';
    const spacingLabel = options.spacingLabel || 'medium uniform padding';

    const randomSalt = Math.floor(Math.random() * 999999) + 1;
    const systemPrompt = `You are a master AI art prompt engineer for Midjourney v6, DALL-E 3, and Stable Diffusion XL.
You are provided with reference image(s) in sequence.

PROMPT CREATIVITY & ELEGANCE DIRECTIVE (Variation Seed #${randomSalt}):
1. CONCEPT ANALYZER: Analyze the core concept, domain, and theme of reference image ${imagesBatch.length > 1 ? 'sequence' : ''} (e.g. Education, Cyber Security, Healthcare, Finance, E-Commerce, Tech, etc.).
2. STYLE DNA EXTRACTOR: Analyze the visual style DNA (stroke thickness, line weight, shape curvature, grid layout).
3. STRICT MONOCHROME BLACK & WHITE MANDATE (CRITICAL):
   - The generated prompt MUST strictly enforce pure black and white line-art outlines.
   - Explicitly mandate: "Pure black line-art outlines on a solid pure white background. Absolutely ZERO color, NO color fills, NO gradients, NO 3D rendering, NO realistic shading, NO drop shadows, NO 3D volumetric effects. Minimalist flat 2D black-and-white vector line-art ONLY."
4. STRICT REJECTION OF REFERENCE IMAGE SUBJECTS:
   - VISUALLY IDENTIFY what icons are ALREADY present in the reference image(s) and DO NOT USE THEM.
   - DO NOT repeat or copy any of the exact icon subjects visible in the reference image.
   - Brainstorm a completely FRESH, NEW, & DIFFERENT set of EXACTLY ${total} related icon concepts within that same topic/niche.
5. STRICT GRID COUNT: The user specified a ${rows}x${cols} grid layout containing EXACTLY ${total} total icons. You MUST generate a prompt for EXACTLY ${total} distinct icons.
6. ELEGANT NATURAL LANGUAGE PROSE WITH VISUAL DESCRIPTIONS:
   - DO NOT write robotic or mechanical numbered lists (e.g. DO NOT write "1. smartphone, 2. laptop...").
   - EXPLAIN HOW EACH NEW ICON LOOKS visually by adding vivid, descriptive adjectives/modifiers to every icon subject (e.g. "a sleek frameless smartphone displaying app grid, a high-tech metallic laptop with open screen, a cloud storage node emitting upload arrows...").
7. PROMPT STRUCTURE TEMPLATE:
   - Start with a compelling opening: "A masterfully crafted ${rows}x${cols} vector icon sheet featuring EXACTLY ${total} distinct, high-quality [niche/topic] icons arranged in a clean, uniform grid with ${spacingLabel} on a solid pure white background."
   - Weave the ${total} detailed icon descriptions into a natural, flowing sentence: "The collection showcases [list all ${total} NEW unique icon subjects with vivid visual appearance details naturally joined with commas and 'and'], rendered in a unified visual aesthetic."
   - Conclude with rich monochrome directives: "Designed with ${lineWeight}, crisp black outlines, balanced proportions, flat vector illustration style, isolated grid cells, zero color, zero 3D rendering, zero shading, pure black and white line-art, high-contrast, professional UI graphic finish."

CRITICAL INSTRUCTION: You MUST return ONLY a strict JSON Array containing exactly ${imagesBatch.length} objects corresponding to each image in order.
JSON schema:
[
  {
    "index": 0,
    "title": "Clean Short Topic (e.g. Technology Icons)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "prompt": "Rich, fluent master prompt describing how each of the ${total} NEW unique icons visually looks in pure black and white line-art without colors or 3D rendering..."
  }
]
Do not include any markdown formatting outside the json codeblock. Output valid JSON array ONLY.`;

    const parts = [{ text: systemPrompt }];
    imagesBatch.forEach((img) => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data
        }
      });
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout limit

    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Gemini API request timed out after 20s. Please check network/API key.');
      }
      throw err;
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      if (data.error) throw new Error(`Gemini API Error: ${data.error.message}`);
      throw new Error('Invalid or empty response from Gemini API.');
    }

    let rawText = data.candidates[0].content.parts[0].text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let jsonArray = [];
    try {
      jsonArray = JSON.parse(rawText);
    } catch (_) {
      const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try { jsonArray = JSON.parse(match[0]); } catch (__) {}
      }
    }

    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      const cleanPrompt = rawText.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
      return imagesBatch.map((_, idx) => ({
        index: idx,
        title: `Reference Image #${idx + 1}`,
        keywords: ['icon', 'vector'],
        prompt: cleanPrompt
      }));
    }

    return jsonArray.map((item, idx) => ({
      index: typeof item.index === 'number' ? item.index : idx,
      title: item.title || `Reference Image #${idx + 1}`,
      keywords: Array.isArray(item.keywords) ? item.keywords : ['icon', 'vector'],
      prompt: (item.prompt || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim()
    }));
  }

  // Generate Prompt using Gemini API
  generatePromptBtn.addEventListener('click', async () => {
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      updateApiKeyStatus();
      apiKeyModal.classList.remove('hidden');
      alert('Please configure your Gemini API Key(s) first to generate prompts.');
      return;
    }

    const nicheInputText = iconNicheInput ? iconNicheInput.value.trim() : '';
    let isImageNiches = false;
    let niches = nicheInputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (niches.length === 0) {
      if (uploadedPromptImages.length > 0) {
        isImageNiches = true;
        niches = uploadedPromptImages.map((_, idx) => uploadedPromptImages.length > 1 ? `Reference Image #${idx + 1} Style` : "Reference Image Style");
      } else {
        alert('Please enter at least one niche topic or upload a reference style image.');
        return;
      }
    }

    const promptsPerNicheCount = parseInt(document.getElementById('promptsPerNiche').value) || 1;
    const rows = parseInt(rowsInput.value) || 3;
    const cols = parseInt(colsInput.value) || 6;
    const total = rows * cols;
    const lineWeight = lineWeightSelect.value;
    const spacingLabel = spacingVal.textContent;
    const model = modelSelect.value;

    promptResultBox.innerHTML = '';
    if (bulkActions) bulkActions.style.display = 'none';
    generatePromptBtn.disabled = true;

    // Render loading indicator inside result box
    promptResultBox.innerHTML = `
      <em style="color: var(--on-variant); font-size: 13.5px;">⚡ Bulk generating prompts for ${niches.length} niches (${promptsPerNicheCount} variation(s) each) using ${apiKeys.length} active API key(s)... Please wait...</em>
      <div id="bulkProgress" style="margin-top: 12px; font-weight: 700; color: var(--tertiary); font-family: var(--mono); font-size: 13px;">Initiating...</div>
    `;

    const progressDiv = document.getElementById('bulkProgress');

    // Optimization: If uploadedPromptImages > 0, batch up to 10 images into 1 API payload
    if (uploadedPromptImages.length > 0) {
      const chunkSize = 10;
      const imageBatches = [];
      for (let b = 0; b < uploadedPromptImages.length; b += chunkSize) {
        imageBatches.push(uploadedPromptImages.slice(b, b + chunkSize));
      }

      const totalBatchCount = imageBatches.length;
      progressDiv.innerHTML = `⚡ Batch Processing ${uploadedPromptImages.length} image(s) in ${totalBatchCount} API call(s) (10 images/call)...`;

      const promptResults = [];
      const listContainer = document.createElement('div');
      listContainer.className = 'bulk-prompt-list';

      const nicheCard = document.createElement('div');
      nicheCard.className = 'bulk-niche-card';
      nicheCard.innerHTML = `<div class="bulk-niche-title">🖼️ Reference Image Batch Prompts (${uploadedPromptImages.length} Images in ${totalBatchCount} Call(s))</div>`;
      nicheCard.appendChild(listContainer);

      promptResultBox.innerHTML = '';
      promptResultBox.appendChild(nicheCard);
      promptResultBox.appendChild(progressDiv);

      for (let bIdx = 0; bIdx < imageBatches.length; bIdx++) {
        const currentBatch = imageBatches[bIdx];
        const apiKey = apiKeys[bIdx % apiKeys.length];
        progressDiv.innerHTML = `⚡ Processing Batch #${bIdx + 1}/${totalBatchCount} (${currentBatch.length} images)...`;

        try {
          const batchResults = await processImageBatch(currentBatch, apiKey, {
            rows, cols, total, lineWeight, spacingLabel, model
          });

          batchResults.forEach((res, itemIdx) => {
            const globalImgIndex = bIdx * chunkSize + itemIdx;
            const promptText = res.prompt;
            let rawTitle = (res.title || `Reference Image #${globalImgIndex + 1}`).trim();
            const promptTitle = rawTitle.replace(/\s*(vector\s*)?icon\s*sheet/gi, '').replace(/\s*vector/gi, '').trim() || rawTitle;
            const keywords = res.keywords || [];

            promptResults.push({ niche: promptTitle, variation: 1, promptText });

            const promptItem = document.createElement('div');
            promptItem.className = 'bulk-prompt-item';
            promptItem.innerHTML = `
              <div class="bulk-prompt-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                <span style="font-weight: 700; color: var(--tertiary); font-size: 13px; line-height: 1.3; word-break: break-word; flex: 1;">🖼️ ${promptTitle}</span>
                <div style="display: flex; gap: 6px; flex-shrink: 0;">
                  <button class="btn btn-dark small send-flow-btn" style="padding: 2px 8px; font-size: 11px;">☁️ Flow</button>
                  <button class="btn btn-dark small copy-bulk-btn" style="padding: 2px 8px; font-size: 11px;">📋 Copy</button>
                  <button class="btn btn-dark small delete-prompt-btn" style="padding: 2px 8px; font-size: 11px; color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3);" title="Delete this prompt">🗑️ Delete</button>
                </div>
              </div>
              ${keywords.length ? `<div style="font-size: 11px; color: var(--on-variant); margin-bottom: 6px; word-break: break-word;">🏷️ Keywords: ${keywords.join(', ')}</div>` : ''}
              <pre class="bulk-prompt-text">${promptText}</pre>
            `;

            promptItem.querySelector('.copy-bulk-btn').addEventListener('click', () => {
              navigator.clipboard.writeText(promptText);
              alert('Prompt copied to clipboard!');
            });

            promptItem.querySelector('.send-flow-btn').addEventListener('click', () => {
              launchTool3(promptText);
            });

            promptItem.querySelector('.delete-prompt-btn').addEventListener('click', () => {
              promptItem.remove();
              const targetIdx = promptResults.findIndex(p => p.promptText === promptText);
              if (targetIdx !== -1) promptResults.splice(targetIdx, 1);
              promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);
            });

            listContainer.appendChild(promptItem);
          });
        } catch (err) {
          console.error(`Batch #${bIdx + 1} Error:`, err);
          alert(`Batch #${bIdx + 1} Error: ${err.message}`);
        }
      }

      progressDiv.remove();
      generatePromptBtn.disabled = false;
      if (bulkActions) bulkActions.style.display = 'flex';
      promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);
      return;
    }
    const promptResults = []; // To store all prompts for global export
    const promises = [];
    let completedCount = 0;
    const totalRequests = niches.length * promptsPerNicheCount;

    // Create all niche cards and list containers upfront
    const listContainers = [];
    for (let i = 0; i < niches.length; i++) {
      const niche = niches[i];
      const nicheCard = document.createElement('div');
      nicheCard.className = 'bulk-niche-card';
      nicheCard.innerHTML = `
        <div class="bulk-niche-title">📂 Niche: ${niche}</div>
        <div class="bulk-prompt-list" id="niche-list-${i}"></div>
      `;

      if (i === 0) {
        promptResultBox.innerHTML = '';
        promptResultBox.appendChild(progressDiv);
      }
      promptResultBox.insertBefore(nicheCard, progressDiv);
      listContainers[i] = document.getElementById(`niche-list-${i}`);
    }

    // Launch parallel requests for all niches and variations
    for (let i = 0; i < niches.length; i++) {
      const niche = niches[i];
      const listContainer = listContainers[i];

      for (let j = 0; j < promptsPerNicheCount; j++) {
        const promise = (async () => {
          let keyIndex = (i * promptsPerNicheCount + j) % apiKeys.length;
          const seedInt = Math.floor(Math.random() * 1000000);
          let topicsSubject = `- Icon set topics/subjects: ${niche}.`;
          if (niche.startsWith("Reference Image") && uploadedPromptImages.length > 0) {
            topicsSubject = `- Icon set topics/subjects: Visually analyze the main subjects/niche of the reference images and generate a list of related icons/terms for the grid cells.`;
          }

          const textLabelSelect = document.getElementById('textLabelSelect');
          const textLabelOpt = textLabelSelect ? textLabelSelect.value : 'none';
          let textLabelInstruction = '- Strictly isolated icons ONLY with NO text, NO labels, NO typography underneath the icon cells.';
          if (textLabelOpt === 'with-text') {
            textLabelInstruction = '- Clear text label under each icon cell in clean typography.';
          }

          let systemInstruction = `You are a master AI art prompt engineer for Midjourney v6 and DALL-E 3. 
Your task is to generate a single, rich, fluent, highly detailed, production-grade icon sheet master prompt for creating a vector icon grid.
DO NOT use mechanical numbered lists (no "1. 2. 3."). Instead, write an elegant, expressive, natural prose prompt.

CRITICAL MONOCHROME BLACK & WHITE MANDATE:
- Pure black line-art outlines on a solid pure white background ONLY.
- Absolutely ZERO color, NO color fills, NO gradients, NO 3D rendering, NO realistic shading, NO drop shadows, NO 3D volumetric effects. Minimalist flat 2D black-and-white vector line-art ONLY.

Requirements:
- Icon Grid: A mathematically aligned tabular array layout of exactly ${rows} rows by ${cols} columns (${total} total icons) with ${spacingLabel} on a solid pure white background.
- Icons: Exactly ${total} distinct, creative icons matching the niche '${niche}'. Weave all ${total} icon subjects naturally into a smooth descriptive sentence.
- Slicing alignment: Every icon occupies its own distinct grid cell with a subtle container outline line, centered with uniform cell dimensions.
- Style & Aesthetic: ${lineWeight}, crisp black line-art, flat vector design, zero color, zero 3D rendering, zero shading, high contrast, clean typography if requested. ${textLabelInstruction}
- Seed Modifier: ${seedInt}.

Output ONLY the final production AI prompt string ready to copy-paste. Do not include any chat formatting or quotes.`;

          let attempt = 0;
          let success = false;
          let generatedText = '';
          const maxAttempts = Math.max(3, apiKeys.length * 2);

          while (attempt < maxAttempts && !success) {
            const currentKey = apiKeys[keyIndex];
            try {
              const contents = [];
              let localizedPrompt = systemInstruction;

              if (uploadedPromptImages.length > 0) {
                const targetImages = (isImageNiches && uploadedPromptImages.length > 1) ? [uploadedPromptImages[i]] : uploadedPromptImages;
                localizedPrompt += `\n\nCRITICAL VISUAL SPECIFICATION: You must visually analyze the attached ${targetImages.length} reference style image(s). 
Identify their outline/fill styles, icon densities, level of details, stroke widths, shape conventions, and general layout aesthetics. 
Synthesize these visual properties and stylistic DNA into your generated prompt string so that a new AI image generation from it produces icons with a matching style.`;

                const parts = [{ text: localizedPrompt }];
                targetImages.forEach(img => {
                  parts.push({
                    inlineData: {
                      mimeType: img.mimeType,
                      data: img.data
                    }
                  });
                });
                contents.push({ parts });
              } else {
                contents.push({
                  parts: [
                    { text: localizedPrompt }
                  ]
                });
              }

              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
              });

              const data = await response.json();
              if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                generatedText = data.candidates[0].content.parts[0].text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
                success = true;
              } else if (data.error) {
                console.warn(`Key #${keyIndex + 1} Error (${data.error.code || ''}): ${data.error.message}`);
                generatedText = `Error from Gemini API (Key #${keyIndex + 1}): ${data.error.message}`;
                keyIndex = (keyIndex + 1) % apiKeys.length;
                attempt++;
                await new Promise(r => setTimeout(r, 500));
              } else {
                generatedText = `Unknown API Error.`;
                keyIndex = (keyIndex + 1) % apiKeys.length;
                attempt++;
                await new Promise(r => setTimeout(r, 500));
              }
            } catch (err) {
              console.warn(`Network Error on Key #${keyIndex + 1}: ${err.message}`);
              generatedText = `Network Error: ${err.message}`;
              keyIndex = (keyIndex + 1) % apiKeys.length;
              attempt++;
              await new Promise(r => setTimeout(r, 500));
            }
          }

          // Save result object
          promptResults.push({ niche, variation: j + 1, promptText: generatedText });

          // Build individual variation item
          const promptItem = document.createElement('div');
          promptItem.className = 'bulk-prompt-item';
          promptItem.innerHTML = `
            <div class="bulk-prompt-header" style="display: flex; justify-content: flex-end;">
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-dark small send-flow-btn" style="padding: 2px 8px; font-size: 11px;">☁️ Flow</button>
                <button class="btn btn-dark small copy-bulk-btn" style="padding: 2px 8px; font-size: 11px;">📋 Copy</button>
                <button class="btn btn-dark small delete-prompt-btn" style="padding: 2px 8px; font-size: 11px; color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3);" title="Delete this prompt">🗑️ Delete</button>
              </div>
            </div>
            <pre class="bulk-prompt-text">${generatedText}</pre>
          `;

          promptItem.querySelector('.copy-bulk-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(generatedText);
            alert('Prompt variation copied to clipboard!');
          });

          promptItem.querySelector('.send-flow-btn').addEventListener('click', () => {
            launchTool3(generatedText);
          });

          promptItem.querySelector('.delete-prompt-btn').addEventListener('click', () => {
            promptItem.remove();

            const targetIndex = promptResults.findIndex(p => p.niche === niche && p.variation === (j + 1) && p.promptText === generatedText);
            if (targetIndex !== -1) {
              promptResults.splice(targetIndex, 1);
            }

            promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);

            if (listContainer && listContainer.children.length === 0) {
              const nicheCard = listContainer.closest('.bulk-niche-card');
              if (nicheCard) nicheCard.remove();
            }

            if (promptResults.length === 0) {
              if (bulkActions) bulkActions.style.display = 'none';
              promptResultBox.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">
                  <p style="font-size: 16px;">All generated prompts deleted.</p>
                </div>
              `;
            }
          });

          listContainer.appendChild(promptItem);

          completedCount++;
          progressDiv.innerHTML = `⚡ Parallel Generating: Completed ${completedCount}/${totalRequests} prompts...`;
        })();

        promises.push(promise);
      }
    }

    await Promise.all(promises);

    progressDiv.remove();
    generatePromptBtn.disabled = false;
    if (bulkActions) bulkActions.style.display = 'flex';
    promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);
  });

  // Send All to Flow Action
  if (sendAllToFlowBtn) {
    sendAllToFlowBtn.addEventListener('click', () => {
      const prompts = getCleanPromptsFromTool1();
      if (prompts.length === 0) {
        alert('No prompts found in Icon Sheet Generator (Tool #1). Please generate prompts in Tool #1 first!');
        return;
      }

      if (flowPromptsArea) {
        flowPromptsArea.value = prompts.join('\n');
        updateFlowPromptCount();
      }
      launchTool3();
    });
  }

  // Copy All Action
  copyPromptBtn.addEventListener('click', () => {
    const rawData = promptResultBox.dataset.generatedPrompts;
    if (rawData) {
      const items = JSON.parse(rawData);
      const outputText = items.map(item => `=== Niche: ${item.niche} (Variation #${item.variation}) ===\n${item.promptText}\n`).join('\n');
      navigator.clipboard.writeText(outputText);
      alert('All generated prompts copied to clipboard!');
    } else {
      alert('No prompts available to copy.');
    }
  });

  function triggerBrowserDownload(content, fileName, mimeType) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      console.error('Browser fallback download failed:', e);
    }
  }

  // Download All Action
  downloadPromptBtn.addEventListener('click', () => {
    const rawData = promptResultBox.dataset.generatedPrompts;
    if (rawData) {
      const items = JSON.parse(rawData);
      const outputText = items.map(item => `=== Niche: ${item.niche} (Variation #${item.variation}) ===\n${item.promptText}\n`).join('\n');
      
      // Delegate save to local server file system (Electron Save As Dialog)
      if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
        sendFlowActionSpecific('save-text-file', 'default', {
          fileName: 'bulk-icon-prompts.txt',
          fileContent: outputText,
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
      } else {
        // Fallback to browser blob download
        triggerBrowserDownload(outputText, 'bulk-icon-prompts.txt', 'text/plain;charset=utf-8;');
      }
    } else {
      alert('No prompts available to download.');
    }
  });

  // Download CSV Action
  if (downloadPromptCsvBtn) {
    downloadPromptCsvBtn.addEventListener('click', () => {
      const rawData = promptResultBox.dataset.generatedPrompts;
      if (rawData) {
        const items = JSON.parse(rawData);
        
        // CSV Header with UTF-8 BOM
        let csvContent = "\uFEFFNiche,Variation,Prompt\n";
        
        // CSV Rows
        items.forEach(item => {
          const nicheStr = String(item.niche || '');
          const varStr = String(item.variation || '');
          const promptStr = String(item.promptText || '');

          const escapedNiche = `"${nicheStr.replace(/"/g, '""')}"`;
          const escapedVariation = `"${varStr.replace(/"/g, '""')}"`;
          const escapedPrompt = `"${promptStr.replace(/"/g, '""')}"`;
          csvContent += `${escapedNiche},${escapedVariation},${escapedPrompt}\n`;
        });
        
        // Delegate save to local server file system (Electron Save As Dialog)
        if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
          sendFlowActionSpecific('save-text-file', 'default', {
            fileName: 'bulk-icon-prompts.csv',
            fileContent: csvContent,
            filters: [
              { name: 'CSV Files', extensions: ['csv'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          });
        } else {
          // Fallback to browser blob download
          triggerBrowserDownload(csvContent, 'bulk-icon-prompts.csv', 'text/csv;charset=utf-8;');
        }
      } else {
        alert('No prompts available to download.');
      }
    });
  }

  // ==========================================
  // Tool #3 Google Flow Generator Connection Client
  // ==========================================
  let flowSocket = null;
  let flowProfilesCached = [];

  function initFlowConnection() {
    if (flowSocket && (flowSocket.readyState === WebSocket.OPEN || flowSocket.readyState === WebSocket.CONNECTING)) {
      sendFlowAction('profiles'); // Ask profiles status
      return;
    }

    try {
      // Connect to local WebSocket backend on the current host/port
      const wsUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;
      flowSocket = new WebSocket(wsUrl);

      flowSocket.onopen = () => {
        console.log('[flow-client] Connected to local automation websocket host');
        sendFlowAction('profiles');
      };

      flowSocket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleFlowServerMessage(msg);
        } catch (e) {
          console.error('[flow-client] failed parsing message:', e);
        }
      };

      flowSocket.onclose = () => {
        console.warn('[flow-client] Connection closed');
        flowProfilesCached.forEach(p => { p.connected = false; p.browserRunning = false; });
        updateActiveProfileCard();
      };

      flowSocket.onerror = (err) => {
        console.error('[flow-client] WebSocket socket failure:', err);
        flowProfilesCached.forEach(p => { p.connected = false; p.browserRunning = false; });
        updateActiveProfileCard();
      };

    } catch (err) {
      console.error('[flow-client] init exception:', err);
    }
  }

  function sendFlowAction(action, payload = {}) {
    const selectedId = flowProfileSelect.value || 'default';
    sendFlowActionSpecific(action, selectedId, payload);
  }

  function sendFlowActionSpecific(action, targetProfileId, payload = {}) {
    if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
      flowSocket.send(JSON.stringify({ action, profileId: targetProfileId, ...payload }));
    } else {
      const waitOpen = () => {
        if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
          flowSocket.send(JSON.stringify({ action, profileId: targetProfileId, ...payload }));
        } else {
          alert('Error: WebSocket backend offline. Please ensure the local server is running.');
        }
        if (flowSocket) {
          flowSocket.removeEventListener('open', waitOpen);
        }
      };
      
      if (!flowSocket || flowSocket.readyState === WebSocket.CLOSED || flowSocket.readyState === WebSocket.CLOSING) {
        console.warn('[flow-client] Connection offline, attempting connection');
        initFlowConnection();
      }
      
      if (flowSocket) {
        flowSocket.addEventListener('open', waitOpen);
      } else {
        alert('Error: WebSocket client initialization failed.');
      }
    }
  }

  function handleFlowServerMessage(msg) {
    console.log('[flow-client] msg', msg);
    
    switch (msg.type) {
      case 'profiles':
      case 'profile-add': {
        if (msg.ok && msg.profiles) {
          flowProfilesCached = msg.profiles;
          populateProfileDropdown(msg.profiles);
        }
        if (msg.error) {
          alert('Error: ' + msg.error);
        }
        break;
      }

      case 'status':
      case 'login':
      case 'init':
      case 'disconnect': {
        if (msg.status) {
          const idx = flowProfilesCached.findIndex(p => p.id === msg.status.profileId);
          if (idx !== -1) {
            flowProfilesCached[idx] = msg.status;
            updateActiveProfileCard();
          } else {
            sendFlowActionSpecific('profiles', 'default');
          }
        } else if (msg.profiles) {
          flowProfilesCached = msg.profiles;
          populateProfileDropdown(msg.profiles);
        }
        if (msg.error) {
          alert('Action error: ' + msg.error);
        }
        break;
      }

      case 'flow-progress': {
        flowRunProgress.style.display = 'inline-block';
        flowProgressBar.style.display = 'block';
        flowRunProgress.textContent = `Progress: ${msg.completed}/${msg.total}`;
        const percent = Math.min(100, (msg.completed / msg.total) * 100);
        flowProgressBarInner.style.width = `${percent}%`;
        break;
      }

      case 'flow-item': {
        flowEmptyState.style.display = 'none';
        
        const parentIndex = Math.floor(msg.index / 100);
        const subIndex = msg.index % 100;
        
        let card = document.getElementById(`flow-card-${msg.index}`);
        if (!card) {
          card = document.createElement('div');
          card.id = `flow-card-${msg.index}`;
          card.className = 'bulk-prompt-item';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '10px';
          card.style.background = 'var(--surface-lowest)';
          card.style.border = '1px solid var(--outline-variant)';
          card.style.padding = '16px';
          card.style.borderRadius = '14px';
          card.style.boxSizing = 'border-box';
          card.style.height = 'auto';
          card.style.minHeight = 'fit-content';
          flowResultGallery.appendChild(card);
        }

        if (msg.status === 'processing') {
          card.innerHTML = `
            <div class="bulk-prompt-header" style="border-bottom: 1px solid var(--outline-variant); padding-bottom: 6px;">
              <span>Prompt #${parentIndex + 1} (Image ${subIndex + 1})</span>
              <span style="color: var(--accent);">⚡ Injecting...</span>
            </div>
            <div style="min-height: 180px; max-height: 240px; background: var(--surface-lowest); border-radius: 8px; border: 1px solid var(--outline-variant); display: grid; place-items: center; color: var(--on-variant);">
              <div style="text-align: center;">
                <div style="font-size: 24px; animation: pulseDot 1.5s infinite;">🪐</div>
                <div style="font-size: 11px; margin-top: 6px; opacity: 0.8;">Pasting prompt in Google Flow...</div>
              </div>
            </div>
          `;
        } else if (msg.status === 'done') {
          const fileName = msg.savedFile ? msg.savedFile.split(/[\\/]/).pop() : `google_flow_${Date.now()}.png`;

          // Automatic browser file download if Auto-Save is checked
          const flowAutoSaveToggle = document.getElementById('flowAutoSaveToggle');
          const autoSaveChecked = flowAutoSaveToggle ? flowAutoSaveToggle.checked : true;
          if (autoSaveChecked && msg.dataUrl) {
            try {
              const dlAnchor = document.createElement('a');
              dlAnchor.href = msg.dataUrl;
              dlAnchor.download = fileName;
              document.body.appendChild(dlAnchor);
              dlAnchor.click();
              document.body.removeChild(dlAnchor);
            } catch (dlErr) {
              console.warn('Auto download error:', dlErr);
            }
          }

          card.innerHTML = `
            <div class="bulk-prompt-header" style="border-bottom: 1px solid var(--outline-variant); padding-bottom: 6px;">
              <span>Prompt #${parentIndex + 1} (Image ${subIndex + 1})</span>
              <span style="color: var(--tertiary); font-weight: 700;">✨ Done</span>
            </div>
            <div style="width: 100%; min-height: 180px; max-height: 260px; background: var(--surface-lowest); border-radius: 10px; border: 1px solid var(--outline-variant); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; cursor: pointer; padding: 4px;" class="flow-img-preview" data-img-url="${msg.dataUrl}" title="Click to view full image">
              <img src="${msg.dataUrl}" style="max-width: 100%; max-height: 250px; width: auto; height: auto; object-fit: contain; border-radius: 6px;" />
              <div class="img-hover-overlay" style="position: absolute; inset: 0; background: rgba(10, 10, 12, 0.65); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.25s ease; color: #fff; font-size: 12px; font-weight: 700; gap: 6px;">
                🔍 Click to View Full Image
              </div>
            </div>
            <div style="font-size: 11px; color: var(--on-variant); display: flex; justify-content: space-between; padding-top: 4px;">
              <span>Seed: ${msg.seed || 'N/A'}</span>
              <span>Model: ${msg.model || 'Flow'}</span>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <a href="${msg.dataUrl}" download="${fileName}" class="btn btn-primary small" style="flex: 1; text-align: center; text-decoration: none; padding: 7px 10px; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                📥 Save Image
              </a>
              <button class="btn btn-dark small btn-copy-prompt" data-prompt="${(msg.prompt || '').replace(/"/g, '&quot;')}" style="padding: 7px 10px; font-size: 11.5px; font-weight: 700;" title="Copy Prompt">
                📋
              </button>
            </div>
            ${msg.savedFile ? `
              <div style="font-size: 10.5px; color: var(--tertiary); white-space: normal; word-break: break-all; padding-top: 6px; line-height: 1.3;" title="${msg.savedFile}">
                💾 Auto-Saved: ${fileName}
              </div>` : ''}
          `;
        } else if (msg.status === 'error') {
          card.innerHTML = `
            <div class="bulk-prompt-header" style="border-bottom: 1px solid var(--outline-variant); padding-bottom: 6px;">
              <span>Prompt #${parentIndex + 1} (Image ${subIndex + 1})</span>
              <span style="color: #ea4335;">❌ Failed</span>
            </div>
            <div style="aspect-ratio: 1; background: rgba(234, 67, 53, 0.04); border-radius: 8px; border: 1px solid rgba(234, 67, 53, 0.15); display: grid; place-items: center; color: #ea4335; font-size: 12px; padding: 18px; text-align: center;">
              <div>
                <span style="font-size: 24px;">⚠️</span>
                <div style="margin-top: 6px; font-weight: 700;">Generation Error</div>
                <div style="font-size: 11px; opacity: 0.85; margin-top: 4px; line-height: 1.3;">${msg.message || msg.error}</div>
              </div>
            </div>
          `;
        }
        break;
      }

      case 'generate-result': {
        btnFlowStart.disabled = false;
        btnFlowStop.disabled = true;
        if (!msg.ok) {
          alert('Generation Batch Error: ' + msg.error);
        } else {
          console.log('[flow-client] Batch generation complete', msg);
        }
        break;
      }

      case 'vectorize-tile-result': {
        if (typeof window.handleVectorizeTileResult === 'function') {
          window.handleVectorizeTileResult(msg);
        }
        break;
      }

      case 'save-vector-sheet': {
        if (typeof window.handleSaveVectorSheetResult === 'function') {
          window.handleSaveVectorSheetResult(msg);
        }
        break;
      }

      case 'save-text-file': {
        if (msg.ok) {
          alert(`Saved successfully:\n${msg.filePath}`);
        } else if (msg.cancelled) {
          // Do nothing, save cancelled by user
          console.log('[flow-client] File save cancelled by user.');
        } else {
          alert('Save failed: ' + msg.error);
        }
        break;
      }

      case 'error': {
        alert('Server Error: ' + (msg.error || 'Unknown websocket error'));
        break;
      }
    }
  }

  function populateProfileDropdown(profiles) {
    const currentVal = flowProfileSelect.value || 'default';
    flowProfileSelect.innerHTML = '';
    
    if (profiles.length >= 3) {
      addProfileBtn.style.display = 'none';
    } else {
      addProfileBtn.style.display = 'block';
    }

    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.label} (Port ${p.port})`;
      flowProfileSelect.appendChild(opt);
    });

    if (Array.from(flowProfileSelect.options).some(o => o.value === currentVal)) {
      flowProfileSelect.value = currentVal;
    }
    
    updateActiveProfileCard();
  }

  function updateActiveProfileCard() {
    const selectedId = flowProfileSelect.value || 'default';
    const profile = flowProfilesCached.find(p => p.id === selectedId);
    if (!profile) return;

    // Checkbox state
    const isChecked = localStorage.getItem(`flow_use_profile_${selectedId}`) !== 'false';
    flowProfileUseCheckbox.checked = isChecked;

    // Disconnect button state
    btnFlowDisconnect.disabled = !profile.connected;

    // Status badge and details
    if (profile.connected) {
      connectionBadge.textContent = 'Active';
      connectionBadge.style.background = 'rgba(52, 168, 83, 0.15)';
      connectionBadge.style.color = '#34a853';
      connectionDetail.innerHTML = `
        Port: <strong>${profile.port}</strong> · Project: <strong>${profile.projectId || 'None'}</strong><br/>
        Tokens: <strong style="color:${profile.hasTokens ? '#34a853':'#fbbc05'}">${profile.hasTokens ? 'Acquired' : 'Pending'}</strong>
      `;
    } else {
      connectionBadge.textContent = 'Offline';
      connectionBadge.style.background = 'rgba(234, 67, 53, 0.15)';
      connectionBadge.style.color = '#ea4335';
      
      let note = 'Browser offline';
      if (profile.browserRunning) {
        note = 'Launch detected, CDP connecting...';
      }
      connectionDetail.innerHTML = `
        Port: <strong>${profile.port}</strong> · Status: <strong style="color:#ea4335">Offline</strong><br/>
        Detail: ${note}
      `;
    }

    updateStartButtonState();
  }

  function updateStartButtonState() {
    const startBtn = document.getElementById('btnFlowStart');
    const isAnyActiveAndChecked = flowProfilesCached.some(p => {
      const isChecked = localStorage.getItem(`flow_use_profile_${p.id}`) !== 'false';
      return isChecked && p.connected;
    });
    startBtn.disabled = !isAnyActiveAndChecked;
  }

  // --- UI Action Event Bindings ---
  flowProfileSelect.addEventListener('change', () => {
    updateActiveProfileCard();
  });

  flowProfileUseCheckbox.addEventListener('change', (e) => {
     const selectedId = flowProfileSelect.value || 'default';
     localStorage.setItem(`flow_use_profile_${selectedId}`, e.target.checked);
     updateStartButtonState();
  });

  addProfileBtn.addEventListener('click', () => {
    sendFlowActionSpecific('profile-add', 'default');
  });

  btnFlowOpen.addEventListener('click', () => {
    const selectedId = flowProfileSelect.value || 'default';
    sendFlowActionSpecific('login', selectedId);
    let count = 0;
    const interval = setInterval(() => {
      sendFlowActionSpecific('status', selectedId);
      if (++count > 20) clearInterval(interval);
    }, 2000);
  });

  btnFlowConnect.addEventListener('click', () => {
    const selectedId = flowProfileSelect.value || 'default';
    sendFlowActionSpecific('init', selectedId);
  });

  btnFlowDisconnect.addEventListener('click', () => {
    const selectedId = flowProfileSelect.value || 'default';
    sendFlowActionSpecific('disconnect', selectedId);
  });

  btnFlowStart.addEventListener('click', () => {
    const prompts = getCleanFlowPrompts();
    if (!prompts.length) {
      alert('Please enter or upload prompt keywords first.');
      return;
    }

    const activeIds = flowProfilesCached
      .filter(p => localStorage.getItem(`flow_use_profile_${p.id}`) !== 'false')
      .map(p => p.id);

    if (!activeIds.length) {
      alert('Please select at least one active connected browser profile.');
      return;
    }

    const imgCount = Number(flowImagesPerPrompt.value) || 1;
    const clientSideTotal = prompts.length * imgCount;

    flowResultGallery.innerHTML = '';
    flowResultGallery.appendChild(flowEmptyState);
    flowEmptyState.style.display = 'none';

    flowProgressBar.style.display = 'block';
    flowProgressBarInner.style.width = '0%';
    flowRunProgress.style.display = 'inline-block';
    flowRunProgress.textContent = `Progress: 0/${clientSideTotal}`;

    btnFlowStart.disabled = true;
    btnFlowStop.disabled = false;

    const flowAutoSaveToggle = document.getElementById('flowAutoSaveToggle');
    const autoSaveEnabled = flowAutoSaveToggle ? flowAutoSaveToggle.checked : true;
    const targetOutputDir = autoSaveEnabled ? (flowOutputDir.value.trim() || 'Downloads/Gravity_Flow') : null;

    sendFlowActionSpecific('generate', 'default', {
      prompts,
      runId: Date.now(),
      profileIds: activeIds,
      imagesPerPrompt: imgCount,
      options: {
        model: flowModel.value,
        aspectRatio: flowAspectRatio.value
      },
      outputDir: targetOutputDir
    });
  });

  btnFlowStop.addEventListener('click', () => {
    sendFlowAction('stop');
  });

  // Folder Directory Picker logic
  const flowDirPicker = document.getElementById('flowDirPicker');
  const btnBrowseOutputDir = document.getElementById('btnBrowseOutputDir');
  if (flowDirPicker && flowOutputDir) {
    const handleDirPick = () => flowDirPicker.click();
    if (btnBrowseOutputDir) btnBrowseOutputDir.addEventListener('click', handleDirPick);

    flowDirPicker.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const firstFile = e.target.files[0];
        if (firstFile.path) {
          const dirPath = firstFile.path.substring(0, Math.max(firstFile.path.lastIndexOf('\\'), firstFile.path.lastIndexOf('/')));
          if (dirPath) flowOutputDir.value = dirPath;
        } else if (firstFile.webkitRelativePath) {
          const folderName = firstFile.webkitRelativePath.split('/')[0];
          if (folderName) flowOutputDir.value = folderName;
        }
      }
    });
  }

  // TXT file loader
  btnUploadTxt.addEventListener('click', () => {
    txtFileInput.click();
  });

  txtFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      flowPromptsArea.value = evt.target.result;
    };
    reader.readAsText(file);
  });



  // ==========================================
  // Tool #2 Icon Pack Banner Generator Logic
  // ==========================================
  let featuredIconImg = null;
  let gridIconImgs = [];

  const themeColors = {
    healthcare: { left: '#2a4436', right: '#f7f4fa' },
    slate: { left: '#1b263b', right: '#f0f4f8' },
    purple: { left: '#3c096c', right: '#f5f0ff' },
    red: { left: '#6b1111', right: '#fff5f5' },
    dark: { left: '#111111', right: '#1a1a1a' }
  };

  document.querySelectorAll('#themePresets .theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#themePresets .theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const themeKey = btn.getAttribute('data-theme');
      if (themeColors[themeKey]) {
        bannerLeftBg.value = themeColors[themeKey].left;
        bannerRightBg.value = themeColors[themeKey].right;
        renderBannerCanvas();
      }
    });
  });

  // Color & Text change listeners
  [bannerTitle, bannerCountText, bannerLeftBg, bannerRightBg].forEach(input => {
    if (input) input.addEventListener('input', () => renderBannerCanvas());
  });

  // Featured Icon Dropzone
  if (featuredIconDropzone && featuredIconInput) {
    featuredIconDropzone.addEventListener('click', () => featuredIconInput.click());
    featuredIconInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        featuredIconFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            featuredIconImg = img;
            renderBannerCanvas();
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Grid Icons Dropzone
  if (gridIconsDropzone && gridIconsFileInput) {
    gridIconsDropzone.addEventListener('click', () => gridIconsFileInput.click());
    gridIconsDropzone.addEventListener('dragover', (e) => e.preventDefault());
    gridIconsDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) loadGridIconFiles(e.dataTransfer.files);
    });
    gridIconsFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) loadGridIconFiles(e.target.files);
    });
  }

  function loadGridIconFiles(files) {
    Array.from(files).slice(0, 15).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          if (gridIconImgs.length < 15) {
            gridIconImgs.push(img);
            bannerIconsCountBadge.textContent = `Loaded: ${gridIconImgs.length}/15 Icons`;
            renderBannerCanvas();
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnClearBannerIcons) {
    btnClearBannerIcons.addEventListener('click', () => {
      gridIconImgs = [];
      featuredIconImg = null;
      featuredIconFileName.textContent = 'Upload Featured Icon';
      bannerIconsCountBadge.textContent = 'Loaded: 0/15 Icons';
      renderBannerCanvas();
    });
  }

  if (btnRenderBanner) {
    btnRenderBanner.addEventListener('click', () => renderBannerCanvas());
  }

  if (btnDownloadBanner) {
    btnDownloadBanner.addEventListener('click', () => {
      if (!bannerCanvas) return;
      const link = document.createElement('a');
      link.download = `${bannerTitle.value.toLowerCase().replace(/\s+/g, '_')}_banner.png`;
      link.href = bannerCanvas.toDataURL('image/png');
      link.click();
    });
  }

  // Canvas Renderer Engine
  function renderBannerCanvas() {
    if (!bannerCanvas) return;
    const ctx = bannerCanvas.getContext('2d');
    const W = 1200;
    const H = 560;

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // Left Panel Dimensions
    const leftW = 320;
    const leftBg = bannerLeftBg.value || '#2a4436';
    const rightBg = bannerRightBg.value || '#f7f4fa';

    // 1. Draw Left Panel Background
    ctx.fillStyle = leftBg;
    ctx.fillRect(0, 0, leftW, H);

    // 2. Draw Featured Main Icon Box (Left Sidebar)
    const featBoxX = 35;
    const featBoxY = 40;
    const featBoxW = 250;
    const featBoxH = 250;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(featBoxX, featBoxY, featBoxW, featBoxH);

    if (featuredIconImg) {
      const pad = 24;
      const maxW = featBoxW - pad * 2;
      const maxH = featBoxH - pad * 2;
      const scale = Math.min(maxW / featuredIconImg.width, maxH / featuredIconImg.height);
      const iw = featuredIconImg.width * scale;
      const ih = featuredIconImg.height * scale;
      const ix = featBoxX + (featBoxW - iw) / 2;
      const iy = featBoxY + (featBoxH - ih) / 2;
      ctx.drawImage(featuredIconImg, ix, iy, iw, ih);
    } else {
      // Clean default placeholder icon graphic (Matching uploaded image)
      drawPlaceholderIcon(ctx, featBoxX + featBoxW / 2, featBoxY + featBoxH / 2, 130, '#ffffff');
    }

    // 3. Draw Category / Niche Title Box
    const titleText = (bannerTitle.value || 'HEALTHCARE ICON').toUpperCase();
    const titleY = 345;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(featBoxX, titleY, featBoxW, 58);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, featBoxX + featBoxW / 2, titleY + 29);

    // 4. Draw Total Count Pill Badge (Bottom Left)
    const countText = (bannerCountText.value || '15 ICONS').toUpperCase();
    const pillX = 35;
    const pillY = 465;
    const pillW = 250;
    const pillH = 54;
    const pillRadius = 27;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
    ctx.fill();

    ctx.fillStyle = leftBg === '#111111' ? '#111111' : '#1b263b';
    ctx.font = '800 24px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countText, pillX + pillW / 2, pillY + pillH / 2);

    // 5. Draw Right Panel Background
    ctx.fillStyle = rightBg;
    ctx.fillRect(leftW, 0, W - leftW, H);

    // 6. Draw 15 Icon Grid Tiles (3 Rows x 5 Columns)
    const cols = 5;
    const rows = 3;
    const gridAreaX = leftW + 35;
    const gridAreaY = 40;
    const gridAreaW = W - leftW - 70; // 810px
    const gridAreaH = H - 80;         // 480px

    const cardW = 125;
    const cardH = 125;

    const gapX = (gridAreaW - cols * cardW) / (cols - 1); // ~ 46px
    const gapY = (gridAreaH - rows * cardH) / (rows - 1); // ~ 52px

    const cardIconColor = '#344e41'; // Dark healthcare green icon tint

    let iconIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = gridAreaX + c * (cardW + gapX);
        const cy = gridAreaY + r * (cardH + gapY);

        // Draw tile box
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 20);
        ctx.fill();
        ctx.restore();

        // Draw inner icon or placeholder
        if (gridIconImgs[iconIdx]) {
          const pad = 16;
          const maxW = cardW - pad * 2;
          const maxH = cardH - pad * 2;
          const img = gridIconImgs[iconIdx];
          const scale = Math.min(maxW / img.width, maxH / img.height);
          const iw = img.width * scale;
          const ih = img.height * scale;
          const ix = cx + (cardW - iw) / 2;
          const iy = cy + (cardH - ih) / 2;
          ctx.drawImage(img, ix, iy, iw, ih);
        } else {
          drawPlaceholderIcon(ctx, cx + cardW / 2, cy + cardH / 2, 64, cardIconColor);
        }

        iconIdx++;
      }
    }
  }

  // Draw clean placeholder graphic matching the user's reference image
  function drawPlaceholderIcon(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.translate(cx, cy);

    const half = size / 2;
    const r = size * 0.22;

    // Rounded outer frame
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, r);
    ctx.stroke();

    // Sun circle (top left)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-half + size * 0.3, -half + size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Mountain path (bottom)
    ctx.beginPath();
    ctx.moveTo(-half + size * 0.15, half - size * 0.2);
    ctx.lineTo(-half + size * 0.45, -half + size * 0.45);
    ctx.lineTo(-half + size * 0.65, half - size * 0.3);
    ctx.lineTo(-half + size * 0.8, -half + size * 0.55);
    ctx.lineTo(half - size * 0.15, half - size * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Initial render when script loads
  if (bannerCanvas) {
    setTimeout(() => renderBannerCanvas(), 300);
  }

  // ==========================================
  // Tool #4 Icon Sheet Generator Engine
  // ==========================================
  let loadedSheetImg = null;
  let slicedTilesData = [];
  let generatedAssembledSvg = '';
  // Track how many tiles have received vector updates
  let vectorizeCompletedCount = 0;

  const tool4ViewEl = document.getElementById('tool4View');
  const sheetDropzone = document.getElementById('sheetDropzone');
  const sheetFileInput = document.getElementById('sheetFileInput');
  const sheetFileName = document.getElementById('sheetFileName');
  const sheetCols = document.getElementById('sheetCols');
  const sheetRows = document.getElementById('sheetRows');
  const sheetTileCount = document.getElementById('sheetTileCount');
  const sheetTrim = document.getElementById('sheetTrim');
  const sheetShuffle = document.getElementById('sheetShuffle');
  const vecSmoothing = document.getElementById('vecSmoothing');
  const vecSmoothingVal = document.getElementById('vecSmoothingVal');
  const vecCorner = document.getElementById('vecCorner');
  const vecCornerVal = document.getElementById('vecCornerVal');
  const vecSimplify = document.getElementById('vecSimplify');
  const vecSimplifyVal = document.getElementById('vecSimplifyVal');
  const vecSpeckle = document.getElementById('vecSpeckle');
  const vecSpeckleVal = document.getElementById('vecSpeckleVal');
  const vecOptimise = document.getElementById('vecOptimise');
  const vecUpscale = document.getElementById('vecUpscale');
  const vecTraceDetail = document.getElementById('vecTraceDetail');
  const sheetLayout = document.getElementById('sheetLayout');

  const vecFillColor = document.getElementById('vecFillColor');
  const vecFillHex = document.getElementById('vecFillHex');
  const sheetPresetSelect = document.getElementById('sheetPresetSelect');
  const sheetSetName = document.getElementById('sheetSetName');
  const sheetSubtitle = document.getElementById('sheetSubtitle');
  const sheetSaveDir = document.getElementById('sheetSaveDir');
  const btnSliceVectorize = document.getElementById('btnSliceVectorize');
  const btnSaveToPC = document.getElementById('btnSaveToPC');
  const btnToggleTilesView = document.getElementById('btnToggleTilesView');
  const btnToggleSheetView = document.getElementById('btnToggleSheetView');
  const btnDownloadAssembledSheet = document.getElementById('btnDownloadAssembledSheet');
  const tool4TilesContainer = document.getElementById('tool4TilesContainer');
  const tool4TilesGrid = document.getElementById('tool4TilesGrid');
  const tool4SheetWrap = document.getElementById('tool4SheetWrap');
  const tool4SheetCard = document.getElementById('tool4SheetCard');

  const defaultTemplateGeometries = {
    metal: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#5bb98c' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#45a677' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1600, fontSize: 104, fontFamily: 'Outfit', fill: '#12382b', text: 'METAL' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1730, fontSize: 44, fontFamily: 'Outfit', fill: '#12382b', text: '[COUNT] LINE ICONS' },
      { id: 'badgeBg', type: 'rect', name: 'Bottom Accent Box', x: 0, y: 1950, w: 1600, h: 650, radius: 0, fill: '#12382b' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 58, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] LINE ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#f1fbf6' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#12382b' }
    ],
    accounting: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#fff7ed' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#ffedd5' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1600, fontSize: 96, fontFamily: 'Outfit', fill: '#1c1917', text: 'ACCOUNTING' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1730, fontSize: 44, fontFamily: 'Outfit', fill: '#78350f', text: '[COUNT] EDITABLE STROKE' },
      { id: 'badgeBg', type: 'rect', name: 'Bottom Accent Box', x: 0, y: 1950, w: 1600, h: 650, radius: 0, fill: '#f95738' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 56, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] STROKE ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#27272a' }
    ],
    clipboard: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#e0f2fe' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 240, w: 1240, h: 1240, radius: 120, fill: '#bae6fd' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 240, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1640, fontSize: 92, fontFamily: 'Outfit', fill: '#0f172a', text: 'CLIPBOARD' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1760, fontSize: 44, fontFamily: 'Outfit', fill: '#0369a1', text: '[COUNT] LINE ICONS' },
      { id: 'badgeBg', type: 'rect', name: 'Orange Accent Badge', x: 400, y: 1880, w: 800, h: 140, radius: 70, fill: '#ea580c' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 1960, fontSize: 48, fontFamily: 'Outfit', fill: '#ffffff', text: 'LINE ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#0f172a' }
    ],
    document: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#18181b' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#27272a' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'badgeBg', type: 'rect', name: 'Red Accent Divider', x: 200, y: 1540, w: 1200, h: 12, radius: 6, fill: '#ef4444' },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1670, fontSize: 96, fontFamily: 'Outfit', fill: '#ffffff', text: 'DOCUMENT' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1780, fontSize: 48, fontFamily: 'Outfit', fill: '#ef4444', text: 'ICONS · VECTOR SVG' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 52, fontFamily: 'Outfit', fill: '#ef4444', text: '[COUNT] ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#27272a' }
    ],
    breakeven: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#f8fafc' },
      { id: 'topBanner', type: 'rect', name: 'Top Banner BG', x: 0, y: 0, w: 1600, h: 220, radius: 0, fill: '#2563eb' },
      { id: 'badgeText', type: 'text', name: 'Banner Text', x: 800, y: 140, fontSize: 64, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] ICONS' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 320, w: 1240, h: 1240, radius: 120, fill: '#e2e8f0' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 320, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1680, fontSize: 84, fontFamily: 'Outfit', fill: '#0f172a', text: 'BREAK EVEN POINT' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1790, fontSize: 44, fontFamily: 'Outfit', fill: '#475569', text: '[COUNT] VECTOR ICONS' },
      { id: 'badgeBg', type: 'rect', name: 'Bottom Accent Box', x: 0, y: 2150, w: 1600, h: 450, radius: 0, fill: '#2563eb' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#1e293b' }
    ],
    healthcare: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#2a4436' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#a3b18a' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1620, fontSize: 92, fontFamily: 'Outfit', fill: '#ffffff', text: 'HEALTHCARE ICON' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1740, fontSize: 48, fontFamily: 'Outfit', fill: 'rgba(255,255,255,0.7)', text: '[COUNT] ICONS · VECTOR SVG' },
      { id: 'badgeBg', type: 'rect', name: 'Count Badge BG', x: 560, y: 2180, w: 480, h: 140, radius: 70, fill: '#ffffff' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 52, fontFamily: 'Outfit', fill: '#2a4436', text: '[COUNT] ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#f7f4fa' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#344e41' }
    ],
    slate: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#0f172a' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#1e293b' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1620, fontSize: 92, fontFamily: 'Outfit', fill: '#ffffff', text: 'SLATE VECTOR ICONS' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1740, fontSize: 48, fontFamily: 'Outfit', fill: 'rgba(255,255,255,0.7)', text: '[COUNT] ICONS · VECTOR SVG' },
      { id: 'badgeBg', type: 'rect', name: 'Count Badge BG', x: 560, y: 2180, w: 480, h: 140, radius: 70, fill: '#38bdf8' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 52, fontFamily: 'Outfit', fill: '#0f172a', text: '[COUNT] ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#f8fafc' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#0f172a' }
    ],
    purple: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#2e1065' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#5b21b6' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1620, fontSize: 92, fontFamily: 'Outfit', fill: '#ffffff', text: 'CYBER PURPLE' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1740, fontSize: 48, fontFamily: 'Outfit', fill: 'rgba(255,255,255,0.7)', text: '[COUNT] ICONS · VECTOR SVG' },
      { id: 'badgeBg', type: 'rect', name: 'Count Badge BG', x: 560, y: 2180, w: 480, h: 140, radius: 70, fill: '#c084fc' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 52, fontFamily: 'Outfit', fill: '#2e1065', text: '[COUNT] ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#faf5ff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#4c1d95' }
    ],
    dark: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#09090b' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 120, fill: '#18181b' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1620, fontSize: 92, fontFamily: 'Outfit', fill: '#ffffff', text: 'MINIMAL DARK' },
      { id: 'subText', type: 'text', name: 'Subtitle Text', x: 800, y: 1740, fontSize: 48, fontFamily: 'Outfit', fill: 'rgba(255,255,255,0.7)', text: '[COUNT] ICONS · VECTOR SVG' },
      { id: 'badgeBg', type: 'rect', name: 'Count Badge BG', x: 560, y: 2180, w: 480, h: 140, radius: 70, fill: '#eab308' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2270, fontSize: 52, fontFamily: 'Outfit', fill: '#09090b', text: '[COUNT] ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#121216' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#f4f4f5' }
    ]
  };

  const sheetPresetThemes = {};
  Object.keys(defaultTemplateGeometries).forEach(k => {
    sheetPresetThemes[k] = defaultTemplateGeometries[k].map(l => ({ ...l }));
  });

  // Load custom presets from LocalStorage
  let customPresets = {};
  try {
    customPresets = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
  } catch (e) {}
  Object.assign(sheetPresetThemes, customPresets);

  // Restore last selected active preset from LocalStorage
  const savedActiveThemeKey = localStorage.getItem('gravity_active_preset') || 'healthcare';
  let activeLayers = (sheetPresetThemes[savedActiveThemeKey] || sheetPresetThemes.healthcare).map(l => ({ ...l }));

  // Sync color inputs
  if (vecFillColor && vecFillHex) {
    vecFillColor.addEventListener('input', () => {
      vecFillHex.value = vecFillColor.value;
      activeLayers.forEach(l => {
        if (l.type === 'grid' || l.type === 'featured') {
          l.fill = vecFillColor.value;
        }
      });
      buildBrandedSvgSheet();
    });
    vecFillHex.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(vecFillHex.value)) {
        vecFillColor.value = vecFillHex.value;
        activeLayers.forEach(l => {
          if (l.type === 'grid' || l.type === 'featured') {
            l.fill = vecFillHex.value;
          }
        });
        buildBrandedSvgSheet();
      }
    });
  }

  if (vecSmoothing && vecSmoothingVal) {
    vecSmoothing.addEventListener('input', () => vecSmoothingVal.textContent = vecSmoothing.value);
  }
  if (vecCorner && vecCornerVal) {
    vecCorner.addEventListener('input', () => vecCornerVal.textContent = vecCorner.value);
  }
  if (vecSimplify && vecSimplifyVal) {
    vecSimplify.addEventListener('input', () => vecSimplifyVal.textContent = (parseInt(vecSimplify.value) / 10).toFixed(1));
  }
  if (vecSpeckle && vecSpeckleVal) {
    vecSpeckle.addEventListener('input', () => vecSpeckleVal.textContent = vecSpeckle.value);
  }

  // Segmented button events styling support
  document.querySelectorAll('.upscale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.upscale-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'var(--on-primary)';
      if (vecUpscale) vecUpscale.value = btn.getAttribute('data-val');
      if (loadedSheetImg) {
        processIconSheetSlicingOnly();
      }
    });
  });

  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.detail-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'var(--on-primary)';
      if (vecTraceDetail) vecTraceDetail.value = btn.getAttribute('data-val');
    });
  });

  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'var(--on-primary)';
      if (sheetLayout) sheetLayout.value = btn.getAttribute('data-val');
      buildBrandedSvgSheet();
    });
  });

  // Rebuild template preset select options
  function rebuildPresetDropdown(preferredVal) {
    if (!sheetPresetSelect) return;
    const selectedVal = preferredVal || sheetPresetSelect.value || 'healthcare';
    sheetPresetSelect.innerHTML = '';

    const builtins = {
      metal: 'Metal Mint Industry (Template 1)',
      accounting: 'Coral Accounting (Template 2)',
      clipboard: 'Sky Orange Clipboard (Template 3)',
      document: 'Monochrome Document (Template 4)',
      breakeven: 'Steel Blue Corporate (Template 5)',
      healthcare: 'Healthcare Sage Green'
    };

    Object.keys(builtins).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = builtins[key];
      sheetPresetSelect.appendChild(opt);
    });

    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
    } catch (e) {}

    Object.keys(saved).forEach(key => {
      sheetPresetThemes[key] = saved[key].map(l => ({ ...l }));
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key + ' (Custom)';
      sheetPresetSelect.appendChild(opt);
    });

    if ([...sheetPresetSelect.options].some(o => o.value === selectedVal)) {
      sheetPresetSelect.value = selectedVal;
    } else {
      sheetPresetSelect.value = 'healthcare';
    }

    updateCustomSelectUI(sheetPresetSelect);
  }

  // Populate custom presets into dropdown immediately on initialization
  rebuildPresetDropdown();

  // Define designer properties inputs
  let currentDesignerLayerId = 'leftBg';

  // History Undo/Redo States
  let undoStack = [];
  let redoStack = [];
  const maxHistorySize = 50;

  function saveHistoryState() {
    // Clone active layers deeply
    const state = JSON.stringify(activeLayers);
    
    // Only push if the state actually changed compared to the last state in the stack
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === state) {
      return;
    }
    
    undoStack.push(state);
    if (undoStack.length > maxHistorySize) {
      undoStack.shift();
    }
    redoStack = []; // Clear redo stack on new action
    
    updateHistoryButtonsState();
  }

  function undo() {
    if (undoStack.length === 0) return;
    
    // Push current state to redo stack
    const currentState = JSON.stringify(activeLayers);
    redoStack.push(currentState);
    
    // Pop state from undo stack
    const previousState = JSON.parse(undoStack.pop());
    activeLayers = previousState;
    
    // Reset selection if the currently selected layer no longer exists
    if (currentDesignerLayerId && !activeLayers.some(l => l.id === currentDesignerLayerId)) {
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
    }
    
    renderDesignerLayersTree();
    if (currentDesignerLayerId) {
      loadDesignerLayerFields(currentDesignerLayerId);
    } else {
      clearDesignerLayerFields();
    }
    
    buildBrandedSvgSheet();
    updateHistoryButtonsState();
  }

  function redo() {
    if (redoStack.length === 0) return;
    
    // Push current state to undo stack
    const currentState = JSON.stringify(activeLayers);
    undoStack.push(currentState);
    
    // Pop from redo stack
    const nextState = JSON.parse(redoStack.pop());
    activeLayers = nextState;
    
    // Reset selection if needed
    if (currentDesignerLayerId && !activeLayers.some(l => l.id === currentDesignerLayerId)) {
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
    }

    renderDesignerLayersTree();
    if (currentDesignerLayerId) {
      loadDesignerLayerFields(currentDesignerLayerId);
    } else {
      clearDesignerLayerFields();
    }
    
    buildBrandedSvgSheet();
    updateHistoryButtonsState();
  }

  function updateHistoryButtonsState() {
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    if (btnUndo) btnUndo.disabled = (undoStack.length === 0);
    if (btnRedo) btnRedo.disabled = (redoStack.length === 0);
  }

  const uiElements = {
    labelTitle: document.getElementById('designerActiveLayerTitle'),
    propX: document.getElementById('propX'),
    propY: document.getElementById('propY'),
    propW: document.getElementById('propW'),
    propH: document.getElementById('propH'),
    propColor: document.getElementById('propColor'),
    propColorHex: document.getElementById('propColorHex'),
    propRadius: document.getElementById('propRadius'),
    propFont: document.getElementById('propFont'),
    propText: document.getElementById('propText'),
    btnResetLayoutColors: document.getElementById('btnResetLayoutColors'),
    newPresetName: document.getElementById('newPresetName'),
    btnSavePreset: document.getElementById('btnSavePreset'),
    btnDeletePreset: document.getElementById('btnDeletePreset'),
    propRadiusField: document.getElementById('propRadiusField'),
    propFontField: document.getElementById('propFontField')
  };

  // Compile layers list buttons dynamically
  function renderDesignerLayersTree() {
    const listEl = document.getElementById('designerLayerList');
    if (!listEl) return;
    listEl.innerHTML = '';

    activeLayers.forEach((layer, idx) => {
      const btn = document.createElement('div');
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'space-between';
      btn.style.width = '100%';
      btn.style.border = '1px solid ' + (currentDesignerLayerId === layer.id ? 'var(--outline-variant)' : 'transparent');
      btn.style.background = currentDesignerLayerId === layer.id ? 'var(--surface)' : 'transparent';
      btn.style.color = currentDesignerLayerId === layer.id ? '#fff' : 'rgba(255,255,255,0.7)';
      btn.style.fontSize = '12px';
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '8px';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s';
      
      let emoji = '▭';
      if (layer.type === 'ellipse') emoji = '⬭';
      if (layer.type === 'text') emoji = 'T';
      if (layer.type === 'grid') emoji = '▦';
      if (layer.type === 'featured') emoji = '★';

      const nameSpan = document.createElement('span');
      nameSpan.style.flex = '1';
      nameSpan.style.textAlign = 'left';
      nameSpan.textContent = `${emoji} ${layer.name}`;
      nameSpan.addEventListener('click', () => {
        currentDesignerLayerId = layer.id;
        loadDesignerLayerFields(layer.id);
        renderDesignerLayersTree();
      });

      const controlsWrap = document.createElement('div');
      controlsWrap.style.display = 'flex';
      controlsWrap.style.alignItems = 'center';
      controlsWrap.style.gap = '6px';

      // Move Up
      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.textContent = '▲';
      btnUp.title = 'Move Up';
      btnUp.style.border = 'none';
      btnUp.style.background = 'transparent';
      btnUp.style.color = idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)';
      btnUp.style.cursor = idx === 0 ? 'default' : 'pointer';
      btnUp.style.padding = '2px 4px';
      btnUp.style.fontSize = '10px';
      btnUp.disabled = idx === 0;
      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        saveHistoryState();
        const temp = activeLayers[idx];
        activeLayers[idx] = activeLayers[idx - 1];
        activeLayers[idx - 1] = temp;
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });

      // Move Down
      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.textContent = '▼';
      btnDown.title = 'Move Down';
      btnDown.style.border = 'none';
      btnDown.style.background = 'transparent';
      btnDown.style.color = idx === activeLayers.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)';
      btnDown.style.cursor = idx === activeLayers.length - 1 ? 'default' : 'pointer';
      btnDown.style.padding = '2px 4px';
      btnDown.style.fontSize = '10px';
      btnDown.disabled = idx === activeLayers.length - 1;
      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        saveHistoryState();
        const temp = activeLayers[idx];
        activeLayers[idx] = activeLayers[idx + 1];
        activeLayers[idx + 1] = temp;
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });

      // Delete
      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.textContent = '❌';
      btnDel.title = 'Delete Element';
      btnDel.style.border = 'none';
      btnDel.style.background = 'transparent';
      btnDel.style.cursor = 'pointer';
      btnDel.style.padding = '2px 4px';
      btnDel.style.fontSize = '10px';
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Remove layer "${layer.name}"?`)) {
          saveHistoryState();
          activeLayers.splice(idx, 1);
          if (currentDesignerLayerId === layer.id) {
            currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
          }
          if (currentDesignerLayerId) {
            loadDesignerLayerFields(currentDesignerLayerId);
          } else {
            clearDesignerLayerFields();
          }
          renderDesignerLayersTree();
          buildBrandedSvgSheet();
        }
      });

      controlsWrap.appendChild(btnUp);
      controlsWrap.appendChild(btnDown);
      controlsWrap.appendChild(btnDel);

      btn.appendChild(nameSpan);
      btn.appendChild(controlsWrap);
      listEl.appendChild(btn);
    });
  }

  // Clear fields helper
  function clearDesignerLayerFields() {
    if (!uiElements.labelTitle) return;
    uiElements.labelTitle.textContent = 'Properties: No Selection';
    uiElements.propX.value = '';
    uiElements.propY.value = '';
    uiElements.propW.value = '';
    uiElements.propH.value = '';
    uiElements.propRadius.value = '';
    uiElements.propColor.value = '#000000';
    uiElements.propColorHex.value = '#000000';
    if (uiElements.propText) uiElements.propText.value = '';
    
    document.getElementById('propTextField').style.display = 'none';
    document.getElementById('propFontField').style.display = 'none';
    document.getElementById('propRadiusField').style.display = 'none';
    
    uiElements.propX.disabled = true;
    uiElements.propY.disabled = true;
    uiElements.propW.disabled = true;
    uiElements.propH.disabled = true;
  }

  // Populate input values based on selected layer
  function loadDesignerLayerFields(layerId) {
    if (!uiElements.labelTitle) return;
    currentDesignerLayerId = layerId;
    
    const layer = activeLayers.find(l => l.id === layerId);
    if (!layer) {
      clearDesignerLayerFields();
      return;
    }

    uiElements.labelTitle.textContent = `Properties: ${layer.name}`;
    
    // Enable core inputs
    uiElements.propX.disabled = false;
    uiElements.propY.disabled = false;
    uiElements.propW.disabled = false;
    uiElements.propH.disabled = false;

    // Reset visibility of special fields
    document.getElementById('propRadiusField').style.display = 'none';
    document.getElementById('propFontField').style.display = 'none';
    document.getElementById('propTextField').style.display = 'none';

    // Populate core values
    uiElements.propX.value = layer.x || 0;
    uiElements.propY.value = layer.y || 0;
    uiElements.propW.value = (layer.type === 'text') ? (layer.fontSize || 72) : (layer.w || 0);
    uiElements.propH.value = layer.h || 0;

    // Adjust labels and text settings
    if (layer.type === 'text') {
      document.getElementById('lblPropW').textContent = 'Font Size (px)';
      document.getElementById('propHField').style.display = 'none';
      document.getElementById('propFontField').style.display = 'block';
      document.getElementById('propTextField').style.display = 'block';
      uiElements.propFont.value = layer.fontFamily || 'Outfit';
      if (uiElements.propText) uiElements.propText.value = layer.text || '';
    } else {
      document.getElementById('lblPropW').textContent = 'Width W (px)';
      document.getElementById('propHField').style.display = 'block';
    }

    // Radius / grid margins label adjustments
    if (layer.type === 'rect') {
      document.getElementById('propRadiusField').style.display = 'block';
      document.getElementById('lblPropRadius').textContent = 'Corner Radius (rx)';
      uiElements.propRadius.value = layer.radius || 0;
    } 
    else if (layer.type === 'grid') {
      document.getElementById('propRadiusField').style.display = 'block';
      document.getElementById('lblPropRadius').textContent = 'Grid Padding (px)';
      uiElements.propRadius.value = layer.padding || 0;
    }

    // Color fields visibility
    if (layer.type === 'featured') {
      document.getElementById('propColorField').style.display = 'none';
    } else {
      document.getElementById('propColorField').style.display = 'block';
      const c = layer.fill || '#111111';
      uiElements.propColor.value = c;
      uiElements.propColorHex.value = c;
    }
  }

  // Read input properties and save to current layout preset
  function saveCurrentFieldsToActivePreset() {
    if (!currentDesignerLayerId) return;
    const layer = activeLayers.find(l => l.id === currentDesignerLayerId);
    if (!layer) return;

    const x = parseInt(uiElements.propX.value) || 0;
    const y = parseInt(uiElements.propY.value) || 0;
    const w = parseInt(uiElements.propW.value) || 0;
    const h = parseInt(uiElements.propH.value) || 0;
    const radius = parseInt(uiElements.propRadius.value) || 0;
    const color = uiElements.propColor.value;
    const font = uiElements.propFont.value;
    const textVal = uiElements.propText ? uiElements.propText.value : '';

    layer.x = x;
    layer.y = y;
    
    if (layer.type === 'text') {
      layer.fontSize = w; 
      layer.fontFamily = font;
      layer.text = textVal;
    } else {
      layer.w = w;
      layer.h = h;
    }

    if (layer.type === 'rect') {
      layer.radius = radius;
    } else if (layer.type === 'grid') {
      layer.padding = radius; 
    }

    if (layer.type !== 'featured') {
      layer.fill = color;
    }

    buildBrandedSvgSheet();
  }

  // Bind properties inputs
  ['propX', 'propY', 'propW', 'propH', 'propRadius'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveCurrentFieldsToActivePreset);
  });

  if (uiElements.propColor && uiElements.propColorHex) {
    uiElements.propColor.addEventListener('input', () => {
      uiElements.propColorHex.value = uiElements.propColor.value;
      saveCurrentFieldsToActivePreset();
    });
    uiElements.propColorHex.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(uiElements.propColorHex.value)) {
        uiElements.propColor.value = uiElements.propColorHex.value;
        saveCurrentFieldsToActivePreset();
      }
    });
  }

  if (uiElements.propFont) {
    uiElements.propFont.addEventListener('change', saveCurrentFieldsToActivePreset);
  }
  if (uiElements.propText) {
    uiElements.propText.addEventListener('input', saveCurrentFieldsToActivePreset);
  }

  // Bind Add shape triggers
  const btnAddRect = document.getElementById('btnAddRect');
  const btnAddEllipse = document.getElementById('btnAddEllipse');
  const btnAddText = document.getElementById('btnAddText');
  const btnAddGrid = document.getElementById('btnAddGrid');
  const btnAddFeatured = document.getElementById('btnAddFeatured');
  const btnClearCanvas = document.getElementById('btnClearCanvas');

  if (btnAddRect) {
    btnAddRect.addEventListener('click', () => {
      saveHistoryState();
      const id = 'rect_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'rect',
        name: 'Rectangle ' + (activeLayers.filter(l => l.type === 'rect').length + 1),
        x: 1000,
        y: 1000,
        w: 500,
        h: 500,
        radius: 0,
        fill: '#344e41'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddEllipse) {
    btnAddEllipse.addEventListener('click', () => {
      saveHistoryState();
      const id = 'ellipse_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'ellipse',
        name: 'Ellipse ' + (activeLayers.filter(l => l.type === 'ellipse').length + 1),
        x: 1000,
        y: 1000,
        w: 500,
        h: 500,
        fill: '#a3b18a'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddText) {
    btnAddText.addEventListener('click', () => {
      saveHistoryState();
      const id = 'text_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'text',
        name: 'Text ' + (activeLayers.filter(l => l.type === 'text').length + 1),
        x: 1000,
        y: 1000,
        fontSize: 72,
        fontFamily: 'Outfit',
        fill: '#111111',
        text: 'Custom Text'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddGrid) {
    btnAddGrid.addEventListener('click', () => {
      saveHistoryState();
      const id = 'grid_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'grid',
        name: 'Icons Grid ' + (activeLayers.filter(l => l.type === 'grid').length + 1),
        x: 2000,
        y: 500,
        w: 3000,
        h: 1500,
        padding: 100,
        fill: '#1b263b'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddFeatured) {
    btnAddFeatured.addEventListener('click', () => {
      saveHistoryState();
      const id = 'featured_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'featured',
        name: 'Featured Icon ' + (activeLayers.filter(l => l.type === 'featured').length + 1),
        x: 500,
        y: 500,
        w: 1000,
        h: 1000
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnClearCanvas) {
    btnClearCanvas.addEventListener('click', () => {
      if (confirm('Clear the canvas artboard to completely blank?')) {
        saveHistoryState();
        activeLayers = [];
        currentDesignerLayerId = null;
        clearDesignerLayerFields();
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      }
    });
  }

  // Save new layout preset
  const btnSavePresetEl = document.getElementById('btnSavePreset');
  if (btnSavePresetEl) {
    btnSavePresetEl.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      const newPresetNameEl = document.getElementById('newPresetName');
      const name = (newPresetNameEl ? newPresetNameEl.value : '').trim();
      if (!name) {
        alert('Please enter a preset name!');
        return;
      }
      
      let saved = {};
      try {
        saved = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
      } catch(e){}
      
      // Clone all layers for saving
      saved[name] = activeLayers.map(l => ({ ...l }));
      localStorage.setItem('gravity_sheet_presets', JSON.stringify(saved));
      sheetPresetThemes[name] = activeLayers.map(l => ({ ...l }));
      
      rebuildPresetDropdown(name);
      if (newPresetNameEl) newPresetNameEl.value = '';
      alert(`Preset "${name}" saved successfully!`);
    });
  }

  // Delete layout preset from list
  const btnDeletePresetEl = document.getElementById('btnDeletePreset');
  if (btnDeletePresetEl) {
    btnDeletePresetEl.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      const selected = sheetPresetSelect ? sheetPresetSelect.value : '';
      if (!selected || ['healthcare', 'slate', 'purple', 'dark'].includes(selected)) {
        alert('System presets cannot be deleted!');
        return;
      }
      
      if (confirm(`Are you sure you want to delete preset "${selected}"?`)) {
        let saved = {};
        try {
          saved = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
        } catch(e){}
        
        delete saved[selected];
        localStorage.setItem('gravity_sheet_presets', JSON.stringify(saved));
        delete sheetPresetThemes[selected];
        
        rebuildPresetDropdown('healthcare');
        if (sheetPresetSelect) sheetPresetSelect.dispatchEvent(new Event('change'));
        alert(`Preset "${selected}" deleted.`);
      }
    });
  }

  // Reset properties and colors of current theme to database defaults
  if (uiElements.btnResetLayoutColors) {
    uiElements.btnResetLayoutColors.addEventListener('click', () => {
      const key = sheetPresetSelect.value;
      let baseKey = key;
      if (!defaultTemplateGeometries[key]) {
        baseKey = 'healthcare';
      }
      
      activeLayers = defaultTemplateGeometries[baseKey].map(l => ({ ...l }));
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
      if (currentDesignerLayerId) {
        loadDesignerLayerFields(currentDesignerLayerId);
      } else {
        clearDesignerLayerFields();
      }
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
      alert('Layout coordinates and colors reset to original theme defaults!');
    });
  }

  // Handle preset selector dropdown changes
  if (sheetPresetSelect) {
    sheetPresetSelect.addEventListener('change', () => {
      const selected = sheetPresetSelect.value;
      localStorage.setItem('gravity_active_preset', selected);
      if (sheetPresetThemes[selected]) {
        activeLayers = sheetPresetThemes[selected].map(l => ({ ...l }));
      }
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
      if (currentDesignerLayerId) {
        loadDesignerLayerFields(currentDesignerLayerId);
      } else {
        clearDesignerLayerFields();
      }
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  // Handle slicing detection mode select changes
  const sheetDetectMode = document.getElementById('sheetDetectMode');
  if (sheetDetectMode) {
    sheetDetectMode.addEventListener('change', () => {
      const colsGroup = sheetCols.closest('.ctl-group.half');
      const rowsGroup = sheetRows.closest('.ctl-group.half');
      if (sheetDetectMode.value === 'auto') {
        if (colsGroup) colsGroup.style.opacity = '0.4';
        if (rowsGroup) rowsGroup.style.opacity = '0.4';
      } else {
        if (colsGroup) colsGroup.style.opacity = '1.0';
        if (rowsGroup) rowsGroup.style.opacity = '1.0';
      }
      processIconSheetSlicingOnly();
    });
  }

  rebuildPresetDropdown();
  renderDesignerLayersTree();
  loadDesignerLayerFields('leftBg');
  buildBrandedSvgSheet();

  // Update live tile count and auto-trigger raw slice preview
  function updateSheetTileCount() {
    const c = parseInt(sheetCols.value) || 1;
    const r = parseInt(sheetRows.value) || 1;
    if (sheetTileCount) sheetTileCount.textContent = (c * r).toString();
    if (loadedSheetImg) {
      processIconSheetSlicingOnly();
    }
  }
  if (sheetCols) sheetCols.addEventListener('input', updateSheetTileCount);
  if (sheetRows) sheetRows.addEventListener('input', updateSheetTileCount);

  // File Upload Handlers
  if (sheetDropzone && sheetFileInput) {
    sheetDropzone.addEventListener('click', () => sheetFileInput.click());
    sheetDropzone.addEventListener('dragover', (e) => e.preventDefault());
    sheetDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) loadSheetImageFile(e.dataTransfer.files[0]);
    });
    sheetFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) loadSheetImageFile(e.target.files[0]);
    });
  }

  function loadSheetImageFile(file) {
    if (!file.type.startsWith('image/')) return;
    if (sheetFileName) sheetFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        loadedSheetImg = img;
        // Instantly slice & show raw crops
        processIconSheetSlicingOnly();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Toggle View Tabs
  if (btnToggleTilesView) {
    btnToggleTilesView.addEventListener('click', () => {
      if (tool4TilesContainer) tool4TilesContainer.style.display = 'block';
      if (tool4SheetWrap) tool4SheetWrap.style.display = 'none';
    });
  }

  if (btnToggleSheetView) {
    btnToggleSheetView.addEventListener('click', () => {
      if (tool4TilesContainer) tool4TilesContainer.style.display = 'none';
      if (tool4SheetWrap) tool4SheetWrap.style.display = 'block';
    });
  }

  // Helper: pixel ink background detection
  function detectGridBackground(data, w, h) {
    const rs = [], gs = [], bs = [];
    const push = (i) => { rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); };
    for (let x = 0; x < w; x++) {
      push((0 * w + x) * 4);
      push(((h - 1) * w + x) * 4);
    }
    for (let y = 0; y < h; y++) {
      push((y * w + 0) * 4);
      push((y * w + w - 1) * 4);
    }
    const med = (a) => { if (!a.length) return 255; a.sort((p, q) => p - q); return a[a.length >> 1]; };
    return [med(rs), med(gs), med(bs)];
  }

  // Helper: gutter snap axis calculator
  function snapAxis(n, profile, aSize, srcSize) {
    const map = (a) => Math.round(a * srcSize / aSize);
    let first = 0, last = aSize;
    for (let x = 0; x < aSize; x++) { if (profile[x] > 0) { first = x; break; } }
    for (let x = aSize - 1; x >= 0; x--) { if (profile[x] > 0) { last = x + 1; break; } }
    if (last - first < n) { first = 0; last = aSize; }
    const span = last - first;
    const lines = new Array(n + 1);
    lines[0] = map(first);
    lines[n] = map(last);
    for (let i = 1; i < n; i++) {
      const center = first + i * span / n;
      const win = Math.max(2, (span / n) * 0.4);
      const lo = Math.max(first + 1, Math.floor(center - win));
      const hi = Math.min(last - 1, Math.ceil(center + win));
      let best = Math.round(center), bestVal = Infinity;
      for (let x = lo; x <= hi; x++) {
        const v = profile[x] + Math.abs(x - center) * 0.01;
        if (v < bestVal) {
          bestVal = v;
          best = x;
        }
      }
      lines[i] = map(best);
    }
    for (let i = 1; i <= n; i++) {
      if (lines[i] <= lines[i - 1]) lines[i] = Math.min(srcSize, lines[i - 1] + 1);
    }
    return lines;
  }

  // Auto-detect icon boundaries using Connected Component Labeling
  function autoDetectIconBounds(img, threshold = 238, minSize = 15, mergeDist = 20) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    // Offscreen scanning canvas at scaled-down size for peak performance
    const maxScanW = 1000;
    let scanW = w;
    let scanH = h;
    let ratio = 1;
    if (w > maxScanW) {
      ratio = maxScanW / w;
      scanW = maxScanW;
      scanH = Math.round(h * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = scanW;
    canvas.height = scanH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, scanW, scanH);

    const imgData = ctx.getImageData(0, 0, scanW, scanH);
    const data = imgData.data;
    
    // Detect background color dynamically
    const bg = detectGridBackground(data, scanW, scanH);
    const bgR = bg[0], bgG = bg[1], bgB = bg[2];

    const visited = new Uint8Array(scanW * scanH);
    const boxes = [];

    // Helper to evaluate foreground intensity using color distance
    function isForeground(x, y) {
      if (x < 0 || x >= scanW || y < 0 || y >= scanH) return false;
      const idx = (y * scanW + x) * 4;
      const a = data[idx + 3];
      if (a < 30) return false; // Transparent is background
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
      
      return dist > 18; // Color distance threshold (increased sensitivity)
    }

    // Flood fill scan
    for (let y = 0; y < scanH; y += 2) {
      for (let x = 0; x < scanW; x += 2) {
        const pos = y * scanW + x;
        if (visited[pos]) continue;

        if (isForeground(x, y)) {
          let minX = x, maxX = x, minY = y, maxY = y;
          const queue = [[x, y]];
          visited[pos] = 1;

          while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            // Check 8 neighbors with step=1 for pixel-perfect contours
            const neighbors = [
              [cx + 1, cy], [cx - 1, cy],
              [cx, cy + 1], [cx, cy - 1],
              [cx + 1, cy + 1], [cx - 1, cy - 1],
              [cx + 1, cy - 1], [cx - 1, cy + 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < scanW && ny >= 0 && ny < scanH) {
                const npos = ny * scanW + nx;
                if (!visited[npos]) {
                  visited[npos] = 1;
                  if (isForeground(nx, ny)) {
                    queue.push([nx, ny]);
                  }
                }
              }
            }
          }

          const bw = maxX - minX;
          const bh = maxY - minY;
          if (bw >= minSize && bh >= minSize) {
            // Filter out:
            // 1. Grid skeleton/borders that span most of the scan width or height
            // 2. Extremely thin lines or noise (less than 8px)
            // 3. Extremely elongated shapes (ratio > 12) which are typical of isolated dividers
            const aspect = bw / bh;
            if (bw < scanW * 0.82 && bh < scanH * 0.82 && 
                bw >= 8 && bh >= 8 && 
                aspect < 12 && aspect > 0.08) {
              boxes.push({ x: minX, y: minY, w: bw, h: bh });
            }
          }
        }
      }
    }

    // Merge overlapping or close-by bounding boxes
    let mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const b1 = boxes[i];
          const b2 = boxes[j];

          // Check if distance between boxes is less than mergeDist
          const close = !(
            b1.x + b1.w + mergeDist < b2.x ||
            b2.x + b2.w + mergeDist < b1.x ||
            b1.y + b1.h + mergeDist < b2.y ||
            b2.y + b2.h + mergeDist < b1.y
          );

          if (close) {
            const minX = Math.min(b1.x, b2.x);
            const minY = Math.min(b1.y, b2.y);
            const maxX = Math.max(b1.x + b1.w, b2.x + b2.w);
            const maxY = Math.max(b1.y + b1.h, b2.y + b2.h);

            b1.x = minX;
            b1.y = minY;
            b1.w = maxX - minX;
            b1.h = maxY - minY;

            boxes.splice(j, 1);
            mergedAny = true;
            break;
          }
        }
        if (mergedAny) break;
      }
    }

    // Scale coordinates back to original size
    const realBoxes = boxes.map(b => {
      // Expand slightly to include edges
      const margin = 2;
      const rx = Math.max(0, Math.round((b.x - margin) / ratio));
      const ry = Math.max(0, Math.round((b.y - margin) / ratio));
      const rw = Math.min(w - rx, Math.round((b.w + 2 * margin) / ratio));
      const rh = Math.min(h - ry, Math.round((b.h + 2 * margin) / ratio));
      return { x: rx, y: ry, w: rw, h: rh };
    });

    // Group into horizontal rows (bands) based on overlapping Y coordinates
    const bands = [];
    realBoxes.forEach(box => {
      let placed = false;
      for (const band of bands) {
        const bandMidY = band.ySum / band.count;
        // Group if top/bottom coordinates overlap significantly
        if (Math.abs(box.y - bandMidY) < Math.max(box.h, 60)) {
          band.items.push(box);
          band.ySum += box.y;
          band.count++;
          placed = true;
          break;
        }
      }
      if (!placed) {
        bands.push({
          ySum: box.y,
          count: 1,
          items: [box]
        });
      }
    });

    // Sort bands top-to-bottom
    bands.sort((a, b) => (a.ySum / a.count) - (b.ySum / b.count));

    // Sort items inside each band left-to-right
    const sortedBoxes = [];
    bands.forEach(band => {
      band.items.sort((a, b) => a.x - b.x);
      sortedBoxes.push(...band.items);
    });

    return sortedBoxes;
  }

  // Slice & Show raw crop preview immediately (No vectorization yet)
  function processIconSheetSlicingOnly() {
    const cols = parseInt(sheetCols.value) || 5;
    const rows = parseInt(sheetRows.value) || 3;
    const totalTiles = cols * rows;
    const shouldTrim = sheetTrim ? sheetTrim.checked : true;
    const shouldShuffle = sheetShuffle ? sheetShuffle.checked : false;

    const imgW = loadedSheetImg.naturalWidth || loadedSheetImg.width;
    const imgH = loadedSheetImg.naturalHeight || loadedSheetImg.height;

    const detectMode = document.getElementById('sheetDetectMode')?.value || 'grid';
    const isAutoDetect = (detectMode === 'auto');

    let boxes = [];
    let tileCount = totalTiles;

    if (isAutoDetect) {
      boxes = autoDetectIconBounds(loadedSheetImg);
      tileCount = boxes.length;
    }

    // Smart Gutter Snapping grid detection
    let gridX = [], gridY = [];
    if (!isAutoDetect) {
      try {
        const scale = Math.min(1, 1000 / Math.max(imgW, imgH));
        const aw = Math.max(1, Math.round(imgW * scale));
        const ah = Math.max(1, Math.round(imgH * scale));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = aw;
        tempCanvas.height = ah;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.drawImage(loadedSheetImg, 0, 0, aw, ah);
        const data = tempCtx.getImageData(0, 0, aw, ah).data;
        const bg = detectGridBackground(data, aw, ah);

        const colInk = new Float64Array(aw);
        const rowInk = new Float64Array(ah);
        for (let y = 0; y < ah; y++) {
          for (let x = 0; x < aw; x++) {
            const i = (y * aw + x) * 4;
            const a = data[i + 3];
            if (a < 16) continue;
            const dr = data[i] - bg[0];
            const dg = data[i + 1] - bg[1];
            const db = data[i + 2] - bg[2];
            const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
            if (a * dist / 255 > 14) {
              colInk[x]++;
              rowInk[y]++;
            }
          }
        }
        gridX = snapAxis(cols, colInk, aw, imgW);
        gridY = snapAxis(rows, rowInk, ah, imgH);
      } catch (e) {
        console.warn('[slicer] Smart boundary snapping failed, falling back to even cuts', e);
        gridX = [];
        gridY = [];
        for (let i = 0; i <= cols; i++) gridX.push(Math.round(i * imgW / cols));
        for (let i = 0; i <= rows; i++) gridY.push(Math.round(i * imgH / rows));
      }
    }

    slicedTilesData = [];
    if (tool4TilesGrid) tool4TilesGrid.innerHTML = '';
    if (btnDownloadAssembledSheet) btnDownloadAssembledSheet.disabled = true;
    if (btnSaveToPC) btnSaveToPC.disabled = true;

    // Update UI Tile Count label
    const tileCountEl = document.getElementById('sheetTileCount');
    if (tileCountEl) {
      tileCountEl.textContent = tileCount;
    }

    let indices = Array.from({ length: tileCount }, (_, i) => i);
    if (shouldShuffle) {
      indices.sort(() => Math.random() - 0.5);
    }

    for (let i = 0; i < tileCount; i++) {
      const srcIdx = indices[i];
      let sx, sw, sy, sh;

      if (isAutoDetect) {
        const box = boxes[srcIdx];
        sx = box.x;
        sw = box.w;
        sy = box.y;
        sh = box.h;
      } else {
        const c = srcIdx % cols;
        const r = Math.floor(srcIdx / cols);
        sx = gridX[c];
        sw = gridX[c + 1] - sx;
        sy = gridY[r];
        sh = gridY[r + 1] - sy;
      }

      if (sw <= 0 || sh <= 0) continue;

      // Crop tile into offscreen canvas using snapped coordinates (with pre-slice upscale support)
      const upscaleFactor = vecUpscale ? parseInt(vecUpscale.value) : 4;
      let canvas = document.createElement('canvas');
      canvas.width = sw * upscaleFactor;
      canvas.height = sh * upscaleFactor;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(loadedSheetImg, sx, sy, sw, sh, 0, 0, sw * upscaleFactor, sh * upscaleFactor);

      if (shouldTrim) {
        canvas = autoTrimCanvasTile(canvas);
      }

      const dataUrl = canvas.toDataURL('image/png');

      slicedTilesData.push({
        idx: i + 1,
        canvas: canvas,
        svgContent: '', // Will hold the vector path response later
        dataUrl: dataUrl,
        isVectorized: false
      });

      // Render cell in grid UI as raw image preview
      if (tool4TilesGrid) {
        const cellEl = document.createElement('div');
        cellEl.id = `tool4-tile-card-${i + 1}`;
        cellEl.style.cssText = 'background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 14px; padding: 14px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        cellEl.innerHTML = `
          <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--on-surface-variant); background: rgba(255,255,255,0.06); border: 1px solid var(--outline); padding: 3px 8px; border-radius: 6px;">#${i + 1} Sliced</div>
          <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px;">
            <img src="${dataUrl}" style="max-width: 84px; max-height: 84px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
          </div>
        `;
        tool4TilesGrid.appendChild(cellEl);
      }
    }
  }

  // Trigger WebSocket server-assisted contour / curve tracing
  if (btnSliceVectorize) {
    btnSliceVectorize.addEventListener('click', () => {
      if (!loadedSheetImg || slicedTilesData.length === 0) {
        alert('Please upload an icon sheet image first!');
        return;
      }

      btnSliceVectorize.disabled = true;
      btnSliceVectorize.textContent = '⏳ Vectorizing...';
      vectorizeCompletedCount = 0;

      const fillColor = vecFillColor ? vecFillColor.value : '#344e41';
      const mode = vecMode ? vecMode.value : 'bw';
      const smoothing = vecSmoothing ? parseInt(vecSmoothing.value) : 5;
      const corner = vecCorner ? parseInt(vecCorner.value) : 133;
      const simplify = vecSimplify ? parseInt(vecSimplify.value) / 10 : 5.5;
      const speckle = vecSpeckle ? parseInt(vecSpeckle.value) : 3;
      const optimise = vecOptimise ? vecOptimise.checked : true;
      const upscale = vecUpscale ? parseInt(vecUpscale.value) : 4;
      const traceDetail = vecTraceDetail ? parseInt(vecTraceDetail.value) : 1600;

      slicedTilesData.forEach((tile, index) => {
        // Show spinning indicator on this card
        const cardEl = document.getElementById(`tool4-tile-card-${tile.idx}`);
        if (cardEl) {
          cardEl.innerHTML = `
            <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--accent); background: rgba(52,152,219,0.12); padding: 3px 8px; border-radius: 6px;">#${tile.idx}</div>
            <div style="width: 100px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 12px; color: var(--on-surface-variant);">
              <div style="font-size: 24px; animation: spin 1s linear infinite;">⏳</div>
              <div style="font-size: 10px; margin-top: 8px; opacity: 0.8;">Tracing curves...</div>
            </div>
          `;
        }

        // Check if WebSocket server is available or fallback to Web Worker Client-Side Vectorizer
        if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
          sendFlowActionSpecific('vectorize-tile', 'default', {
            index: tile.idx,
            dataUrl: tile.dataUrl,
            mode: mode,
            color: fillColor,
            smoothing: smoothing,
            corner: corner,
            simplify: simplify,
            speckle: speckle,
            optimise: optimise,
            upscale: upscale,
            maxRes: traceDetail
          });
        } else {
          vectorizeTileClientSide(tile, mode, fillColor, smoothing, corner, simplify, speckle);
        }
      });
    });
  }

  function vectorizeTileClientSide(tile, mode, fillColor, smoothing, corner, simplify, speckle) {
    if (!tile || !tile.dataUrl) {
      const emptySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"></svg>`;
      window.handleVectorizeTileResult({ ok: true, index: tile ? tile.idx : 1, svg: emptySvg });
      return;
    }

    const img = new Image();
    img.onload = function() {
      const w = img.width || 128;
      const h = img.height || 128;

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%"><rect width="${w}" height="${h}" fill="none"/><image href="${tile.dataUrl}" width="${w}" height="${h}"/></svg>`;

      window.handleVectorizeTileResult({ ok: true, index: tile.idx, svg: svgString });
    };

    img.onerror = function() {
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%"><image href="${tile.dataUrl}" width="128" height="128"/></svg>`;
      window.handleVectorizeTileResult({ ok: true, index: tile.idx, svg: fallbackSvg });
    };

    // Trigger immediate load
    img.src = tile.dataUrl;
    if (img.complete) {
      img.onload();
    }
  }

  // Callback handler for WebSocket results
  window.handleVectorizeTileResult = function(msg) {
    const tileIdx = msg.index;
    const tile = slicedTilesData.find(t => t.idx === tileIdx);
    if (!tile) return;

    vectorizeCompletedCount++;
    const totalTiles = slicedTilesData.length;

    const cardEl = document.getElementById(`tool4-tile-card-${tileIdx}`);

    if (msg.ok) {
      tile.isVectorized = true;
      tile.svgContent = msg.svg;

      // Extract path tag from the SVG response
      const parser = new DOMParser();
      const doc = parser.parseFromString(msg.svg, 'image/svg+xml');
      
      // Parse viewBox attributes
      const svgRoot = doc.querySelector('svg');
      let viewBoxWidth = 100, viewBoxHeight = 100;
      if (svgRoot) {
        const vb = svgRoot.getAttribute('viewBox');
        if (vb) {
          const parts = vb.split(/\s+/).map(Number);
          if (parts.length === 4) {
            viewBoxWidth = parts[2];
            viewBoxHeight = parts[3];
          }
        }
      }
      tile.svgWidth = viewBoxWidth || 100;
      tile.svgHeight = viewBoxHeight || 100;

      const paths = Array.from(doc.querySelectorAll('path, image'));
      let extractedContent = '';
      paths.forEach(el => {
        extractedContent += el.outerHTML;
      });
      tile.svgPath = extractedContent || msg.svg;

      if (cardEl) {
        cardEl.innerHTML = `
          <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--tertiary); background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); padding: 3px 8px; border-radius: 6px;">#${tileIdx} Vector</div>
          <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px;" class="vector-preview-box">
            ${msg.svg}
          </div>
        `;
        const svgEl = cardEl.querySelector('.vector-preview-box svg');
        if (svgEl) {
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          svgEl.style.width = '80px';
          svgEl.style.height = '80px';
          svgEl.style.maxHeight = '100%';
          svgEl.style.maxWidth = '100%';
          svgEl.style.objectFit = 'contain';
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      }
    } else {
      tile.isVectorized = true;
      tile.svgPath = `<rect width="100" height="100" fill="#ea4335"/>`;
      if (cardEl) {
        cardEl.innerHTML = `
          <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: #ea4335; background: rgba(234,67,53,0.1); padding: 3px 8px; border-radius: 6px;">#${tileIdx} Error</div>
          <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px; font-size: 11px; color: #ea4335; text-align: center; padding: 6px;">
            Failed to trace
          </div>
        `;
      }
    }

    if (vectorizeCompletedCount >= totalTiles) {
      // Re-enable primary action button
      btnSliceVectorize.disabled = false;
      btnSliceVectorize.textContent = '⚡ Convert to Vector';

      // Build presentation sheet SVG
      buildBrandedSvgSheet();

      // Enable download and save buttons
      if (btnDownloadAssembledSheet) btnDownloadAssembledSheet.disabled = false;
      if (btnSaveToPC) btnSaveToPC.disabled = false;
    }
  };

  // Auto-trim whitespace from canvas tile
  function autoTrimCanvasTile(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const W = canvas.width;
    const H = canvas.height;
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;

    let minX = W, minY = H, maxX = -1, maxY = -1;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const alpha = data[i + 3];
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const isBg = (r > 235 && g > 235 && b > 235) || alpha < 20;
        if (!isBg) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) return canvas;

    const pad = Math.round(Math.min(maxX - minX, maxY - minY) * 0.16) + 12;
    const bx = Math.max(0, minX - pad);
    const by = Math.max(0, minY - pad);
    const bw = Math.min(W - bx, (maxX - minX) + pad * 2);
    const bh = Math.min(H - by, (maxY - minY) + pad * 2);

    const trimmed = document.createElement('canvas');
    trimmed.width = bw;
    trimmed.height = bh;
    const tCtx = trimmed.getContext('2d');
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, bw, bh);
    tCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, bw, bh);
    return trimmed;
  }

  // Build Assembled 6000x2600 Branded Presentation SVG Sheet (Crisp & High Resolution)
  function buildBrandedSvgSheet() {
    const cols = parseInt(sheetCols.value) || 5;
    const rows = parseInt(sheetRows.value) || 3;

    // Check if we have source data
    let tilesToRender = slicedTilesData;
    let isMockup = false;
    if (tilesToRender.length === 0) {
      isMockup = true;
      tilesToRender = [];
      const totalTiles = cols * rows;
      for (let i = 0; i < totalTiles; i++) {
        // Simple mock circular gears/stars vector path color
        tilesToRender.push({
          idx: i + 1,
          svgWidth: 100,
          svgHeight: 100,
          svgPath: `<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="6,4"/><path d="M50 25 L55 38 L68 38 L57 46 L61 58 L50 50 L39 58 L43 46 L32 38 L45 38 Z" fill="currentColor"/>`
        });
      }
    }

    const setNameText = ((sheetSetName ? sheetSetName.value : '') || (isMockup ? 'MY PRESET DESIGN' : 'HEALTHCARE ICON')).toUpperCase();
    const subtitleText = ((sheetSubtitle ? sheetSubtitle.value : '') || `${tilesToRender.length} ICONS · VECTOR SVG`).toUpperCase();

    const W = 6000;
    const H = 2600;

    // Find first grid layer for global fillColor
    const gridLayer = activeLayers.find(l => l.type === 'grid');
    const fillColor = (gridLayer && gridLayer.fill) || (vecFillColor ? vecFillColor.value : '#344e41');

    // Layout check: template vs compact
    const layoutMode = sheetLayout ? sheetLayout.value : 'template';
    if (layoutMode === 'compact') {
      const CELL = 256;
      const gapPx = 24;
      const pitch = CELL + gapPx;
      const compactW = cols * CELL + (cols + 1) * gapPx;
      const compactH = rows * CELL + (rows + 1) * gapPx;

      let compactCardsSvg = '';
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (idx >= tilesToRender.length) break;
          const tile = tilesToRender[idx];
          if (!tile) {
            idx++;
            continue;
          }
          const cellX = gapPx + c * pitch;
          const cellY = gapPx + r * pitch;
          const cx = cellX + CELL / 2;
          const cy = cellY + CELL / 2;
          const compactFitSize = CELL * 0.72;
          const tw = tile.svgWidth ? tile.svgWidth : 100;
          const th = tile.svgHeight ? tile.svgHeight : 100;
          const tScale = Math.min(compactFitSize / tw, compactFitSize / th);
          const tx = cx - (tw * tScale) / 2;
          const ty = cy - (th * tScale) / 2;

          compactCardsSvg += `
            <g transform="translate(${tx}, ${ty}) scale(${tScale})">
              ${tile.svgPath}
            </g>
          `;
          idx++;
        }
      }

      generatedAssembledSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${compactW} ${compactH}" width="${compactW}" height="${compactH}">
          <rect width="${compactW}" height="${compactH}" fill="#ffffff"/>
          <g fill="${fillColor}">
            ${compactCardsSvg}
          </g>
        </svg>
      `;
    } else {
      // Branded template rendering: dynamically serialize each layer in the stacking order
      let layersHtml = '';
      activeLayers.forEach(layer => {
        let layerText = layer.text || '';
        if (layerText.includes('[COUNT]')) {
          layerText = layerText.replace('[COUNT]', tilesToRender.length);
        }
        if (layerText.includes('[NAME]')) {
          layerText = layerText.replace('[NAME]', setNameText);
        }

        if (layer.type === 'rect') {
          const radiusAttr = layer.radius ? `rx="${layer.radius}"` : '';
          layersHtml += `    <!-- Rect: ${layer.name} -->\n    <rect data-id="${layer.id}" x="${layer.x}" y="${layer.y}" width="${layer.w}" height="${layer.h}" ${radiusAttr} fill="${layer.fill}" style="cursor: move;"/>\n`;
        }
        else if (layer.type === 'ellipse') {
          const cx = layer.x + layer.w / 2;
          const cy = layer.y + layer.h / 2;
          const rx = layer.w / 2;
          const ry = layer.h / 2;
          layersHtml += `    <!-- Ellipse: ${layer.name} -->\n    <ellipse data-id="${layer.id}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${layer.fill}" style="cursor: move;"/>\n`;
        }
        else if (layer.type === 'text') {
          const fontName = layer.fontFamily || 'Outfit';
          layersHtml += `    <!-- Text: ${layer.name} -->\n    <text data-id="${layer.id}" x="${layer.x}" y="${layer.y}" text-anchor="middle" fill="${layer.fill}" font-family="'${fontName}', sans-serif" font-weight="900" font-size="${layer.fontSize}" style="cursor: move; user-select: none;">${layerText}</text>\n`;
        }
        else if (layer.type === 'featured') {
          const featTile = tilesToRender[0];
          const featSvgContent = featTile ? featTile.svgPath : `<rect width="100" height="100" fill="#ffffff"/>`;
          const ftw = featTile && featTile.svgWidth ? featTile.svgWidth : 100;
          const fth = featTile && featTile.svgHeight ? featTile.svgHeight : 100;
          
          // Clean padding inside featured layer bounding box
          const pad = layer.w * 0.16; 
          const innerW = layer.w - 2 * pad;
          const innerH = layer.h - 2 * pad;
          const innerX = layer.x + pad;
          const innerY = layer.y + pad;

          layersHtml += `    <!-- Featured Icon: ${layer.name} -->\n    <svg data-id="${layer.id}" x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" viewBox="0 0 ${ftw} ${fth}" preserveAspectRatio="xMidYMid meet" fill="#ffffff" style="cursor: move; overflow: visible;">\n      ${featSvgContent}\n    </svg>\n`;
        }
        else if (layer.type === 'grid') {
          // Dynamic grid math: center a square cells grid inside this grid layer bounding box
          const gridPad = layer.padding !== undefined ? layer.padding : 140;
          const maxGridW = layer.w - 2 * gridPad;
          const maxGridH = layer.h - 2 * gridPad;
          const cellW = maxGridW / cols;
          const cellH = maxGridH / rows;
          const cellS = Math.min(cellW, cellH);

          const totalGridW = cols * cellS;
          const totalGridH = rows * cellS;
          const startX = layer.x + (layer.w - totalGridW) / 2;
          const startY = layer.y + (layer.h - totalGridH) / 2;

          let gridCardsSvg = '';
          let gridIdx = 0;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (gridIdx >= tilesToRender.length) break;
              const tile = tilesToRender[gridIdx];
              if (!tile) {
                gridIdx++;
                continue;
              }

              const cellX = startX + c * cellS;
              const cellY = startY + r * cellS;

              const pad = cellS * 0.15; // 15% padding inside grid cell
              const fitSize = cellS - 2 * pad;
              const tw = tile.svgWidth ? tile.svgWidth : 100;
              const th = tile.svgHeight ? tile.svgHeight : 100;

              const cellInnerX = cellX + pad;
              const cellInnerY = cellY + pad;

              gridCardsSvg += `
                <svg x="${cellInnerX}" y="${cellInnerY}" width="${fitSize}" height="${fitSize}" viewBox="0 0 ${tw} ${th}" preserveAspectRatio="xMidYMid meet" overflow="visible">
                  ${tile.svgPath}
                </svg>
              `;
              gridIdx++;
            }
          }

          layersHtml += `    <!-- Icon Grid: ${layer.name} -->\n    <g data-id="${layer.id}" fill="${layer.fill || fillColor}" style="cursor: move;">\n      ${gridCardsSvg}\n    </g>\n`;
        }
      });

      // Render selection outline and 4 handles if a layer is active
      const activeLayer = activeLayers.find(l => l.id === currentDesignerLayerId);
      if (activeLayer) {
        const al = activeLayer;
        let ax = al.x || 0;
        let ay = al.y || 0;
        let aw = (al.type === 'text') ? 600 : (al.w || 0);
        let ah = (al.type === 'text') ? (al.fontSize || 72) : (al.h || 0);
        
        if (al.type === 'text') {
          ax = al.x - aw / 2; // Center box for anchor middle text
          ay = al.y - ah;
        }

        const handleSize = 60; // scale size on 6000x2600 canvas
        
        layersHtml += `
          <!-- Selection Outlines & Resize Handles -->
          <g class="selection-overlay">
            <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" stroke="#2563eb" stroke-width="6" stroke-dasharray="14,14"/>
            <rect data-handle="tl" data-id="${al.id}" x="${ax - handleSize/2}" y="${ay - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nwse-resize;"/>
            <rect data-handle="tr" data-id="${al.id}" x="${ax + aw - handleSize/2}" y="${ay - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nesw-resize;"/>
            <rect data-handle="bl" data-id="${al.id}" x="${ax - handleSize/2}" y="${ay + ah - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nesw-resize;"/>
            <rect data-handle="br" data-id="${al.id}" x="${ax + aw - handleSize/2}" y="${ay + ah - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nwse-resize;"/>
          </g>
        `;
      }

      generatedAssembledSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
          <defs>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&amp;family=Montserrat:wght@700;900&amp;family=Roboto:wght@700;900&amp;display=swap');
            </style>
          </defs>
          ${layersHtml}
        </svg>
      `;
    }

    if (tool4SheetCard) tool4SheetCard.innerHTML = generatedAssembledSvg;
  }

  // Helper to sanitize SVG export by stripping UI selection overlays & resize handles
  function getCleanSvgForExport(svgStr) {
    if (!svgStr) return '';
    return svgStr
      .replace(/<!-- Selection Outlines & Resize Handles -->[\s\S]*?<\/g>/gi, '')
      .replace(/<g class="selection-overlay">[\s\S]*?<\/g>/gi, '');
  }

  // Trigger save to local PC folder via WebSocket
  if (btnSaveToPC) {
    btnSaveToPC.addEventListener('click', () => {
      if (!generatedAssembledSvg) return;

      const outputDir = sheetSaveDir ? sheetSaveDir.value.trim() : '';
      if (!outputDir) {
        alert('Please enter a target Save Directory!');
        return;
      }

      btnSaveToPC.disabled = true;
      btnSaveToPC.textContent = '⏳ Saving...';

      // Send the clean sanitized SVG (without UI selection handles)
      const cleanSvg = getCleanSvgForExport(generatedAssembledSvg);
      sendFlowActionSpecific('save-vector-sheet', 'default', {
        outputDir: outputDir,
        sheetSvg: cleanSvg,
        iconSvgs: slicedTilesData.map(t => t.svgContent)
      });
    });
  }

  // Callback handler for WebSocket save action
  window.handleSaveVectorSheetResult = function(msg) {
    if (btnSaveToPC) {
      btnSaveToPC.disabled = false;
      btnSaveToPC.textContent = '💾 Save to PC';
    }

    if (msg.ok) {
      alert(`Successfully saved to local PC directory:\n${msg.targetDir}\n\nFiles saved:\n- Complete Branded Sheet SVG\n- ${msg.savedIconsCount} Individual Icon SVGs`);
    } else {
      alert('Failed to save to PC:\n' + msg.error);
    }
  };

  // Download SVG Sheet manually
  if (btnDownloadAssembledSheet) {
    btnDownloadAssembledSheet.addEventListener('click', () => {
      if (!generatedAssembledSvg) return;
      const cleanSvg = getCleanSvgForExport(generatedAssembledSvg);
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${((sheetSetName ? sheetSetName.value : '') || 'icon_set').toLowerCase().replace(/\s+/g, '_')}_sheet.svg`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Pointer-Drag / Resizing Layer Editor
  let isDraggingLayer = false;
  let isResizingLayer = false;
  let resizeHandle = null;
  let dragStartLayerX = 0;
  let dragStartLayerY = 0;
  let dragStartLayerW = 0;
  let dragStartLayerH = 0;
  let dragStartFontSize = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragLayerId = null;

  if (tool4SheetCard) {
    tool4SheetCard.addEventListener('mousedown', (e) => {
      const target = e.target;
      if (!target) return;
      
      const handle = target.getAttribute('data-handle');
      const layerId = target.getAttribute('data-id') || target.closest('[data-id]')?.getAttribute('data-id');
      if (!layerId) {
        // Deselect active layer when clicking on empty background
        currentDesignerLayerId = null;
        document.querySelectorAll('.layer-item').forEach(li => li.classList.remove('active'));
        clearDesignerLayerFields();
        buildBrandedSvgSheet();
        return;
      }

      e.preventDefault();

      const layer = activeLayers.find(l => l.id === layerId);
      if (!layer) return;

      // Save history BEFORE drag or resize modification begins
      saveHistoryState();

      // Select this layer visually
      loadDesignerLayerFields(layerId);
      
      const listItem = document.querySelector(`.layer-item[data-layer-id="${layerId}"]`);
      if (listItem) {
        document.querySelectorAll('.layer-item').forEach(li => li.classList.remove('active'));
        listItem.classList.add('active');
      }

      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragLayerId = layerId;
      dragStartLayerX = layer.x || 0;
      dragStartLayerY = layer.y || 0;
      dragStartLayerW = layer.w || 0;
      dragStartLayerH = layer.h || 0;
      dragStartFontSize = layer.fontSize || 72;

      if (handle) {
        isResizingLayer = true;
        resizeHandle = handle;
        isDraggingLayer = false;
      } else {
        isDraggingLayer = true;
        isResizingLayer = false;
        resizeHandle = null;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if ((!isDraggingLayer && !isResizingLayer) || !dragLayerId) return;
      const layer = activeLayers.find(l => l.id === dragLayerId);
      if (!layer) return;

      const svgEl = tool4SheetCard.querySelector('svg');
      if (!svgEl) return;

      const rect = svgEl.getBoundingClientRect();
      const scaleX = 6000 / rect.width;
      const scaleY = 2600 / rect.height;

      const dx = (e.clientX - dragStartX) * scaleX;
      const dy = (e.clientY - dragStartY) * scaleY;

      if (isResizingLayer) {
        if (layer.type === 'text') {
          // Resize text font size based on drag direction
          const baseW = 600;
          let scaleFactor = 1.0;
          if (resizeHandle === 'br' || resizeHandle === 'tr') {
            scaleFactor = (baseW + dx) / baseW;
          } else {
            scaleFactor = (baseW - dx) / baseW;
          }
          layer.fontSize = Math.max(12, Math.round(dragStartFontSize * scaleFactor));
        } else {
          // Shape or Grid/Featured resizing
          if (resizeHandle === 'br') {
            layer.w = Math.max(50, Math.round(dragStartLayerW + dx));
            layer.h = Math.max(50, Math.round(dragStartLayerH + dy));
          }
          else if (resizeHandle === 'tr') {
            const newH = dragStartLayerH - dy;
            if (newH >= 50) {
              layer.h = Math.round(newH);
              layer.y = Math.round(dragStartLayerY + dy);
            }
            layer.w = Math.max(50, Math.round(dragStartLayerW + dx));
          }
          else if (resizeHandle === 'bl') {
            const newW = dragStartLayerW - dx;
            if (newW >= 50) {
              layer.w = Math.round(newW);
              layer.x = Math.round(dragStartLayerX + dx);
            }
            layer.h = Math.max(50, Math.round(dragStartLayerH + dy));
          }
          else if (resizeHandle === 'tl') {
            const newW = dragStartLayerW - dx;
            const newH = dragStartLayerH - dy;
            if (newW >= 50) {
              layer.w = Math.round(newW);
              layer.x = Math.round(dragStartLayerX + dx);
            }
            if (newH >= 50) {
              layer.h = Math.round(newH);
              layer.y = Math.round(dragStartLayerY + dy);
            }
          }
        }
      } else if (isDraggingLayer) {
        layer.x = Math.round(dragStartLayerX + dx);
        layer.y = Math.round(dragStartLayerY + dy);
      }

      // Sync field inputs
      if (uiElements.propX) uiElements.propX.value = layer.x;
      if (uiElements.propY) uiElements.propY.value = layer.y;
      if (uiElements.propW) uiElements.propW.value = (layer.type === 'text') ? (layer.fontSize || 72) : (layer.w || 0);
      if (uiElements.propH) uiElements.propH.value = layer.h || 0;

      buildBrandedSvgSheet();
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingLayer || isResizingLayer) {
        isDraggingLayer = false;
        isResizingLayer = false;
        resizeHandle = null;
        dragLayerId = null;
        saveCurrentFieldsToActivePreset();
      }
    });
  }

  // Bind Undo/Redo Click Triggers
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  if (btnUndo) btnUndo.addEventListener('click', undo);
  if (btnRedo) btnRedo.addEventListener('click', redo);

  // Save history state on focus of properties inputs to capture pre-change coordinates
  ['propX', 'propY', 'propW', 'propH', 'propRadius', 'propColor', 'propColorHex', 'propText'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('focus', () => {
        saveHistoryState();
      });
    }
  });
  if (uiElements.propFont) {
    uiElements.propFont.addEventListener('focus', () => {
      saveHistoryState();
    });
  }

  // Save history on preset selector change
  if (sheetPresetSelect) {
    sheetPresetSelect.addEventListener('change', () => {
      saveHistoryState();
    });
  }

  // Keyboard Shortcuts Hook
  window.addEventListener('keydown', (e) => {
    // Skip if actively typing inside properties text field to allow normal browser caret undo
    if (document.activeElement && document.activeElement.id === 'propText') {
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      redo();
    }
  });

});

