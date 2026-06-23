# 🚀 LeetCode → GitHub Sync | Chrome Extension

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-FF6D00?style=for-the-badge)
![GitHub API](https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github&logoColor=white)
![LeetCode](https://img.shields.io/badge/LeetCode-Sync-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)

**Automatically capture your accepted LeetCode submissions and push them to a GitHub repository — with full metadata, organized by difficulty.**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [How It Works](#-how-it-works) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Problem Statement

Competitive programmers and interview preppers solve hundreds of LeetCode problems, but:
- ❌ Solutions are **trapped** inside LeetCode's platform
- ❌ No easy way to **showcase** your work on GitHub
- ❌ Manually copying code + creating files is **tedious**
- ❌ You lose **context** — runtime stats, problem descriptions, difficulty tags

## 💡 Solution

A Chrome extension that **automatically detects** when you submit an accepted solution on LeetCode and **pushes it to your GitHub repo** with:
- Full source code in the correct file format
- Auto-generated README with problem details, stats, and badges
- Organized folder structure by difficulty level
- Zero manual effort — just solve and submit!

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🔄 **Auto-Sync** | Detects accepted submissions in real-time — no clicking needed |
| 📁 **Smart Organization** | Files organized as `Easy/0001-Two-Sum/solution.py` |
| 📝 **Rich READMEs** | Auto-generated with difficulty badges, tags, stats, problem description |
| 🌐 **18+ Languages** | Python, C++, Java, JavaScript, Go, Rust, TypeScript, and more |
| 🔀 **Multi-Language** | Submit same problem in different languages — all solutions kept |
| 📊 **Full Metadata** | Runtime, memory, percentile beats, timestamps, problem links |

### Robustness Features
| Feature | Description |
|---------|-------------|
| 📡 **Offline Queue** | Failed pushes are queued and auto-retried when back online |
| 🔁 **Exponential Backoff** | Smart retry with increasing delays (5min → 10min → 20min) |
| 🏗️ **Auto-Create Repo** | Creates the GitHub repo automatically if it doesn't exist |
| 🛡️ **Duplicate Prevention** | Tracks submission IDs — never syncs the same submission twice |
| 🔍 **Auto-Detect Branch** | Works with `main`, `master`, or any custom default branch |
| ⚡ **Rate Limit Aware** | Monitors GitHub API limits and delays requests when needed |

### UI Features
| Feature | Description |
|---------|-------------|
| 🎨 **Premium Dark Theme** | Glassmorphism popup with smooth animations |
| 📊 **Dashboard** | Total syncs, difficulty breakdown, streak counter |
| 📜 **History Log** | Last 50 synced submissions with filters |
| 🔔 **Toast Notifications** | In-page success/failure alerts on LeetCode |
| 🏷️ **Badge Counter** | Extension icon shows today's sync count |
| ⚙️ **Settings Panel** | GitHub token, repo name, auto-sync toggle |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension (Manifest V3)           │
│                                                              │
│  ┌──────────────┐   ┌────────────────┐   ┌───────────────┐ │
│  │  Popup UI    │   │ Content Script │   │  Background   │ │
│  │              │   │                │   │  Service      │ │
│  │ • Dashboard  │   │ • inject.js    │   │  Worker       │ │
│  │ • History    │◄─►│   (main world) │──►│               │ │
│  │ • Settings   │   │ • content.js   │   │ • GitHub API  │ │
│  │              │   │   (isolated)   │   │ • Offline Q   │ │
│  └──────────────┘   └────────────────┘   │ • Retry Logic │ │
│                                           └───────┬───────┘ │
│                                                   │         │
│                                             ┌─────▼──────┐  │
│                                             │ GitHub API │  │
│                                             │ (REST v3)  │  │
│                                             └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Submission Capture Flow

```
User clicks "Submit" on LeetCode
        │
        ▼
┌─────────────────────────────┐
│ POST /problems/{slug}/submit │ ──→ Returns submission_id
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ GET /submissions/detail/{id}/check │ ──→ LeetCode polls until done
└──────────────┬───────────────────┘
               │
        inject.js intercepts response
               │
               ▼
    ┌─────────────────────┐
    │ status_msg =        │──→ "Wrong Answer" → Ignore
    │ "Accepted"?         │
    └─────────┬───────────┘
              │ YES
              ▼
┌──────────────────────────────┐
│ content.js fetches full data  │
│ via LeetCode GraphQL API      │
│ • Problem: title, difficulty  │
│ • Code: full source           │
│ • Stats: runtime, memory      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ background.js pushes to       │
│ GitHub via REST API            │
│ • Solution file               │
│ • Problem README.md           │
│ • Root index README.md        │
└──────────────────────────────┘
```

---

## 📂 Repository Structure Created on GitHub

```
leetcode-solutions/
├── README.md                              ← Auto-generated index table
├── Easy/
│   ├── 0001-Two-Sum/
│   │   ├── README.md                      ← Problem details + stats
│   │   └── solution.py                    ← Your solution
│   └── 0070-Climbing-Stairs/
│       ├── README.md
│       └── solution.java
├── Medium/
│   ├── 0015-3Sum/
│   │   ├── README.md
│   │   ├── solution.cpp                   ← Multiple languages supported
│   │   └── solution.py
│   └── 0200-Number-of-Islands/
│       ├── README.md
│       └── solution.go
└── Hard/
    └── 0004-Median-of-Two-Sorted-Arrays/
        ├── README.md
        └── solution.java
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
‍‍‍python
class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i
‍‍‍
```

---

## 🛠️ Tech Stack

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

## 📦 Installation

### Developer Mode (Local)
1. Clone this repository
   ```bash
   git clone https://github.com/shivam16s/leetcode-github-sync.git
   ```
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer Mode** (top-right toggle)
4. Click **"Load unpacked"** → select the cloned folder
5. Click the extension icon → go to **Settings** tab
6. Enter your **GitHub Personal Access Token** ([create one here](https://github.com/settings/tokens/new) with `repo` scope)
7. Enter your target **repository name**
8. Click **"Test Connection"** → should show ✅ green status
9. Start solving LeetCode problems — solutions auto-sync! 🎉

---

## 🗂️ Project Structure

```
leetcode-github-sync/
├── manifest.json              # Extension configuration (Manifest V3)
├── scripts/
│   ├── inject.js              # Main-world hook — intercepts submissions
│   ├── content.js             # Orchestrator — GraphQL fetch + toast
│   └── background.js          # Service worker — GitHub API + queue
├── popup/
│   ├── popup.html             # 3-tab popup UI
│   ├── popup.css              # Dark glassmorphism theme
│   └── popup.js               # Popup logic & state
├── styles/
│   └── toast.css              # In-page notification styles
└── icons/
    ├── icon16.png             # Toolbar icon
    ├── icon48.png             # Extensions page icon
    └── icon128.png            # Store icon
```

---

## 🔐 Security & Privacy

- **Token stored locally** — never sent anywhere except `api.github.com`
- **No external analytics** — zero tracking, zero telemetry
- **Minimal permissions** — only `storage`, `activeTab`, `alarms`
- **Open source** — full code audit possible
- **CSP compliant** — proper `web_accessible_resources` usage

---

## 🌍 Supported Languages (18+)

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

## 📊 Data Captured Per Submission

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

## 🗺️ Roadmap

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

## 📄 License

MIT License — feel free to fork, modify, and distribute.

---

<div align="center">

**Built with ❤️ for the competitive programming community**

*Stop manually copying code. Let the extension do it for you.*

</div>
