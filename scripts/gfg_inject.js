(function () {
  const PROCESSED_SUBMISSIONS = new Set();

  function checkResponse(responseUrl, responseText, reqBody) {
    const urlStr = String(responseUrl);
    // Only care about GFG's practice API submission endpoints
    if (!urlStr.includes('practiceapi.geeksforgeeks.org') && !urlStr.includes('api/')) {
      return;
    }

    try {
      const data = JSON.parse(responseText);

      // GFG uses various success indicators
      const isAccepted =
        data.isCorrect === true ||
        data.status === 'Accepted' ||
        (typeof data.message === 'string' && (
          data.message.includes('Problem Solved Successfully') ||
          data.message.includes('Correct Answer')
        ));

      if (!isAccepted) return;

      // Generate a dedup key from URL + timestamp
      const dedupKey = `${urlStr}_${Date.now()}`;
      
      // Simple time-based dedup (ignore if we fired in the last 5 seconds)
      const now = Date.now();
      for (const key of PROCESSED_SUBMISSIONS) {
        const ts = parseInt(key.split('_').pop());
        if (now - ts < 5000) return; // Already processed recently
      }
      
      PROCESSED_SUBMISSIONS.add(dedupKey);
      
      // Keep set manageable
      if (PROCESSED_SUBMISSIONS.size > 20) {
        const first = PROCESSED_SUBMISSIONS.values().next().value;
        PROCESSED_SUBMISSIONS.delete(first);
      }

      let code = null;
      let language = null;
      if (reqBody && typeof reqBody === 'string') {
        try {
          const reqJson = JSON.parse(reqBody);
          code = reqJson.code || reqJson.sourceCode || reqJson.userCode || reqJson.program;
          language = reqJson.language || reqJson.lang;
        } catch (e) {}
      }

      // Post message to the GFG content script
      window.postMessage({
        type: 'GFG_SUBMISSION_ACCEPTED',
        data: {
          runtime: data.time || data.executionTime || '',
          memory: data.memory || data.spaceUsed || '',
          status_msg: data.message || 'Accepted',
          timestamp: new Date().toISOString(),
          code: code,
          language: language
        }
      }, '*');
    } catch (err) {
      // Not JSON or other error, ignore
    }
  }

  // Intercept Fetch API
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    let reqBody = null;
    if (args[1] && typeof args[1].body === 'string') {
      reqBody = args[1].body;
    }

    const response = await originalFetch.apply(this, args);
    const urlStr = String(args[0] instanceof Request ? args[0].url : args[0]);

    if (urlStr.includes('practiceapi') || urlStr.includes('api/')) {
      const clone = response.clone();
      clone.text().then(text => checkResponse(urlStr, text, reqBody)).catch(() => {});
    }
    return response;
  };

  // Intercept XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._reqUrl = String(url);
    this.addEventListener('load', function () {
      if (this._reqUrl.includes('practiceapi') || this._reqUrl.includes('api/')) {
        checkResponse(this._reqUrl, this.responseText, this._reqBody);
      }
    });
    return originalXhrOpen.call(this, method, url, ...rest);
  };

  const originalXhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    this._reqBody = body;
    return originalXhrSend.apply(this, arguments);
  };
})();
