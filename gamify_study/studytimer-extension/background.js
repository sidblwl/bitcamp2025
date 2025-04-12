// Log when the service worker loads
console.log("StudyGuard extension loaded.");

// Define your distracting sites with stricter regex patterns:
const DISTRACTING_SITES = [
  /^https?:\/\/(www\.)?netflix\.com/,
  /^https?:\/\/(www\.)?youtube\.com/,
  /^https?:\/\/(www\.)?tiktok\.com/,
  /^https?:\/\/(www\.)?twitter\.com/,
  /^https?:\/\/(www\.)?reddit\.com/
];

const API_ENDPOINT = "http://localhost:5000/pause-timer";

// Listen for tab updates to detect changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act if the URL was updated
  if (changeInfo.url) {
    // Check if the new URL matches any of the distracting site patterns
    if (DISTRACTING_SITES.some(regex => regex.test(changeInfo.url))) {
      console.log("🚨 Distracting site detected:", changeInfo.url);
      
      // Send a POST request to your backend
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "site-block", url: changeInfo.url })
      })
        .then((res) => res.text())
        .then((text) => console.log("✅ Backend response:", text))
        .catch(err => console.error("❌ Failed to send pause request:", err));
    }
  }
});
