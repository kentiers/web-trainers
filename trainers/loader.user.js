// ==UserScript==
// @name         Universal Web Game Trainer Hub (Client Loader)
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Ultra-light dynamic loader for Universal Web Game Trainer
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/*
// @match        https://games.crazygames.com/*
// @match        https://*.game-files.crazygames.com/*
// @match        https://poki.com/*
// @match        https://*.poki.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // URL CDN GitHub (Ganti <username> dan <repo> dengan akun GitHub kamu)
  // Raw CDN URL for production distribution
  const REMOTE_HUB_URL = 'https://raw.githubusercontent.com/kentiers/web-trainers/main/dist/hub.min.js';

  // Fallback lokal jika sedang dalam tahap development offline
  const LOCAL_CACHE_KEY = '__TRAINER_HUB_CACHE__';

  function injectScript(code) {
    const s = document.createElement('script');
    s.textContent = code;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
  }

  // Load core engine dari GitHub CDN
  fetch(REMOTE_HUB_URL)
    .then((res) => {
      if (!res.ok) throw new Error('CDN response not ok');
      return res.text();
    })
    .then((code) => {
      sessionStorage.setItem(LOCAL_CACHE_KEY, code);
      injectScript(code);
    })
    .catch((err) => {
      console.warn('[Trainer Loader] Fetching from CDN failed, using cached fallback...', err);
      const cached = sessionStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) injectScript(cached);
    });
})();
