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

  if (response.status === 204) return null;

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
      const newRepo = await githubApi(`/user/repos`, {
        method: 'POST',
        body: JSON.stringify({
          name: repoName,
          description: 'LeetCode & GFG solutions auto-synced by GitHub Sync Chrome Extension',
          private: true,
          auto_init: true
        })
      });
      return newRepo.default_branch;
    }
    throw err;
  }
}

async function getFolderContents(owner, repoName, path, branch) {
  try {
    return await githubApi(`/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${branch}`);
  } catch (err) {
    return [];
  }
}

async function getFileSha(owner, repoName, path, branch) {
  try {
    const data = await githubApi(`/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${branch}`);
    return data.sha;
  } catch (err) {
    return null;
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

function generateProblemReadme(problem, submission, solutions) {
  const diffColor = problem.difficulty === 'Easy' ? 'brightgreen' : (problem.difficulty === 'Medium' ? 'orange' : 'red');
  const tags = (problem.topicTags || []).map(t => `\`${t.name}\``).join(' ');
  const ts = parseInt(submission.timestamp);
  const dateStr = isNaN(ts) ? (submission.timestamp || 'N/A') : new Date(ts * 1000).toUTCString();
  const source = problem.source || 'LeetCode';
  const problemLabel = source === 'GFG' ? problem.title : `${problem.questionId}. ${problem.title}`;

  
  let solutionsList = '';
  solutions.forEach(s => {
    solutionsList += `- [${s.langDisplay}](${s.fileName})\n`;
  });

  return `# [${problemLabel}](${submission.problemUrl})

![Source](https://img.shields.io/badge/Source-${source}-blue)
![Difficulty](https://img.shields.io/badge/Difficulty-${problem.difficulty}-${diffColor})

## Tags
${tags || 'None'}

## Stats (Latest Submission)
| Metric | Value |
|--------|-------|
| Runtime | ${submission.runtime || 'N/A'} |
| Runtime Beats | ${submission.runtimePercentile || submission.runtime_percentile || 'N/A'}% |
| Memory | ${submission.memory || 'N/A'} |
| Memory Beats | ${submission.memoryPercentile || submission.memory_percentile || 'N/A'}% |
| Timestamp | ${dateStr} |

## Problem Description
${problem.content}

## Solutions
${solutionsList}
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

  // Build folder path: GFG uses slug, LeetCode uses padded numeric ID
  const isGfg = problem.source === 'GFG';
  let folderPath;
  if (isGfg) {
    folderPath = `GFG/${problem.difficulty}/${problem.titleSlug}`;
  } else {
    const problemNumberStr = String(problem.questionId).padStart(4, '0');
    folderPath = `LeetCode/${problem.difficulty}/${problemNumberStr}-${problem.titleSlug}`;
  }
  
  const langName = typeof submission.lang === 'string' ? submission.lang : (submission.lang?.name || 'unknown');
  const ext = LANG_EXT_MAP[langName] || '.txt';
  const solutionFileName = `solution${ext}`;
  const solutionPath = `${folderPath}/${solutionFileName}`;
  const readmePath = `${folderPath}/README.md`;

  const langDisplay = LANG_DISPLAY_MAP[langName] || langName;
  
  const rBeats = submission.runtimePercentile || submission.runtime_percentile || '';
  const source = isGfg ? 'GFG' : 'LC';
  const statsString = submission.runtime ? `Runtime ${submission.runtime}` : '';
  const commitMsg = `[${source}] Sync: ${problem.titleSlug} (${langDisplay}) ${statsString}`.trim();

  const codeHtmlUrl = await pushFile(owner, repoName, solutionPath, branch, submission.code, commitMsg);

  // Multi-Language README Logic
  const folderContents = await getFolderContents(owner, repoName, folderPath, branch);
  const solutions = [];
  let foundCurrent = false;
  
  if (Array.isArray(folderContents)) {
    folderContents.forEach(file => {
      if (file.name.startsWith('solution')) {
        const fExt = file.name.substring(file.name.lastIndexOf('.'));
        let dName = Object.keys(LANG_EXT_MAP).find(k => LANG_EXT_MAP[k] === fExt) || fExt;
        dName = LANG_DISPLAY_MAP[dName] || dName;
        solutions.push({ langDisplay: dName, fileName: file.name });
        if (file.name === solutionFileName) foundCurrent = true;
      }
    });
  }

  if (!foundCurrent) {
    solutions.push({ langDisplay, fileName: solutionFileName });
  }

  const readmeContent = generateProblemReadme(problem, submission, solutions);
  await pushFile(owner, repoName, readmePath, branch, readmeContent, `Docs: Update README for ${problem.titleSlug}`);

  await addToHistory({
    problemId: problem.questionId || problem.titleSlug,
    title: problem.title,
    difficulty: problem.difficulty,
    lang: langDisplay,
    source: isGfg ? 'GFG' : 'LeetCode',
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

// --- Sync Past Submissions Logic ---

let isSyncingPast = false;

async function startSyncPastSubmissions() {
  if (isSyncingPast) return;
  isSyncingPast = true;
  
  try {
    chrome.storage.local.set({ syncProgress: { current: 0, total: 0, status: 'Fetching history from LeetCode...' }});
    
    const allAccepted = await fetchAllAcceptedSubmissions();
    chrome.storage.local.set({ syncProgress: { current: 0, total: allAccepted.length, status: 'Syncing to GitHub...' }});
    
    for (let i = 0; i < allAccepted.length; i++) {
      if (!isSyncingPast) break; 
      const sub = allAccepted[i];
      
      try {
        chrome.storage.local.set({ syncProgress: { current: i, total: allAccepted.length, status: `Syncing ${sub.title_slug}...` }});
        await processSinglePastSubmission(sub);
      } catch (err) {
        console.error(`Failed to sync past submission ${sub.id}:`, err);
      }
      
      chrome.storage.local.set({ syncProgress: { current: i + 1, total: allAccepted.length, status: `Finished ${sub.title_slug}` }});
      await new Promise(r => setTimeout(r, 2500)); // 2.5s delay to avoid bans
    }
    
    chrome.storage.local.set({ syncProgress: { current: allAccepted.length, total: allAccepted.length, status: 'Complete!' }});
  } catch (err) {
    console.error('Past sync error:', err);
    chrome.storage.local.set({ syncProgress: { status: `Error: ${err.message}` }});
  } finally {
    isSyncingPast = false;
  }
}

async function fetchAllAcceptedSubmissions() {
  const accepted = new Map();
  let offset = 0;
  const limit = 20;
  let hasNext = true;
  
  while (hasNext) {
    const res = await fetch(`https://leetcode.com/api/submissions/?offset=${offset}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch LeetCode submissions (Are you logged in?)');
    const data = await res.json();
    
    if (!data.submissions_dump || data.submissions_dump.length === 0) break;
    
    for (const sub of data.submissions_dump) {
      if (sub.status_display === 'Accepted') {
        const key = `${sub.title_slug}_${sub.lang}`;
        if (!accepted.has(key)) {
          accepted.set(key, sub);
        }
      }
    }
    
    hasNext = data.has_next;
    offset += limit;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return Array.from(accepted.values());
}

async function fetchLeetCodeGraphQL(query, variables) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error('GraphQL fetch failed');
  return res.json();
}

async function processSinglePastSubmission(subInfo) {
  const questionData = await fetchLeetCodeGraphQL(`
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId title titleSlug difficulty
        topicTags { name slug } content
      }
    }`, { titleSlug: subInfo.title_slug });
    
  if (!questionData || !questionData.data.question) throw new Error('Failed to fetch problem data');

  const detailsData = await fetchLeetCodeGraphQL(`
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        code timestamp statusDisplay runtime runtimePercentile memory memoryPercentile
        lang { name verboseName }
      }
    }`, { submissionId: subInfo.id });

  if (!detailsData || !detailsData.data.submissionDetails) throw new Error('Failed to fetch submission details');

  const submission = {
    ...detailsData.data.submissionDetails,
    ...subInfo, 
    problemUrl: `https://leetcode.com/problems/${subInfo.title_slug}`
  };

  await handleSubmissionSync(questionData.data.question, submission);
}

// --- Message Listener ---

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
  
  if (request.action === 'SYNC_ALL_PAST') {
    startSyncPastSubmissions();
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
