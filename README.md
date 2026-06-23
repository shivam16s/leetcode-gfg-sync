# ðŸš€ LeetCode â†’ GitHub Sync | Chrome Extension

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-FF6D00?style=for-the-badge)
![GitHub API](https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github&logoColor=white)
![LeetCode](https://img.shields.io/badge/LeetCode-Sync-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)

**Automatically capture your accepted LeetCode submissions and push them to a GitHub repository â€” with full metadata, organized by difficulty.**

[Features](#-features) â€¢ [Architecture](#-architecture) â€¢ [Installation](#-installation) â€¢ [How It Works](#-how-it-works) â€¢ [Tech Stack](#-tech-stack)

</div>

---

## ðŸ“‹ Problem Statement

Competitive programmers and interview preppers solve hundreds of LeetCode problems, but:
- âŒ Solutions are **trapped** inside LeetCode's platform
- âŒ No easy way to **showcase** your work on GitHub
- âŒ Manually copying code + creating files is **tedious**
- âŒ You lose **context** â€” runtime stats, problem descriptions, difficulty tags

## ðŸ’¡ Solution

A Chrome extension that **automatically detects** when you submit an accepted solution on LeetCode and **pushes it to your GitHub repo** with:
- Full source code in the correct file format
- Auto-generated README with problem details, stats, and badges
- Organized folder structure by difficulty level
- Zero manual effort â€” just solve and submit!

---

## âœ¨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| ðŸ”„ **Auto-Sync** | Detects accepted submissions in real-time â€” no clicking needed |
| ðŸ“ **Smart Organization** | Files organized as `Easy/0001-Two-Sum/solution.py` |
| ðŸ“ **Rich READMEs** | Auto-generated with difficulty badges, tags, stats, problem description |
| ðŸŒ **18+ Languages** | Python, C++, Java, JavaScript, Go, Rust, TypeScript, and more |
| ðŸ”€ **Multi-Language** | Submit same problem in different languages â€” all solutions kept |
| ðŸ“Š **Full Metadata** | Runtime, memory, percentile beats, timestamps, problem links |

### Robustness Features
| Feature | Description |
|---------|-------------|
| ðŸ“¡ **Offline Queue** | Failed pushes are queued and auto-retried when back online |
| ðŸ” **Exponential Backoff** | Smart retry with increasing delays (5min â†’ 10min â†’ 20min) |
| ðŸ—ï¸ **Auto-Create Repo** | Creates the GitHub repo automatically if it doesn't exist |
| ðŸ›¡ï¸ **Duplicate Prevention** | Tracks submission IDs â€” never syncs the same submission twice |
| ðŸ” **Auto-Detect Branch** | Works with `main`, `master`, or any custom default branch |
| âš¡ **Rate Limit Aware** | Monitors GitHub API limits and delays requests when needed |

### UI Features
| Feature | Description |
|---------|-------------|
| ðŸŽ¨ **Premium Dark Theme** | Glassmorphism popup with smooth animations |
| ðŸ“Š **Dashboard** | Total syncs, difficulty breakdown, streak counter |
| ðŸ“œ **History Log** | Last 50 synced submissions with filters |
| ðŸ”” **Toast Notifications** | In-page success/failure alerts on LeetCode |
| ðŸ·ï¸ **Badge Counter** | Extension icon shows today's sync count |
| âš™ï¸ **Settings Panel** | GitHub token, repo name, auto-sync toggle |

---

## ðŸ—ï¸ Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     Chrome Extension (Manifest V3)           â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Popup UI    â”‚   â”‚ Content Script â”‚   â”‚  Background   â”‚ â”‚
â”‚  â”‚              â”‚   â”‚                â”‚   â”‚  Service      â”‚ â”‚
â”‚  â”‚ â€¢ Dashboard  â”‚   â”‚ â€¢ inject.js    â”‚   â”‚  Worker       â”‚ â”‚
â”‚  â”‚ â€¢ History    â”‚â—„â”€â–ºâ”‚   (main world) â”‚â”€â”€â–ºâ”‚               â”‚ â”‚
â”‚  â”‚ â€¢ Settings   â”‚   â”‚ â€¢ content.js   â”‚   â”‚ â€¢ GitHub API  â”‚ â”‚
â”‚  â”‚              â”‚   â”‚   (isolated)   â”‚   â”‚ â€¢ Offline Q   â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚ â€¢ Retry Logic â”‚ â”‚
â”‚                                           â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                   â”‚         â”‚
â”‚                                             â”Œâ”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚                                             â”‚ GitHub API â”‚  â”‚
â”‚                                             â”‚ (REST v3)  â”‚  â”‚
â”‚                                             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Submission Capture Flow

```
User clicks "Submit" on LeetCode
        â”‚
        â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ POST /problems/{slug}/submit â”‚ â”€â”€â†’ Returns submission_id
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ GET /submissions/detail/{id}/check â”‚ â”€â”€â†’ LeetCode polls until done
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
        inject.js intercepts response
               â”‚
               â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ status_msg =        â”‚â”€â”€â†’ "Wrong Answer" â†’ Ignore
    â”‚ "Accepted"?         â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â”‚ YES
              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ content.js fetches full data  â”‚
â”‚ via LeetCode GraphQL API      â”‚
â”‚ â€¢ Problem: title, difficulty  â”‚
â”‚ â€¢ Code: full source           â”‚
â”‚ â€¢ Stats: runtime, memory      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ background.js pushes to       â”‚
â”‚ GitHub via REST API            â”‚
â”‚ â€¢ Solution file               â”‚
â”‚ â€¢ Problem README.md           â”‚
â”‚ â€¢ Root index README.md        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“‚ Repository Structure Created on GitHub

```
leetcode-solutions/
â”œâ”€â”€ README.md                              â† Auto-generated index table
â”œâ”€â”€ Easy/
â”‚   â”œâ”€â”€ 0001-Two-Sum/
â”‚   â”‚   â”œâ”€â”€ README.md                      â† Problem details + stats
â”‚   â”‚   â””â”€â”€ solution.py                    â† Your solution
â”‚   â””â”€â”€ 0070-Climbing-Stairs/
â”‚       â”œâ”€â”€ README.md
â”‚       â””â”€â”€ solution.java
â”œâ”€â”€ Medium/
â”‚   â”œâ”€â”€ 0015-3Sum/
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ solution.cpp                   â† Multiple languages supported
â”‚   â”‚   â””â”€â”€ solution.py
â”‚   â””â”€â”€ 0200-Number-of-Islands/
â”‚       â”œâ”€â”€ README.md
â”‚       â””â”€â”€ solution.go
â””â”€â”€ Hard/
    â””â”€â”€ 0004-Median-of-Two-Sorted-Arrays/
        â”œâ”€â”€ README.md
        â””â”€â”€ solution.java
```

### Sample Problem README

```markdown
# [1. Two Sum](https://leetcode.com/problems/two-sum/)

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-brightgreen)
![Language](https://img.shields.io/badge/Language-Python-blue)

## Tags
`Array` `Hash Table`

## Stats
| Metric | Value |
|--------|-------|
| Runtime | 4 ms |
| Beats | 95.2% |
| Memory | 17.5 MB |
| Memory Beats | 82.1% |
| Submitted | 2026-06-23 12:30 UTC |

## Solution
â€â€â€python
class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i
â€â€â€
```

---

## ðŸ› ï¸ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Extension** | Chrome Manifest V3 |
| **Language** | Vanilla JavaScript (ES6+) |
| **Styling** | CSS3 (Glassmorphism, Animations) |
| **LeetCode Data** | GraphQL API (unofficial, session-based) |
| **GitHub Push** | GitHub REST API v3 (Contents API) |
| **Storage** | `chrome.storage.local` |
| **Retry** | `chrome.alarms` API |

---

## ðŸ“¦ Installation

### Developer Mode (Local)
1. Clone this repository
   ```bash
   git clone https://github.com/shivam16s/leetcode-github-sync.git
   ```
2. Open Chrome â†’ `chrome://extensions/`
3. Enable **Developer Mode** (top-right toggle)
4. Click **"Load unpacked"** â†’ select the cloned folder
5. Click the extension icon â†’ go to **Settings** tab
6. Enter your **GitHub Personal Access Token** ([create one here](https://github.com/settings/tokens/new) with `repo` scope)
7. Enter your target **repository name**
8. Click **"Test Connection"** â†’ should show âœ… green status
9. Start solving LeetCode problems â€” solutions auto-sync! ðŸŽ‰

---

## ðŸ—‚ï¸ Project Structure

```
leetcode-github-sync/
â”œâ”€â”€ manifest.json              # Extension configuration (Manifest V3)
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ inject.js              # Main-world hook â€” intercepts submissions
â”‚   â”œâ”€â”€ content.js             # Orchestrator â€” GraphQL fetch + toast
â”‚   â””â”€â”€ background.js          # Service worker â€” GitHub API + queue
â”œâ”€â”€ popup/
â”‚   â”œâ”€â”€ popup.html             # 3-tab popup UI
â”‚   â”œâ”€â”€ popup.css              # Dark glassmorphism theme
â”‚   â””â”€â”€ popup.js               # Popup logic & state
â”œâ”€â”€ styles/
â”‚   â””â”€â”€ toast.css              # In-page notification styles
â””â”€â”€ icons/
    â”œâ”€â”€ icon16.png             # Toolbar icon
    â”œâ”€â”€ icon48.png             # Extensions page icon
    â””â”€â”€ icon128.png            # Store icon
```

---

## ðŸ” Security & Privacy

- **Token stored locally** â€” never sent anywhere except `api.github.com`
- **No external analytics** â€” zero tracking, zero telemetry
- **Minimal permissions** â€” only `storage`, `activeTab`, `alarms`
- **Open source** â€” full code audit possible
- **CSP compliant** â€” proper `web_accessible_resources` usage

---

## ðŸŒ Supported Languages (18+)

| Language | Extension | Language | Extension |
|----------|-----------|----------|-----------|
| Python | `.py` | TypeScript | `.ts` |
| C++ | `.cpp` | C | `.c` |
| Java | `.java` | C# | `.cs` |
| JavaScript | `.js` | Go | `.go` |
| Ruby | `.rb` | Swift | `.swift` |
| Kotlin | `.kt` | Rust | `.rs` |
| Scala | `.scala` | PHP | `.php` |
| Dart | `.dart` | Racket | `.rkt` |
| Erlang | `.erl` | Elixir | `.ex` |
| MySQL | `.sql` | Pandas | `.py` |

---

## ðŸ“Š Data Captured Per Submission

| Field | Example |
|-------|---------|
| Problem Number | `1` |
| Problem Title | `Two Sum` |
| Difficulty | `Easy` / `Medium` / `Hard` |
| Tags | `Array`, `Hash Table` |
| Problem Description | Full HTML statement |
| Solution Code | Complete source code |
| Language | `python3`, `cpp`, `java` |
| Runtime | `4 ms` |
| Runtime Percentile | `Beats 95.2%` |
| Memory Usage | `17.5 MB` |
| Memory Percentile | `Beats 82.1%` |
| Submission Timestamp | `2026-06-23T12:30:00Z` |
| LeetCode URL | `https://leetcode.com/problems/two-sum/` |

---

## ðŸ—ºï¸ Roadmap

- [x] Project ideation & architecture design
- [ ] Core extension (manifest, content scripts, service worker)
- [ ] LeetCode submission interception (inject.js)
- [ ] GitHub API integration (create/update files)
- [ ] Popup UI (dashboard, history, settings)
- [ ] Toast notifications on LeetCode pages
- [ ] Offline queue & retry logic
- [ ] Extension icons & branding
- [ ] Testing & polish
- [ ] Chrome Web Store submission

---

## ðŸ“„ License

MIT License â€” feel free to fork, modify, and distribute.

---

<div align="center">

**Built with â¤ï¸ for the competitive programming community**

*Stop manually copying code. Let the extension do it for you.*

</div>
