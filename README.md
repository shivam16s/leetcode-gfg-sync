# 🚀 LeetCode & GFG → GitHub Sync | Chrome Extension

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-FF6D00?style=for-the-badge)
![GitHub API](https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github&logoColor=white)
![LeetCode](https://img.shields.io/badge/LeetCode-Sync-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)
![GeeksforGeeks](https://img.shields.io/badge/GFG-Sync-2F8D46?style=for-the-badge&logo=geeksforgeeks&logoColor=white)

**Automatically capture your accepted LeetCode & GeeksforGeeks submissions and push them to a GitHub repository — with full metadata, organized by platform and difficulty.**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [How It Works](#-how-it-works) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Problem Statement

Competitive programmers and interview preppers solve hundreds of problems, but:
- ❌ Solutions are **trapped** inside LeetCode / GFG platforms
- ❌ No easy way to **showcase** your work on GitHub
- ❌ Manually copying code + creating files is **tedious**
- ❌ You lose **context** — runtime stats, problem descriptions, difficulty tags

## 💡 Solution

A Chrome extension that **automatically detects** when you submit an accepted solution on **LeetCode or GeeksforGeeks** and **pushes it to your GitHub repo** with:
- Full source code in the correct file format
- Auto-generated README with problem details, stats, and badges
- Organized folder structure by platform and difficulty level
- Zero manual effort — just solve and submit!

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🔄 **Auto-Sync** | Detects accepted submissions in real-time — no clicking needed |
| 🌐 **Dual Platform** | Supports both **LeetCode** and **GeeksforGeeks** |
| 📁 **Smart Organization** | Files organized as `LeetCode/Easy/0001-two-sum/solution.py` and `GFG/Medium/reverse-a-linked-list/solution.cpp` |
| 📝 **Rich READMEs** | Auto-generated with difficulty badges, tags, stats, problem description |
| 🌐 **18+ Languages** | Python, C++, Java, JavaScript, Go, Rust, TypeScript, and more |
| 🔀 **Multi-Language** | Submit same problem in different languages — all solutions kept |
| 📊 **Full Metadata** | Runtime, memory, percentile beats, timestamps, problem links |
| ⏪ **Sync Past Submissions** | Backfill all your historical LeetCode solutions with one click |

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
| 📊 **Dashboard** | Total syncs, difficulty breakdown with progress rings |
| 📜 **History Log** | Last 50 synced submissions with platform badges (LC/GFG) |
| 🔔 **Toast Notifications** | In-page success/failure alerts on LeetCode & GFG |
| ⚙️ **Settings Panel** | GitHub token, repo name, auto-sync toggle, past sync button |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Chrome Extension (Manifest V3)                   │
│                                                                   │
│  ┌──────────────┐   ┌────────────────────┐   ┌────────────────┐ │
│  │  Popup UI    │   │  Content Scripts    │   │  Background    │ │
│  │              │   │                    │   │  Service       │ │
│  │ • Dashboard  │   │  LeetCode:         │   │  Worker        │ │
│  │ • History    │◄─►│  • inject.js       │──►│                │ │
│  │ • Settings   │   │  • content.js      │   │  • GitHub API  │ │
│  │              │   │                    │   │  • Offline Q   │ │
│  └──────────────┘   │  GeeksforGeeks:    │   │  • Retry Logic │ │
│                      │  • gfg_inject.js   │──►│  • Past Sync   │ │
│                      │  • gfg_content.js  │   └───────┬────────┘ │
│                      └────────────────────┘           │          │
│                                                 ┌─────▼──────┐  │
│                                                 │ GitHub API │  │
│                                                 │ (REST v3)  │  │
│                                                 └────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure Created on GitHub

```
your-solutions-repo/
├── LeetCode/
│   ├── Easy/
│   │   ├── 0001-two-sum/
│   │   │   ├── README.md                ← Problem details + stats
│   │   │   ├── solution.py              ← Your Python solution
│   │   │   └── solution.cpp             ← Your C++ solution (multi-lang!)
│   │   └── 0070-climbing-stairs/
│   │       ├── README.md
│   │       └── solution.java
│   ├── Medium/
│   │   └── 0056-merge-intervals/
│   │       ├── README.md
│   │       └── solution.cpp
│   └── Hard/
│       └── 0004-median-of-two-sorted-arrays/
│           ├── README.md
│           └── solution.java
└── GFG/
    ├── Easy/
    │   └── reverse-a-string/
    │       ├── README.md
    │       └── solution.cpp
    ├── Medium/
    │   └── topological-sort/
    │       ├── README.md
    │       └── solution.java
    └── Hard/
        └── longest-prefix-suffix/
            ├── README.md
            └── solution.py
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Extension** | Chrome Manifest V3 |
| **Language** | Vanilla JavaScript (ES6+) |
| **Styling** | CSS3 (Glassmorphism, Animations) |
| **LeetCode Data** | GraphQL API (unofficial, session-based) |
| **GFG Data** | `__NEXT_DATA__` extraction + DOM scraping + XHR interception |
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
8. Click **"Save & Test Connection"** → should show ✅ green status
9. Start solving problems on **LeetCode** or **GFG** — solutions auto-sync! 🎉

---

## 🗂️ Project Structure

```
leetcode-github-sync/
├── manifest.json              # Extension configuration (Manifest V3)
├── scripts/
│   ├── inject.js              # LeetCode — intercepts submissions
│   ├── content.js             # LeetCode — GraphQL fetch + toast
│   ├── gfg_inject.js          # GFG — intercepts submissions
│   ├── gfg_content.js         # GFG — __NEXT_DATA__ + DOM scraping
│   └── background.js          # Service worker — GitHub API + queue
├── popup/
│   ├── popup.html             # 3-tab popup UI
│   ├── popup.css              # Dark glassmorphism theme
│   └── popup.js               # Popup logic & state
├── styles/
│   └── toast.css              # In-page notification styles
├── icons/
│   ├── icon16.png             # Toolbar icon
│   ├── icon48.png             # Extensions page icon
│   └── icon128.png            # Store icon
└── docs/
    ├── IMPLEMENTATION_PLAN.md # Technical architecture document
    └── TASKS.md               # Development milestone tracker
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

## 🗺️ Roadmap

- [x] Project ideation & architecture design
- [x] Core extension (manifest, content scripts, service worker)
- [x] LeetCode submission interception
- [x] GeeksforGeeks submission interception
- [x] GitHub API integration (create/update files)
- [x] Multi-language support per problem
- [x] Sync past LeetCode submissions
- [x] Popup UI (dashboard, history, settings)
- [x] Toast notifications on LeetCode & GFG pages
- [x] Offline queue & retry logic
- [ ] Extension icons & branding
- [ ] Chrome Web Store submission

---

## 📄 License

MIT License — feel free to fork, modify, and distribute.

---

<div align="center">

**Built with ❤️ for the competitive programming community**

*Stop manually copying code. Let the extension do it for you.*

</div>
