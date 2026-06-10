/**
 * background.js - Service Worker
 * Handles keyboard shortcut (Ctrl+Shift+E) and forwards to content script
 */
chrome.commands.onCommand.addListener(function (command) {
  if (command === 'toggle-source-editor') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('mp.weixin.qq.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_EDITOR' }).catch(function () {
          // Content script may not be ready yet, that's OK
        });
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      autoPreview: false,
      enabled: true
    });
  }
});
