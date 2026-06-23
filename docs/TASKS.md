# ðŸ—ºï¸ Task Tracker

## Phase 1: Foundation
- [ ] Set up `manifest.json` (Manifest V3, permissions, content scripts)
- [ ] Create extension icons (16, 48, 128px)
- [ ] Set up project folder structure

## Phase 2: LeetCode Submission Capture
- [ ] Build `scripts/inject.js` â€” intercept fetch/XHR for submission check responses
- [ ] Build `scripts/content.js` â€” receive messages, fetch GraphQL data
- [ ] Implement LeetCode GraphQL queries (questionData + submissionDetails)
- [ ] Add deduplication logic (submission ID tracking)
- [ ] Add auto-sync toggle check

## Phase 3: GitHub Integration
- [ ] Build `scripts/background.js` â€” service worker
- [ ] Implement GitHub token validation (`GET /user`)
- [ ] Implement auto-create repo (`GET /repos` â†’ `POST /user/repos`)
- [ ] Implement auto-detect default branch
- [ ] Implement solution file push (`GET` SHA â†’ `PUT` with base64)
- [ ] Implement problem README generation (badges, stats, description)
- [ ] Implement root README index table
- [ ] Add language â†’ file extension mapping (18+ languages)
- [ ] Add commit message formatting

## Phase 4: Robustness & Error Handling
- [ ] Implement offline queue (`chrome.storage.local` â†’ `failedQueue`)
- [ ] Implement retry via `chrome.alarms` with exponential backoff
- [ ] Add GitHub rate limit awareness (`X-RateLimit-Remaining`)
- [ ] Add duplicate submission prevention
- [ ] Add graceful error handling for all API calls

## Phase 5: Popup UI
- [ ] Build `popup/popup.html` â€” 3-tab layout (Dashboard, History, Settings)
- [ ] Build `popup/popup.css` â€” dark glassmorphism theme
- [ ] Build `popup/popup.js` â€” tab switching, settings, history, stats
- [ ] Implement Dashboard tab (counters, progress rings, streak)
- [ ] Implement History tab (list, filters, retry button)
- [ ] Implement Settings tab (token, repo, branch, toggle, test connection)
- [ ] Add `chrome.storage.onChanged` listener for live updates

## Phase 6: Toast Notifications
- [ ] Build `styles/toast.css` â€” slide-in animation, auto-dismiss
- [ ] Implement toast injection in content.js (success/failure/retry)
- [ ] Add progress bar countdown
- [ ] Add GitHub link in success toast

## Phase 7: Polish & Testing
- [ ] Test with multiple languages (Python, C++, Java, JS, Go, Rust)
- [ ] Test offline â†’ online retry flow
- [ ] Test repo auto-creation flow
- [ ] Test duplicate submission handling
- [ ] Test same problem / different language flow
- [ ] Performance check (no LeetCode page lag)
- [ ] Extension badge counter implementation
- [ ] Final UI polish and animations

## Phase 8: Release
- [ ] Write Chrome Web Store description
- [ ] Create promotional screenshots
- [ ] Submit to Chrome Web Store (optional)
