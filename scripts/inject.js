(function () {
  const PROCESSED_SUBMISSIONS = new Set(); // Deduplication logic

  function checkResponse(responseUrl, responseText) {
    // We only care about LeetCode's check endpoint
    if (!responseUrl.includes('/submissions/detail/') || !responseUrl.includes('/check/')) {
      return;
    }

    try {
      const data = JSON.parse(responseText);
      
      // Check if it's an Accepted submission
      if (data.state === 'SUCCESS' && data.status_msg === 'Accepted') {
        const submissionIdMatch = responseUrl.match(/\/submissions\/detail\/(\d+)\/check/);
        if (!submissionIdMatch) return;
        
        const submissionId = submissionIdMatch[1];
        
        // Prevent duplicate processing
        if (PROCESSED_SUBMISSIONS.has(submissionId)) return;
        PROCESSED_SUBMISSIONS.add(submissionId);
        
        // Keep the set size manageable
        if (PROCESSED_SUBMISSIONS.size > 20) {
          const first = PROCESSED_SUBMISSIONS.values().next().value;
          PROCESSED_SUBMISSIONS.delete(first);
        }

        // Post message to the content script
        window.postMessage({
          type: 'LEETCODE_SUBMISSION_ACCEPTED',
          data: {
            submission_id: submissionId,
            runtime: data.status_runtime || data.runtime || '',
            runtime_percentile: data.runtime_percentile ? `Beats ${data.runtime_percentile.toFixed(2)}%` : '',
            memory: data.status_memory || data.memory || '',
            memory_percentile: data.memory_percentile ? `Beats ${data.memory_percentile.toFixed(2)}%` : '',
            lang: data.lang || '',
            status_msg: data.status_msg,
            timestamp: new Date().toISOString()
          }
        }, '*');
      }
    } catch (err) {
      // Not JSON or other error, ignore
    }
  }

  // Intercept Fetch API
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0] instanceof Request ? args[0].url : args[0];
    
    if (typeof url === 'string' && url.includes('/submissions/detail/') && url.includes('/check/')) {
      // Clone response so we can read it without consuming the original stream
      const clone = response.clone();
      clone.text().then(text => checkResponse(url, text)).catch(console.error);
    }
    return response;
  };

  // Intercept XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.addEventListener('load', function () {
      if (typeof url === 'string') {
        checkResponse(url, this.responseText);
      }
    });
    return originalXhrOpen.call(this, method, url, ...rest);
  };
})();
