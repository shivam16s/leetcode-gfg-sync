// Inject inject.js into the main world to access XHR/fetch
const script = document.createElement('script');
script.src = chrome.runtime.getURL('scripts/inject.js');
script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

// GraphQL queries
const QUESTION_DATA_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      topicTags { name slug }
      content
    }
  }
`;

const SUBMISSION_DETAILS_QUERY = `
  query submissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) {
      code
      timestamp
      statusDisplay
      lang { name verboseName }
      runtime
      runtimePercentile
      memory
      memoryPercentile
    }
  }
`;

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

async function fetchGraphQL(query, variables, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'x-csrftoken': getCsrfToken()
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      
      return data.data;
    } catch (err) {
      console.error(`GraphQL attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
    }
  }
}

function showToast(message, type = 'success') {
  // Simple toast UI implementation
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

  // Auto hide after 5 seconds
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

// Listen for messages from inject.js
window.addEventListener('message', async (event) => {
  if (event.source !== window || event.data.type !== 'LEETCODE_SUBMISSION_ACCEPTED') {
    return;
  }

  const submissionData = event.data.data;
  
  // Check autoSync toggle
  chrome.storage.local.get(['autoSync'], async (result) => {
    // Default to true if not explicitly false
    if (result.autoSync === false) return; 

    showToast('Syncing to GitHub...', 'info');

    try {
      // 1. Extract problem slug from URL
      const match = window.location.pathname.match(/\/problems\/([^/]+)/);
      if (!match) throw new Error('Could not determine problem slug from URL');
      const titleSlug = match[1];

      // 2. Fetch full problem data
      const questionData = await fetchGraphQL(QUESTION_DATA_QUERY, { titleSlug });
      if (!questionData || !questionData.question) throw new Error('Failed to fetch problem data');

      // 3. Fetch full submission code
      const detailsData = await fetchGraphQL(SUBMISSION_DETAILS_QUERY, { submissionId: parseInt(submissionData.submission_id) });
      if (!detailsData || !detailsData.submissionDetails) throw new Error('Failed to fetch submission details');

      // 4. Combine data
      const payload = {
        action: 'SYNC_SUBMISSION',
        problem: questionData.question,
        submission: {
          ...detailsData.submissionDetails,
          ...submissionData, // fallback to check endpoint data if needed
          problemUrl: window.location.href.split('/submissions')[0]
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
      console.error('LeetCode GitHub Sync Error:', err);
      dismissToast();
      showToast(err.message, 'error');
    }
  });
});
