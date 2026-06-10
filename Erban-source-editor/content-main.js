/**
 * 贰伴 ErBan — MAIN world script (injected via <script> tag)
 * Bridges CustomEvents from ISOLATED world to __MP_Editor_JSAPI__
 * Runs in the page's JavaScript context, can access WeChat's native API
 */
(function () {
  'use strict';

  if (window.__erban_bridge_loaded) return;
  window.__erban_bridge_loaded = true;

  if (!/appmsg_edit/.test(window.location.href)) return;

  var REQ_EVENT = 'wx-source-editor-req';
  var RES_EVENT = 'wx-source-editor-resp';

  function getEditorContent() {
    if (window.__MP_Editor_JSAPI__) {
      return new Promise(function (resolve, reject) {
        var settled = false;
        try {
          window.__MP_Editor_JSAPI__.invoke({
            apiName: 'mp_editor_get_content',
            sucCb: function (res) {
              if (settled) return;
              settled = true;
              resolve(typeof res === 'string' ? res : (res.content || res.html || JSON.stringify(res)));
            },
            errCb: function (err) {
              if (settled) return;
              settled = true;
              reject(err);
            }
          });
          setTimeout(function () {
            if (!settled) {
              settled = true;
              resolve(getContentFallback());
            }
          }, 4000);
        } catch (e) {
          if (!settled) { settled = true; reject(e); }
        }
      });
    }
    return Promise.resolve(getContentFallback());
  }

  function getContentFallback() {
    var pm = document.querySelector('.ProseMirror');
    if (pm && pm.innerHTML) return pm.innerHTML;
    var ce = document.querySelector('[contenteditable="true"]');
    if (ce && ce.innerHTML && ce.innerHTML.trim()) return ce.innerHTML;
    try {
      var iframe = document.getElementById('ueditor_0');
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        return iframe.contentDocument.body.innerHTML;
      }
    } catch (e) { /* cross-origin */ }
    return '';
  }

  function setEditorContent(html) {
    if (window.__MP_Editor_JSAPI__) {
      return new Promise(function (resolve, reject) {
        var settled = false;
        try {
          window.__MP_Editor_JSAPI__.invoke({
            apiName: 'mp_editor_set_content',
            apiParam: { content: html },
            sucCb: function (res) {
              if (settled) return;
              settled = true;
              resolve(res);
            },
            errCb: function (err) {
              if (settled) return;
              settled = true;
              reject(err);
            }
          });
          setTimeout(function () {
            if (!settled) {
              settled = true;
              resolve(setContentFallback(html));
            }
          }, 4000);
        } catch (e) {
          if (!settled) { settled = true; reject(e); }
        }
      });
    }
    return Promise.resolve(setContentFallback(html));
  }

  function setContentFallback(html) {
    var pm = document.querySelector('.ProseMirror');
    if (pm) {
      pm.innerHTML = html;
      pm.dispatchEvent(new Event('input', { bubbles: true }));
      pm.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true, method: 'prosemirror' };
    }
    var ce = document.querySelector('[contenteditable="true"]');
    if (ce) {
      ce.innerHTML = html;
      ce.dispatchEvent(new Event('input', { bubbles: true }));
      return { success: true, method: 'contenteditable' };
    }
    try {
      var iframe = document.getElementById('ueditor_0');
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        iframe.contentDocument.body.innerHTML = html;
        return { success: true, method: 'iframe' };
      }
    } catch (e) { /* cross-origin */ }
    return { success: false, error: 'No editable element found' };
  }

  window.addEventListener(REQ_EVENT, function (e) {
    var detail = e.detail;
    if (!detail || !detail.type || !detail.requestId) return;
    var requestId = detail.requestId;

    function respond(type, data) {
      window.dispatchEvent(new CustomEvent(RES_EVENT, {
        detail: { type: type, requestId: requestId, data: data }
      }));
    }

    switch (detail.type) {
      case 'GET_CONTENT':
        getEditorContent().then(
          function (html) { respond('CONTENT_RESULT', { success: true, html: html }); },
          function (err) { respond('CONTENT_RESULT', { success: false, error: String(err) }); }
        );
        break;
      case 'SET_CONTENT':
        setEditorContent(detail.html).then(
          function (res) { respond('SET_RESULT', { success: true, detail: res }); },
          function (err) { respond('SET_RESULT', { success: false, error: String(err) }); }
        );
        break;
      case 'PING':
        respond('PONG', { ready: true });
        break;
    }
  });

  console.log('[贰伴] MAIN bridge ready (injected)');
})();
