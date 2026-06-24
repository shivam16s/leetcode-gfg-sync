document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabs = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // Settings Logic
  const tokenInput = document.getElementById('github-token');
  const repoInput = document.getElementById('github-repo');
  const branchInput = document.getElementById('github-branch');
  const autoSyncToggle = document.getElementById('auto-sync');
  const testBtn = document.getElementById('test-connection');
  const statusMsg = document.getElementById('connection-status');
  const toggleTokenBtn = document.getElementById('toggle-token');

  // Load settings
  chrome.storage.local.get(['githubToken', 'githubRepo', 'githubBranch', 'autoSync'], (data) => {
    if (data.githubToken) tokenInput.value = data.githubToken;
    if (data.githubRepo) repoInput.value = data.githubRepo;
    if (data.githubBranch) branchInput.value = data.githubBranch;
    if (data.autoSync !== undefined) autoSyncToggle.checked = data.autoSync;
  });

  // Toggle token visibility
  toggleTokenBtn.addEventListener('click', () => {
    if (tokenInput.type === 'password') {
      tokenInput.type = 'text';
      toggleTokenBtn.textContent = '🙈';
    } else {
      tokenInput.type = 'password';
      toggleTokenBtn.textContent = '👁️';
    }
  });

  // Save settings & Test Connection
  testBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    const repo = repoInput.value.trim();
    const branch = branchInput.value.trim();
    const autoSync = autoSyncToggle.checked;

    statusMsg.textContent = 'Testing connection...';
    statusMsg.className = 'status-msg';

    chrome.storage.local.set({
      githubToken: token,
      githubRepo: repo,
      githubBranch: branch,
      autoSync: autoSync
    }, () => {
      chrome.runtime.sendMessage({ action: 'VALIDATE_TOKEN', token }, (res) => {
        if (res && res.valid) {
          statusMsg.textContent = `Connected as ${res.username} ✅`;
          statusMsg.className = 'status-msg status-success';
        } else {
          statusMsg.textContent = 'Invalid token or connection failed ❌';
          statusMsg.className = 'status-msg status-error';
        }
      });
    });
  });

  autoSyncToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoSync: autoSyncToggle.checked });
  });

  // Load Data
  function loadData() {
    chrome.storage.local.get(['syncHistory', 'failedQueue'], (data) => {
      const history = data.syncHistory || [];
      const failed = data.failedQueue || [];
      
      updateDashboard(history);
      renderHistory(history, failed);
    });
  }

  function updateDashboard(history) {
    document.getElementById('total-synced').textContent = history.length;
    
    const today = new Date().toDateString();
    const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === today).length;
    document.getElementById('today-synced').textContent = todayCount;

    let e = 0, m = 0, h = 0;
    history.forEach(item => {
      if (item.difficulty === 'Easy') e++;
      else if (item.difficulty === 'Medium') m++;
      else if (item.difficulty === 'Hard') h++;
    });

    const total = Math.max(1, history.length); // prevent div by zero
    document.getElementById('count-easy').textContent = e;
    document.getElementById('ring-easy').style.background = `conic-gradient(#00b8a3 ${(e/total)*100}%, #30363d 0)`;
    
    document.getElementById('count-medium').textContent = m;
    document.getElementById('ring-medium').style.background = `conic-gradient(#ffc01e ${(m/total)*100}%, #30363d 0)`;
    
    document.getElementById('count-hard').textContent = h;
    document.getElementById('ring-hard').style.background = `conic-gradient(#ff375f ${(h/total)*100}%, #30363d 0)`;

    const latestContainer = document.getElementById('latest-sync');
    if (history.length > 0) {
      const latest = history[0];
      latestContainer.innerHTML = `
        <a href="${latest.url}" target="_blank" class="history-item" style="margin: 0;">
          <div class="hi-main">
            <span class="hi-title">${latest.title}</span>
            <span class="hi-meta">
              <span class="badge badge-${latest.difficulty}">${latest.difficulty}</span>
              ${latest.lang}
            </span>
          </div>
          <span style="font-size: 16px;">↗️</span>
        </a>
      `;
      latestContainer.classList.remove('empty-state');
      latestContainer.style.padding = '0';
      latestContainer.style.background = 'none';
      latestContainer.style.border = 'none';
    } else {
      latestContainer.innerHTML = 'No submissions yet';
      latestContainer.classList.add('empty-state');
    }
  }

  function renderHistory(history, failed) {
    const list = document.getElementById('history-list');
    const failedList = document.getElementById('failed-list');
    const filter = document.getElementById('history-filter').value;
    
    list.innerHTML = '';
    failedList.innerHTML = '';

    // Render Failed Queue
    if (failed.length > 0) {
      failed.forEach((item, index) => {
        const prob = item.payload.problem;
        if (filter !== 'All' && prob.difficulty !== filter) return;

        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div class="hi-main">
            <span class="hi-title">${prob.title} (Failed)</span>
            <span class="hi-meta">
              <span class="badge badge-Failed">Error</span>
              Attempts: ${item.attempts}
            </span>
          </div>
          <button class="btn btn-secondary retry-btn" data-index="${index}">Retry</button>
        `;
        failedList.appendChild(div);
      });

      document.querySelectorAll('.retry-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const originalText = e.target.textContent;
          e.target.textContent = '...';
          chrome.runtime.sendMessage({ action: 'RETRY_FAILED' }, () => {
             setTimeout(loadData, 1000); // Reload data after a bit
          });
        });
      });
    }

    // Render Sync History
    history.forEach(item => {
      if (filter !== 'All' && item.difficulty !== filter) return;

      const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.className = 'history-item';
      a.innerHTML = `
        <div class="hi-main">
          <span class="hi-title">${item.title}</span>
          <span class="hi-meta">
            <span class="badge badge-${item.difficulty}">${item.difficulty}</span>
            ${item.lang} • ${dateStr}
          </span>
        </div>
        <span style="font-size: 14px; color: #8b949e;">↗️</span>
      `;
      list.appendChild(a);
    });

    if (history.length === 0 && failed.length === 0) {
      list.innerHTML = '<div class="empty-state">No history found</div>';
    }
  }

  document.getElementById('history-filter').addEventListener('change', loadData);

  document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm('Clear all sync history? This will not delete files on GitHub.')) {
      chrome.storage.local.set({ syncHistory: [], failedQueue: [] }, loadData);
    }
  });

  // Initial load
  loadData();

  // Sync Past Submissions Logic
  const syncPastBtn = document.getElementById('sync-past-btn');
  const syncProgressContainer = document.getElementById('sync-past-progress');
  const syncStatus = document.getElementById('sync-past-status');
  const syncCount = document.getElementById('sync-past-count');
  const syncBar = document.getElementById('sync-past-bar');

  syncPastBtn.addEventListener('click', () => {
    if (confirm('This will fetch all your accepted LeetCode submissions and sync them to GitHub. This may take a few minutes to respect rate limits. Continue?')) {
      chrome.runtime.sendMessage({ action: 'SYNC_ALL_PAST' });
      syncPastBtn.disabled = true;
      syncProgressContainer.style.display = 'block';
    }
  });

  function updateSyncProgress(prog) {
    if (!prog) return;
    
    syncProgressContainer.style.display = 'block';
    syncStatus.textContent = prog.status;
    
    if (prog.total > 0) {
      syncCount.textContent = `${prog.current}/${prog.total}`;
      syncBar.style.width = `${(prog.current / prog.total) * 100}%`;
    } else {
      syncCount.textContent = '';
      syncBar.style.width = '0%';
    }
    
    if (prog.status === 'Complete!' || prog.status.startsWith('Error')) {
      syncPastBtn.disabled = false;
      setTimeout(() => {
        syncProgressContainer.style.display = 'none';
        chrome.storage.local.remove('syncProgress');
      }, 5000);
    } else {
      syncPastBtn.disabled = true;
    }
  }

  chrome.storage.local.get(['syncProgress'], (res) => {
    if (res.syncProgress) updateSyncProgress(res.syncProgress);
  });

  // Listen for background updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.syncHistory || changes.failedQueue) {
      loadData();
    }
    if (changes.syncProgress) {
      updateSyncProgress(changes.syncProgress.newValue);
    }
  });
});
