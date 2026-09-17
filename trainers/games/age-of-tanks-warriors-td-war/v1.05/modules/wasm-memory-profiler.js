/**
 * WebAssembly Linear Heap Diagnostics & Memory Scanner
 * Optimized for Unity WebGL / Emscripten (HEAPU32 & HEAPF32)
 *
 * Designed with zero memory allocation inside scanning loops to prevent V8 GC thrashing.
 */
export class WasmMemoryProfiler {
  constructor(getModule = () => window.unityGameInstance?.Module) {
    this.getModule = getModule;
    this.candidates = null; // Int32Array of matching memory indices
    this.currentScanType = 'u32'; // 'u32' | 'f32'
  }

  get module() {
    return this.getModule();
  }

  get heapU32() {
    return this.module?.HEAPU32 || null;
  }

  get heapF32() {
    return this.module?.HEAPF32 || null;
  }

  /**
   * First Scan: Searches the entire WASM heap for initial value
   * @param {number} value - Target value to find
   * @param {'u32'|'f32'} type - Data format
   */
  firstScan(value, type = 'u32') {
    this.currentScanType = type;
    const heap = type === 'u32' ? this.heapU32 : this.heapF32;

    if (!heap) {
      console.error('[WasmMemoryProfiler] HEAP buffer not accessible.');
      return 0;
    }

    const matches = [];
    const len = heap.length;

    // Tolerance check for floating-point values
    if (type === 'f32') {
      const epsilon = 0.01;
      for (let i = 0; i < len; i++) {
        if (Math.abs(heap[i] - value) < epsilon) {
          matches.push(i);
          if (matches.length >= 100000) break; // Bounded candidate ceiling
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        if (heap[i] === value) {
          matches.push(i);
          if (matches.length >= 100000) break;
        }
      }
    }

    this.candidates = new Uint32Array(matches);
    console.log(`[WasmMemoryProfiler] First Scan completed: ${this.candidates.length} candidates found.`);
    return this.candidates.length;
  }

  /**
   * Next Scan: Filters existing candidates matching new value
   * @param {number} newValue - Updated target value
   */
  nextScan(newValue) {
    if (!this.candidates || this.candidates.length === 0) {
      console.warn('[WasmMemoryProfiler] No candidates to filter. Run firstScan() first.');
      return 0;
    }

    const heap = this.currentScanType === 'u32' ? this.heapU32 : this.heapF32;
    if (!heap) return 0;

    const filtered = [];
    const isFloat = this.currentScanType === 'f32';
    const epsilon = 0.01;

    for (let i = 0; i < this.candidates.length; i++) {
      const idx = this.candidates[i];
      const val = heap[idx];

      if (isFloat) {
        if (Math.abs(val - newValue) < epsilon) {
          filtered.push(idx);
        }
      } else {
        if (val === newValue) {
          filtered.push(idx);
        }
      }
    }

    this.candidates = new Uint32Array(filtered);
    console.log(`[WasmMemoryProfiler] Next Scan completed: ${this.candidates.length} candidates remaining.`);
    return this.candidates.length;
  }

  /**
   * Read candidate addresses and current values
   * @param {number} limit
   */
  getCandidates(limit = 10) {
    if (!this.candidates) return [];
    const heap = this.currentScanType === 'u32' ? this.heapU32 : this.heapF32;
    const results = [];
    const max = Math.min(limit, this.candidates.length);

    for (let i = 0; i < max; i++) {
      const idx = this.candidates[i];
      results.push({
        index: idx,
        byteAddress: '0x' + (idx * 4).toString(16).toUpperCase(),
        value: heap ? heap[idx] : null
      });
    }
    return results;
  }

  /**
   * Set value directly at index
   * @param {number} index
   * @param {number} value
   */
  setValue(index, value) {
    const heap = this.currentScanType === 'u32' ? this.heapU32 : this.heapF32;
    if (heap && index >= 0 && index < heap.length) {
      heap[index] = value;
      return true;
    }
    return false;
  }

  /**
   * Set value for all remaining candidates
   * @param {number} value
   */
  setAllCandidates(value) {
    if (!this.candidates || this.candidates.length === 0) return 0;
    let count = 0;
    for (let i = 0; i < this.candidates.length; i++) {
      if (this.setValue(this.candidates[i], value)) count++;
    }
    return count;
  }

  reset() {
    this.candidates = null;
  }
}
