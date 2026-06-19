/**
 * Cascade entry point — boots the M0 harness + core loop.
 *
 * Pipeline wired here (PRD §14): camera → (vision, later) → physics → render.
 * For this milestone vision/calibration are not yet active; the loop proves
 * camera + physics + render integration with the Zen-mode ball stream,
 * bucket, and "Well done!" celebration.
 */

import './style.css';
import { CONFIG } from './config.js';
import { Camera } from './camera/camera.js';
import { PhysicsWorld } from './physics/world.js';
import { Overlay } from './render/overlay.js';
import { whenReady as openCvReady } from './vision/opencv.js';

const els = {
  canvas: document.getElementById('stage'),
  status: document.getElementById('status'),
  legend: document.getElementById('legend'),
  cameraError: document.getElementById('camera-error'),
};

function setStatus(text) {
  els.status.textContent = text;
}

async function boot() {
  const camera = new Camera();

  // 1. Camera (PRD FR-1). Graceful failure → show the camera-error panel.
  try {
    setStatus('Requesting camera…');
    await camera.start();
  } catch (err) {
    console.error('Camera error:', err);
    setStatus('No camera');
    els.cameraError.classList.remove('hidden');
    return;
  }

  const width = CONFIG.capture.width;
  const height = CONFIG.capture.height;

  const overlay = new Overlay(els.canvas, width, height);
  const physics = new PhysicsWorld(width, height);

  // "Well done!" celebration state (PRD §5).
  let wellDoneUntil = 0;
  physics.onCatch = () => {
    wellDoneUntil = performance.now() + 1600;
  };
  physics.onMiss = () => {
    /* no penalty in Zen mode — play just continues (PRD §5, §9) */
  };

  els.legend.classList.remove('hidden');
  setStatus('Loading vision…');

  // 2. Warm up OpenCV.js in the background; the loop runs regardless. Once
  //    ready, calibration + detection get wired in (next milestone).
  openCvReady()
    .then(() => setStatus('Ready — arrange your notes'))
    .catch((e) => {
      console.warn('OpenCV not ready:', e);
      setStatus('Vision unavailable (physics demo running)');
    });

  // 3. Main loop.
  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;

    physics.maybeSpawn(now);
    physics.step(dt);

    overlay.clear();
    overlay.drawFeed(camera.video);
    overlay.drawSpout(physics.spoutX, physics.spoutY);
    overlay.drawBucket(physics.bucketRect);
    overlay.drawBalls(physics.balls);

    const wd = (wellDoneUntil - now) / 1600;
    overlay.drawWellDone(Math.max(0, Math.min(1, wd)));

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot();
