// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  // If the letter 'g' is found in the tab's URL...
  if ( tab.url.search(new RegExp('http://book\.douban\.com/subject/\\d+','i')) !== -1 ) {
    // ... show the page action.
    chrome.pageAction.show(tabId);
  }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
