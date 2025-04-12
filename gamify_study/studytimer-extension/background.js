const DISTRACTING_SITES = [
    /netflix\.com/,
    /youtube\.com/,
    /tiktok\.com/,
    /twitter\.com/,
    /reddit\.com/
  ];
  
  const PAUSE_ENDPOINT = "http://127.0.0.1:5001/pause-timer";
  const RESUME_ENDPOINT = "http://127.0.0.1:5001/reset-pause-state";  
  
  let currentlyPaused = false;
  
  // Called when a tab is updated (navigated or reloaded)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && DISTRACTING_SITES.some(regex => regex.test(tab.url))) {
      console.log("🚨 Distracting site detected:", tab.url);
  
      if (!currentlyPaused) {
        currentlyPaused = true;
        fetch(PAUSE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "site-block", url: tab.url })
        })
          .then(res => res.text())
          .then(text => console.log("✅ Paused:", text))
          .catch(err => console.error("❌ Failed to pause:", err));
      }
    }
  
    // On tab update, check if we should resume
    checkForResume();
  });
  
  // Called when a tab is closed
  chrome.tabs.onRemoved.addListener(() => {
    checkForResume();
  });
  
  // Called when user switches tabs or focuses back to Chrome
  chrome.windows.onFocusChanged.addListener(() => {
    checkForResume();
  });
  
  function checkForResume() {
    chrome.tabs.query({}, (tabs) => {
      const hasDistractingTab = tabs.some(tab =>
        DISTRACTING_SITES.some(regex => regex.test(tab.url || ""))
      );
  
      if (!hasDistractingTab && currentlyPaused) {
        console.log("🟢 No more distracting sites — resuming timer.");
  
        fetch(RESUME_ENDPOINT, { method: "POST" })
          .then(res => res.text())
          .then(text => {
            console.log("✅ Resume response:", text);
            currentlyPaused = false;
          })
          .catch(err => console.error("❌ Failed to resume:", err));
      }
    });
  }
  