/**
 * OpenCV.js readiness gate.
 *
 * The CDN <script> in index.html exposes a global `cv`. Depending on the
 * build, `cv` is either ready immediately or only after its WASM runtime
 * finishes initializing (signalled via `cv.onRuntimeInitialized`).
 * `whenReady()` resolves once it is safe to call cv.* functions.
 */

let readyPromise = null;

export function whenReady(timeoutMs = 30000) {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise((resolve, reject) => {
    const start = performance.now();

    const check = () => {
      const cv = window.cv;
      // Some builds set cv.Mat synchronously; others need the runtime hook.
      if (cv && typeof cv.Mat === 'function') {
        resolve(cv);
        return;
      }
      if (cv && typeof cv.then === 'function') {
        // Module-promise style build.
        cv.then((resolved) => resolve(resolved)).catch(reject);
        return;
      }
      if (cv) {
        cv.onRuntimeInitialized = () => resolve(window.cv);
        return;
      }
      if (performance.now() - start > timeoutMs) {
        reject(new Error('OpenCV.js failed to load within timeout'));
        return;
      }
      setTimeout(check, 100);
    };

    check();
  });

  return readyPromise;
}

export function isReady() {
  return !!(window.cv && typeof window.cv.Mat === 'function');
}
