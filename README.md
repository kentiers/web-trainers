# Web Game Trainer & Runtime Diagnostic Suite

Lightweight browser game trainer and WebGL/WebAssembly runtime diagnostic overlay with hotkey support.

## Installation & Setup

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Load the trainer script:
   👉 **[loader.user.js](https://raw.githubusercontent.com/kentiers/web-trainers/main/trainers/loader.user.js)**
3. Open any supported game on CrazyGames or Poki.

## Supported Games & Features

| Game | In-Game Features (HUD Labels) |
| :--- | :--- |
| **Words and Blooms** | Infinite Hints, Infinite Shuffles, Infinite Letters, Timescale |
| **Words of Wonders** | Free Hints (Spend to Gain Gems), 999 Free Hints & Hammers, Timescale |
| **Hangman** | Free Clues (Spend to Gain Diamonds), Timescale |
| **Tile Clash** | Free Hints (Spend to Gain Coins), Unlock 100 Levels & Max Streak, Timescale |
| **Chicken Hell** | Free Upgrades (Spend to Gain Rings), Unlock All 7 Skins, 999 Spins, Turbo Boost, Timescale |
| **Swarm Survivor** | God Mode (Kebal + One-Hit Kill), +999K Coins & Gems, Timescale |
| **Capybara Clicker 2** | Sprite-Locked Turbo Clicker (~60 clicks/s), +1K Burst, Timescale |
| **Life Simulator: Road to Riches** | +$100M Cash (HDTB Serializer), Max Stats, Timescale |
| **Idle Zombie Wave: Survivors** | God Mode, One-Hit Kill, Repair Wall, +5K Scrap, Timescale |
| **Age of Tanks Warriors: TD War** | Timescale (1x / 2x / 5x) |
| **Dungeons and Bags** | Win Level, Heal Hero, Timescale |
| **Universal Utility** | Instant Ad-Reward Bypass & Dynamic Timescale for all CrazyGames/Poki titles |

## Hotkeys & Controls

* **`INSERT`** — Show / Hide Trainer HUD
* **`NUMPAD 1`** — Primary Action (God Mode / Win Level)
* **`NUMPAD 2`** — Secondary Action (One-Hit Kill / Heal Hero)
* **`NUMPAD 3`** — Repair Wall (Idle Zombie Wave)
* **`NUMPAD 4`** — Add Scrap (Idle Zombie Wave)
* **`F11`** — Timescale (1x / 2x / 5x)

> **Tip:** Tekan **F5** (refresh browser) jika saldo atau status cheat belum langsung ter-update di layar permainan.

## Binary Analysis Toolchain (Research & Development)

Integrated CLI tools for inspecting game binaries:
* `npm run analyze:wat` — Disassemble `.wasm` into WebAssembly text (`.wat`) via WABT.
* `npm run analyze:il2cpp` — Dump Unity C# classes and methods via Il2CppDumper.
* `npm run tool:mcp:cheatengine` — Start Cheat Engine MCP Bridge for AI memory analysis & pointer scanning.
