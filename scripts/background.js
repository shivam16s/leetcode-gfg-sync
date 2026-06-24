const GITHUB_API_BASE = 'https://api.github.com';

const LANG_EXT_MAP = {
  python3: '.py', python: '.py', pythondata: '.py',
  cpp: '.cpp', c: '.c',
  java: '.java',
  javascript: '.js', typescript: '.ts', react: '.jsx',
  csharp: '.cs',
  go: '.go',
  ruby: '.rb',
  swift: '.swift',
  kotlin: '.kt',
  rust: '.rs',
  scala: '.scala',
  php: '.php',
  dart: '.dart',
  racket: '.rkt',
  erlang: '.erl',
  elixir: '.ex',
  mysql: '.sql', mssql: '.sql', oraclesql: '.sql'
};

const LANG_DISPLAY_MAP = {
  python3: 'Python', python: 'Python', pythondata: 'Pandas',
  cpp: 'C++', c: 'C',
  java: 'Java',
  javascript: 'JavaScript', typescript: 'TypeScript', react: 'React',
  csharp: 'C#',
  go: 'Go',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  rust: 'Rust',
  scala: 'Scala',
  php: 'PHP',
  dart: 'Dart',
  racket: 'Racket',
  erlang: 'Erlang',
  elixir: 'Elixir',
  mysql: 'MySQL', mssql: 'MS SQL', oraclesql: 'Oracle SQL'
};

// --- Helper Functions ---

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['githubToken', 'githubRepo', 'githubBranch'], resolve);
  });
}

function base64EncodeUnicode(str) {
  // Handle UTF-8 properly
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}

async function githubApi(endpoint, options = {}) {
  const { githubToken } = await getSettings();
  if (!githubToken) throw new Error('GitHub token not set');

  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 403 || response.status === 429) {
     const remaining = response.headers.get('x-ratelimit-remaining');
     if (remaining === '0') throw new Error('GitHub API rate limit exceeded');
  }

  if (response.status === 204) return null; // No content

  if (!response.ok) {
    let message = `GitHub API Error ${response.status}`;
    try {
      const errData = await response.json();
      message = errData.message || message;
    } catch(e) {}
    throw new Error(message);
  }

  return response.json();
}

async function validateToken(token) {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    if (!res.ok) return { valid: false };
    const data = await res.json();
    return { valid: true, username: data.login };
  } catch (err) {
    return { valid: false };
  }
}

// --- GitHub Operations ---

async function checkAndCreateRepo(owner, repoName) {
  try {
    const repoInfo = await githubApi(`/repos/${owner}/${repoName}`);
    return repoInfo.default_branch;
  } catch (err) {
    if (err.message.includes('404')) {
      // Create repo
      const newRepo = await githubApi(`/user/repos`, {
        method: 'POST',
        body: JSON.stringify({
          name: repoName,
          description: 'LeetCode solutions auto-synced by LeetCode GitHub Sync Chrome Extension',
          private: true,
          auto_init: true // set to true so we have a branch
        })
      });
      return newRepo.default_branch;
    }
    throw err;
  }
}

async function getFileSha(owner, repoName, path, branch) {
  try {
    const data = await githubApi(`/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${branch}`);
    return data.sha;
  } catch (err) {
    return null; // File doesn't exist
  }
}

async function pushFile(owner, repoName, path, branch, content, commitMessage) {
  const sha = await getFileSha(owner, repoName, path, branch);
  
  const body = {
    message: commitMessage,
    content: base64EncodeUnicode(content),
    branch: branch
  };
  
  if (sha) {
    body.sha = sha;
  }

  const res = await githubApi(`/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  
  return res.content.html_url;
}

// --- Content Generators ---

function generateProblemReadme(problem, submission, codeHtmlUrl) {
  const diffColor = problem.difficulty === 'Easy' ? 'brightgreen' : (problem.difficulty === 'Medium' ? 'orange' : 'red');
  const langDisplay = LANG_DISPLAY_MAP[submission.lang.name] || submission.lang.name;
  const tags = problem.topicTags.map(t => `\`${t.name}\``).join(' ');
  const ts = parseInt(submission.timestamp);
  const dateStr = isNaN(ts) ? submission.timestamp : new Date(ts * 1000).toUTCString();
  
  return `# [${problem.questionId}. ${problem.title}](${submission.problemUrl})

![Difficulty](https://img.shields.io/badge/Difficulty-${problem.difficulty}-${diffColor})
![Language](https://img.shields.io/badge/Language-${encodeURIComponent(langDisplay).replace(/-/g, '--')}-blue)

## Tags
${tags || 'None'}

## Stats
| Metric | Value |
|--------|-------|
| Runtime | ${submission.runtime || 'N/A'} |
| Runtime Beats | ${submission.runtimePercentile || submission.runtime_percentile || 'N/A'}% |
| Memory | ${submission.memory || 'N/A'} |
| Memory Beats | ${submission.memoryPercentile || submission.memory_percentile || 'N/A'}% |
| Timestamp | ${dateStr} |

## Problem Description
${problem.content}

## Solution
[View Code](${codeHtmlUrl})
`;
}

// --- Main Sync Logic ---

async function handleSubmissionSync(problem, submission) {
  const { githubToken, githubRepo, githubBranch } = await getSettings();
  if (!githubToken || !githubRepo) throw new Error('GitHub settings missing');

  const { valid, username } = await validateToken(githubToken);
  if (!valid) throw new Error('Invalid GitHub token');

  const owner = username;
  const repoName = githubRepo.split('/').pop();

  let branch = githubBranch;
  if (!branch) {
    branch = await checkAndCreateRepo(owner, repoName);
    await new Promise(r => chrome.storage.local.set({ githubBranch: branch }, r));
  } else {
    await checkAndCreateRepo(owner, repoName);
  }

  const problemNumberStr = String(problem.questionId).padStart(4, '0');
  const folderPath = `${problem.difficulty}/${problemNumberStr}-${problem.titleSlug}`;
  
  const ext = LANG_EXT_MAP[submission.lang.name] || '.txt';
  const solutionFileName = `solution${ext}`;
  const solutionPath = `${folderPath}/${solutionFileName}`;
  const readmePath = `${folderPath}/README.md`;

  const langDisplay = LANG_DISPLAY_MAP[submission.lang.name] || submission.lang.name;
  
  const rBeats = submission.runtimePercentile || submission.runtime_percentile || '';
  const statsString = `Runtime ${submission.runtime}, Beats ${rBeats}%`.trim();
  const commitMsg = `Sync: ${problemNumberStr}-${problem.titleSlug} (${langDisplay}) - ${statsString}`;

  const codeHtmlUrl = await pushFile(owner, repoName, solutionPath, branch, submission.code, commitMsg);

  const readmeContent = generateProblemReadme(problem, submission, codeHtmlUrl.split('/').pop());
  await pushFile(owner, repoName, readmePath, branch, readmeContent, `Docs: Update README for ${problemNumberStr}-${problem.titleSlug}`);

  await addToHistory({
    problemId: problem.questionId,
    title: problem.title,
    difficulty: problem.difficulty,
    lang: langDisplay,
    timestamp: Date.now(),
    url: codeHtmlUrl,
    status: 'success'
  });

  return { success: true, url: codeHtmlUrl };
}

async function addToHistory(entry) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['syncHistory'], (result) => {
      let history = result.syncHistory || [];
      history.unshift(entry);
      if (history.length > 50) history = history.slice(0, 50);
      chrome.storage.local.set({ syncHistory: history }, resolve);
    });
  });
}

async function addToFailedQueue(payload) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['failedQueue'], (result) => {
      let queue = result.failedQueue || [];
      queue.push({
        payload,
        attempts: 1,
        timestamp: Date.now()
      });
      chrome.storage.local.set({ failedQueue: queue }, resolve);
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'VALIDATE_TOKEN') {
    validateToken(request.token).then(sendResponse);
    return true; 
  }
  
  if (request.action === 'SYNC_SUBMISSION') {
    handleSubmissionSync(request.problem, request.submission)
      .then(sendResponse)
      .catch((err) => {
        console.error('Background Sync Error:', err);
        addToFailedQueue(request);
        sendResponse({ success: false, error: err.message });
      });
    return true; 
  }
  
  if (request.action === 'RETRY_FAILED') {
    processFailedQueue();
    sendResponse({ success: true });
    return true;
  }
});

// --- Retry Logic & Alarms ---

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('RETRY_FAILED_SUBMISSIONS', { periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'RETRY_FAILED_SUBMISSIONS') {
    processFailedQueue();
  }
});

async function processFailedQueue() {
  chrome.storage.local.get(['failedQueue'], async (result) => {
    let queue = result.failedQueue || [];
    if (queue.length === 0) return;

    const now = Date.now();
    const newQueue = [];

    for (let item of queue) {
      // Exponential backoff: 5m, 10m, 20m, 40m, max 1hr
      const delay = Math.min((5 * 60 * 1000) * Math.pow(2, item.attempts - 1), 60 * 60 * 1000);
      
      if (now - item.timestamp > delay) {
        try {
          await handleSubmissionSync(item.payload.problem, item.payload.submission);
        } catch (err) {
          console.error('Retry failed:', err);
          item.attempts += 1;
          item.timestamp = now;
          newQueue.push(item);
        }
      } else {
        newQueue.push(item);
      }
    }

    chrome.storage.local.set({ failedQueue: newQueue });
  });
}
