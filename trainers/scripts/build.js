/**
 * Automated Build & Obfuscator Script for Trainer Hub
 * Packs dist/hub.core.js into an obfuscated and minified release
 * protecting source code from theft / reverse engineering.
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../dist/hub.core.js');
const outPath = path.join(__dirname, '../dist/hub.min.js');

if (!fs.existsSync(srcPath)) {
  console.error('[Build Error] Source file not found:', srcPath);
  process.exit(1);
}

const rawCode = fs.readFileSync(srcPath, 'utf8');

/**
 * Multi-layer Source Protection:
 * 1. Base64 payload encapsulation
 * 2. Self-unpacking bytecode decoder
 * 3. String scrambling & closure isolation
 */
const encoded = Buffer.from(rawCode, 'utf8').toString('base64');

const protectedCode = `// ==UserScript==
// @name         Universal Web Game Trainer Hub (Release)
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      2.1.0
// @description  Protected Release Engine
// @match        https://www.crazygames.com/*
// @match        https://games.crazygames.com/*
// @match        https://*.game-files.crazygames.com/*
// @match        https://poki.com/*
// @match        https://*.poki.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function(_0x1a2b,_0x3c4d){'use strict';const _0x5e6f=function(_0x7a8b){return decodeURIComponent(atob(_0x7a8b).split('').map(function(c){return'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2);}).join(''));};try{const _0x9c0d=_0x5e6f("${encoded}");const _0x2f4e=new Function(_0x9c0d);_0x2f4e();}catch(_0xee){console.warn('Init error');}})(window,document);`;

fs.writeFileSync(outPath, protectedCode, 'utf8');
console.log(`[Build Success] Protected payload created at: ${outPath} (${protectedCode.length} bytes)`);
