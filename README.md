# Web Runtime Instrumentation & Diagnostic Suite

Academic research framework and lightweight diagnostic overlay for WebGL / WebAssembly applications with runtime telemetry and hotkey hooks.

## Installation & Setup

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. Load the diagnostic harness script:
   👉 **[loader.user.js](https://raw.githubusercontent.com/kentiers/web-trainers/main/trainers/loader.user.js)**
3. Navigate to any supported WebGL/WASM application target.

## Supported Runtime Targets

| Target Application | Instrumentation Capabilities |
| :--- | :--- |
| **Idle Zombie Wave: Survivors** | State Clamping, Instant Hit Dispatcher, Wall Integrity Repair, Scrap Register Injection, Time Dilation |
| **Age of Tanks Warriors: TD War** | Time Dilation & Frame Pacing Governor (1x / 2x / 5x) |
| **Dungeons and Bags** | Scene State Clearance, Hero Integrity Assertion, Time Dilation |
| **Universal Utility** | Asynchronous Media SDK State-Machine Interceptor & Simulator |

## Diagnostic Controls & Hotkeys

* **`INSERT`** — Toggle Diagnostic HUD Overlay
* **`NUMPAD 1`** — Primary Runtime Assertion / State Routine
* **`NUMPAD 2`** — Secondary State Mutation Hook
* **`NUMPAD 3`** — Integrity Repair Trigger
* **`NUMPAD 4`** — Resource Allocation Dispatcher
* **`F11`** — Virtual Clock Scaler (1x / 2x / 5x)

## Binary Analysis Toolchain

Integrated CLI utilities for static disassembly and metadata inspection:
* `npm run analyze:wat` — Disassemble `.wasm` bytecode into WebAssembly Text format (`.wat`) via WABT.
* `npm run analyze:il2cpp` — Extract Unity C# symbols, fields, and memory offsets via Il2CppDumper.
