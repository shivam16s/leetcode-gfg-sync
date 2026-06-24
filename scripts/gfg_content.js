// Inject gfg_inject.js into the main world to intercept fetch/XHR
const script = document.createElement('script');
script.src = chrome.runtime.getURL('scripts/gfg_inject.js');
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// --- Problem Data Extraction ---

function extractProblemFromNextData() {
  try {
    const nextDataEl = document.getElementById('__NEXT_DATA__');
    if (!nextDataEl) return null;
    const data = JSON.parse(nextDataEl.textContent);
    const pageProps = data?.props?.pageProps;
    if (!pageProps) return null;

    // GFG nests problem data in various keys depending on version
    const pd = pageProps.problemData || pageProps.problem || pageProps;

    return {
      title: pd.problem_name || pd.title || pd.problemName || '',
      titleSlug: pd.slug || pd.problem_slug || extractSlugFromUrl(),
      difficulty: normalizeDifficulty(pd.difficulty || pd.difficultyLevel || ''),
      topicTags: extractTags(pd),
      content: pd.problem_statement || pd.description || pd.content || ''
    };
  } catch (err) {
    console.error('GFG: Failed to extract __NEXT_DATA__:', err);
    return null;
  }
}

function extractProblemFromDOM() {
  try {
    // Title
    const titleEl = document.querySelector('h3.problems_header_content__title__L2cB2') ||
      document.querySelector('h3[class*="title"]') ||
      document.querySelector('.problem-tab-title h3') ||
      document.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // Difficulty
    const diffEl = document.querySelector('.problems_header_content__difficulty__Jjimm') ||
      document.querySelector('[class*="difficulty"]') ||
      document.querySelector('.diff-chip');
    let difficulty = diffEl ? diffEl.textContent.trim() : 'Medium';

    // Tags
    const tagEls = document.querySelectorAll('.problems_tag_container__kWANg a, .problem-tag a, [class*="tag"] a');
    const tags = Array.from(tagEls).map(el => ({
      name: el.textContent.trim(),
      slug: el.textContent.trim().toLowerCase().replace(/\s+/g, '-')
    }));

    return {
      title: title,
      titleSlug: extractSlugFromUrl(),
      difficulty: normalizeDifficulty(difficulty),
      topicTags: tags.length > 0 ? tags : [{ name: 'GeeksforGeeks', slug: 'geeksforgeeks' }],
      content: ''
    };
  } catch (err) {
    console.error('GFG: Failed to extract from DOM:', err);
    return null;
  }
}

function extractSlugFromUrl() {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : 'unknown-problem';
}

function normalizeDifficulty(raw) {
  const d = String(raw).toLowerCase().trim();
  if (d.includes('easy') || d.includes('basic') || d.includes('school')) return 'Easy';
  if (d.includes('hard') || d.includes('difficult')) return 'Hard';
  return 'Medium';
}

function extractTags(pd) {
  const tagSources = pd.tags || pd.topicTags || pd.topics || pd.topic_tags || [];
  if (Array.isArray(tagSources)) {
    return tagSources.map(t => {
      if (typeof t === 'string') return { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') };
      return { name: t.name || t.tag_name || t, slug: (t.slug || t.name || '').toLowerCase().replace(/\s+/g, '-') };
    });
  }
  return [{ name: 'GeeksforGeeks', slug: 'geeksforgeeks' }];
}

// --- Code Extraction ---

function extractCode() {
  // Try CodeMirror 
  const cmEl = document.querySelector('.CodeMirror');
  if (cmEl && cmEl.CodeMirror) {
    return cmEl.CodeMirror.getValue();
  }

  // Try Ace Editor
  const aceEl = document.querySelector('.ace_editor');
  if (aceEl && window.ace) {
    const editor = window.ace.edit(aceEl);
    return editor.getValue();
  }

  // Try Monaco Editor (newer GFG)
  const monacoEl = document.querySelector('.monaco-editor');
  if (monacoEl && window.monaco) {
    const models = window.monaco.editor.getModels();
    if (models.length > 0) return models[0].getValue();
  }

  // Fallback: try textarea
  const textarea = document.querySelector('textarea[name="code"]') ||
    document.querySelector('.editor textarea') ||
    document.querySelector('#code');
  if (textarea) return textarea.value;

  return '';
}

function extractLanguage() {
  // Try the language selector dropdown
  const langSelector = document.querySelector('.problems_header_menu__items__Y3MXs select') ||
    document.querySelector('[class*="lang"] select') ||
    document.querySelector('#lang-select') ||
    document.querySelector('select[name="language"]');
  
  if (langSelector) {
    const selectedText = langSelector.options[langSelector.selectedIndex]?.text || '';
    return mapGfgLang(selectedText);
  }

  // Try button-style language selector
  const langBtn = document.querySelector('.problems_header_menu__items__Y3MXs button') ||
    document.querySelector('[class*="languageSelected"]') ||
    document.querySelector('[class*="lang-btn"]');
  
  if (langBtn) {
    return mapGfgLang(langBtn.textContent.trim());
  }

  return 'cpp'; // default
}

function mapGfgLang(raw) {
  const text = String(raw).toLowerCase().trim();
  if (text.includes('c++') || text.includes('cpp')) return 'cpp';
  if (text.includes('python3') || text.includes('python 3')) return 'python3';
  if (text.includes('python')) return 'python';
  if (text.includes('java')) return 'java';
  if (text.includes('javascript') || text.includes('js')) return 'javascript';
  if (text.includes('typescript') || text.includes('ts')) return 'typescript';
  if (text.includes('c#') || text.includes('csharp')) return 'csharp';
  if (text.includes('go')) return 'go';
  if (text.includes('ruby')) return 'ruby';
  if (text.includes('swift')) return 'swift';
  if (text.includes('kotlin')) return 'kotlin';
  if (text.includes('rust')) return 'rust';
  if (text.includes('php')) return 'php';
  if (text === 'c') return 'c';
  return 'cpp';
}

// --- Toast Notifications ---

function showToast(message, type = 'success') {
  const existingToast = document.getElementById('leetcode-gfg-sync-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'leetcode-gfg-sync-toast';
  toast.className = `lgs-toast lgs-toast-${type}`;
  toast.innerHTML = `
    <div class="lgs-toast-content">
      <span class="lgs-toast-icon">${type === 'success' ? '✅' : type === 'info' ? '🔄' : '❌'}</span>
      <span class="lgs-toast-message">${message}</span>
    </div>
    <div class="lgs-toast-progress"></div>
  `;
  document.body.appendChild(toast);

  if (type !== 'info') {
    setTimeout(() => {
      toast.classList.add('lgs-toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

function dismissToast() {
  const toast = document.getElementById('leetcode-gfg-sync-toast');
  if (toast) {
    toast.classList.add('lgs-toast-hide');
    setTimeout(() => toast.remove(), 300);
  }
}

// --- DOM Observer Fallback ---
// If XHR interception misses, watch for "Problem Solved Successfully" in DOM

let domObserverFired = false;

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (
          (text.includes('Problem Solved Successfully') || text.includes('Correct Answer')) &&
          !domObserverFired
        ) {
          domObserverFired = true;
          setTimeout(() => { domObserverFired = false; }, 10000); // cooldown

          // Trigger the same flow as if inject.js posted
          handleAcceptedSubmission({
            runtime: '',
            memory: '',
            status_msg: text.includes('Problem Solved') ? 'Problem Solved Successfully' : 'Correct Answer',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// --- Main Handler ---

function handleAcceptedSubmission(submissionData) {
  chrome.storage.local.get(['autoSync'], async (result) => {
    if (result.autoSync === false) return;

    showToast('Syncing to GitHub...', 'info');

    try {
      // 1. Extract problem info
      let problem = extractProblemFromNextData() || extractProblemFromDOM();
      if (!problem || !problem.title) throw new Error('Could not extract problem data from GFG page');

      // Use slug as a pseudo question ID for folder naming  
      problem.questionId = problem.titleSlug;
      problem.source = 'GFG';

      // 2. Extract code from the editor
      const code = extractCode();
      if (!code) throw new Error('Could not extract code from editor');

      // 3. Get language
      const lang = extractLanguage();

      // 4. Build payload
      const payload = {
        action: 'SYNC_SUBMISSION',
        problem: problem,
        submission: {
          code: code,
          lang: lang,
          runtime: submissionData.runtime || '',
          memory: submissionData.memory || '',
          timestamp: submissionData.timestamp || new Date().toISOString(),
          problemUrl: window.location.href.split('?')[0]
        }
      };

      // 5. Send to background script
      chrome.runtime.sendMessage(payload, (response) => {
        dismissToast();
        if (chrome.runtime.lastError) {
          showToast(`Error: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }

        if (response && response.success) {
          showToast(`Synced to GitHub! <a href="${response.url}" target="_blank" style="color: #58a6ff; margin-left: 8px;">View</a>`, 'success');
        } else {
          showToast(`Sync failed: ${response?.error || 'Unknown error'}`, 'error');
        }
      });
    } catch (err) {
      console.error('GFG GitHub Sync Error:', err);
      dismissToast();
      showToast(err.message, 'error');
    }
  });
}

// --- Listen for messages from gfg_inject.js ---

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data.type !== 'GFG_SUBMISSION_ACCEPTED') {
    return;
  }
  handleAcceptedSubmission(event.data.data);
});
