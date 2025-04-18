 // Logo click – redirect
document.getElementById("logo").addEventListener("click", () => {
  window.open("https://yourfraudguardsite.com", "_blank");
});

// Report button – open internal report page with current URL
document.getElementById("report-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url;
    chrome.tabs.create({
      url: chrome.runtime.getURL(`reportpage.html?url=${encodeURIComponent(url)}`)
    });
  });
});

// Query background for fraud status
chrome.runtime.sendMessage({ type: "getPhishingList" }, (response) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentUrl = tabs[0].url;
    const isPhishing = response.phishingList.some((phishUrl) =>
      currentUrl.includes(phishUrl)
    );

    chrome.runtime.sendMessage({ fraudDetected: isPhishing });
  });
});

// Listen for fraud status
chrome.runtime.onMessage.addListener((message) => {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  if (message.fraudDetected === true) {
    statusDot.style.backgroundColor = "red";
    statusText.textContent = "Unsafe";
    statusText.style.color = "red";
  } else if (message.fraudDetected === false) {
    statusDot.style.backgroundColor = "green";
    statusText.textContent = "Safe";
    statusText.style.color = "green";
  }
});

// Fallback to Safe after 1.5 sec if no update received
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const statusText = document.getElementById("status-text");
    if (statusText.textContent === "Checking...") {
      document.getElementById("status-dot").style.backgroundColor = "green";
      statusText.textContent = "Safe";
      statusText.style.color = "green";
    }
  }, 1500);
});
