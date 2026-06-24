# 🗺️ Task Tracker

## Phase 1: Foundation
- [x] Set up `manifest.json` (Manifest V3, permissions, content scripts)
- [x] Create extension icons (16, 48, 128px)
- [x] Set up project folder structure

## Phase 2: LeetCode Submission Capture
- [x] Build `scripts/inject.js` — intercept fetch/XHR for submission check responses
- [x] Build `scripts/content.js` — receive messages, fetch GraphQL data
- [x] Implement LeetCode GraphQL queries (questionData + submissionDetails)
- [x] Add deduplication logic (submission ID tracking)
- [x] Add auto-sync toggle check

## Phase 3: GitHub Integration
- [x] Build `scripts/background.js` — service worker
- [x] Implement GitHub token validation (`GET /user`)
- [x] Implement auto-create repo (`GET /repos` → `POST /user/repos`)
- [x] Implement auto-detect default branch
- [x] Implement solution file push (`GET` SHA → `PUT` with base64)
- [x] Implement problem README generation (badges, stats, description)
- [x] Implement root README index table
- [x] Add language → file extension mapping (18+ languages)
- [x] Add commit message formatting

## Phase 4: Robustness & Error Handling
- [x] Implement offline queue (`chrome.storage.local` → `failedQueue`)
- [x] Implement retry via `chrome.alarms` with exponential backoff
- [x] Add GitHub rate limit awareness (`X-RateLimit-Remaining`)
- [x] Add duplicate submission prevention
- [x] Add graceful error handling for all API calls

## Phase 5: Popup UI
- [x] Build `popup/popup.html` — 3-tab layout (Dashboard, History, Settings)
- [x] Build `popup/popup.css` — dark glassmorphism theme
- [x] Build `popup/popup.js` — tab switching, settings, history, stats
- [x] Implement Dashboard tab (counters, progress rings, streak)
- [x] Implement History tab (list, filters, retry button)
- [x] Implement Settings tab (token, repo, branch, toggle, test connection)
- [x] Add `chrome.storage.onChanged` listener for live updates

## Phase 6: Toast Notifications
- [x] Build `styles/toast.css` — slide-in animation, auto-dismiss
- [x] Implement toast injection in content.js (success/failure/retry)
- [x] Add progress bar countdown
- [x] Add GitHub link in success toast

## Phase 7: Polish & Testing
- [ ] Test with multiple languages (Python, C++, Java, JS, Go, Rust)
- [ ] Test offline → online retry flow
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
