# Security Policy

## 🔒 How This Extension Handles Your Data

### GitHub Personal Access Token (PAT)
- Your PAT is stored **exclusively** in `chrome.storage.local` — Chrome's encrypted, sandboxed local storage.
- It is **NEVER** hardcoded in source code, logged to console, or transmitted to any server other than `api.github.com`.
- The token is used only to authenticate GitHub REST API calls (creating repos, pushing files).
- You can revoke your token at any time from [GitHub Settings → Tokens](https://github.com/settings/tokens).

### LeetCode / GFG Session
- The extension uses your **existing browser session cookies** to communicate with LeetCode's GraphQL API and GFG's internal APIs.
- It does **NOT** store, export, or transmit your LeetCode/GFG credentials.
- All API requests happen within the browser context using your active session.

### Permissions Explained
| Permission | Why It's Needed |
|------------|-----------------|
| `storage` | To save your GitHub token, sync history, and settings locally |
| `activeTab` | To inject content scripts on LeetCode/GFG problem pages |
| `alarms` | To schedule retry attempts for failed GitHub pushes |
| `host_permissions: leetcode.com` | To intercept submission responses and fetch problem data |
| `host_permissions: geeksforgeeks.org` | To intercept GFG submission responses and scrape problem data |
| `host_permissions: api.github.com` | To push solution files to your GitHub repository |

### What We DON'T Do
- ❌ No analytics or telemetry
- ❌ No third-party tracking scripts
- ❌ No data collection beyond your local browser
- ❌ No external servers — the extension is 100% client-side
- ❌ No cookies or tokens are ever sent to any domain other than their origin

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability in this extension, please:

1. **DO NOT** open a public issue.
2. Email the maintainer directly or use [GitHub Security Advisories](https://github.com/shivam16s/leetcode-gfg-sync/security/advisories/new).
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
4. You will receive a response within **48 hours**.

---

## ✅ Best Practices for Users

1. **Use a scoped token:** When creating your GitHub PAT, only grant the `repo` scope — nothing more.
2. **Set an expiration:** Use a token with a 90-day expiration and rotate it regularly.
3. **Use a dedicated repo:** Don't use a token with access to sensitive/work repositories.
4. **Audit the code:** This extension is fully open-source. Review the code before installing.
