/**
 * 贰伴 — popup.js
 */
(function () {
  'use strict';

  var statusDot = document.getElementById('statusDot');
  var statusText = document.getElementById('statusText');
  var openBtn = document.getElementById('openEditorBtn');

  function setStatus(connected) {
    if (connected) {
      statusDot.className = 'status-dot connected';
      statusText.textContent = '已连接到编辑器';
      openBtn.disabled = false;
    } else {
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = '请在公众号编辑页面使用';
      openBtn.disabled = true;
    }
  }

  function checkStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('mp.weixin.qq.com')) {
        setStatus(false);
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, function (response) {
        if (chrome.runtime.lastError) {
          setStatus(false);
          return;
        }
        setStatus(response && response.connected);
      });
    });
  }

  openBtn.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_EDITOR' }).catch(function () {
        setStatus(false);
      });
      window.close();
    });
  });

  checkStatus();
})();
