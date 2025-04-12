const DISTRACTING_SITES = [
    /netflix\.com/,
    /youtube\.com/,
    /tiktok\.com/,
    /twitter\.com/,
    /reddit\.com/
  ];
  
  const API_ENDPOINT = "http://localhost:5000/pause-timer";
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && DISTRACTING_SITES.some(regex => regex.test(tab.url))) {
      console.log("🚨 Distracting site detected:", tab.url);
  
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "site-block", url: tab.url })
      })
        .then((res) => res.text())
        .then((text) => console.log("✅ Backend response:", text))
        .catch(err => console.error("❌ Failed to send pause request:", err));
    }      
  });
  