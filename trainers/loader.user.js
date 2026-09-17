// ==UserScript==
// @name         Universal Web Game Trainer Hub (Client Loader)
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.2.0
// @description  Ultra-light dynamic loader with full multi-frame and document-start support
// @author       Trainer Modding Lab
// @match        https://*.crazygames.com/*
// @match        https://crazygames.com/*
// @match        https://*.game-files.crazygames.com/*
// @match        https://*.files.crazygames.com/*
// @match        https://files.crazygames.com/*
// @match        https://*.poki.com/*
// @match        https://*.poki-gdn.com/*
// @match        https://evowars.io/*
// @match        https://*.evowars.io/*
// @run-at       document-start
// @allFrames    true
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const REMOTE_HUB_BASE = 'https://raw.githubusercontent.com/kentiers/web-trainers/main/trainers/dist/hub.min.js';
  const NO_CACHE_URL = `${REMOTE_HUB_BASE}?t=${Date.now()}`;

  function injectScript(code) {
    const s = document.createElement('script');
    s.textContent = code;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
  }

  fetch(NO_CACHE_URL, { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error('CDN response error');
      return res.text();
    })
    .then((code) => {
      injectScript(code);
    })
    .catch((err) => {
      console.warn('[Trainer Loader] Fetching without cache failed, retrying base URL...', err);
      fetch(REMOTE_HUB_BASE)
        .then(r => r.text())
        .then(injectScript);
    });
})();
