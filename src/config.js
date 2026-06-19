/**
 * Central tuning constants for Cascade.
 *
 * Keeping every "magic number" here makes the physics feel and the CV
 * thresholds easy to tweak without hunting through modules. Values are
 * starting points from the PRD's design (§7, §8, §14) and expected to be
 * tuned by hand once the loop is playable.
 */

export const CONFIG = {
  // --- Capture / processing ---------------------------------------------
  capture: {
    width: 960, // displayed/working resolution
    height: 540,
    targetFps: 30,
    // Vision can run at a lower resolution than we render, to stay in budget.
    processScale: 0.5, // process at 50% (PRD §14 performance budget)
  },

  // --- Physics world ----------------------------------------------------
  physics: {
    gravityY: 1, // Matter default-ish; tuned for a calm fall
    ballRadius: 14,
    ballRestitution: 0.4, // balls themselves are mildly bouncy
    ballFriction: 0.02,
    // Gentle stream: one ball roughly every 2–3 s (PRD §8).
    spawnIntervalMs: 2400,
    maxBalls: 12, // safety cap so the world never floods
  },

  // --- Spawn spout (fixed per session, random x within a band) ----------
  spout: {
    // Random x chosen within [marginX, width - marginX] at session start.
    marginX: 120,
    y: 24,
  },

  // --- Bucket (fixed position, slight inner-wall restitution) -----------
  bucket: {
    width: 150, // opening width
    height: 130,
    wallThickness: 14,
    // Inner walls are a bit bouncy so a *fast* ball bounces out — this is
    // what makes the blue brake matter (PRD §8, §14).
    innerRestitution: 0.55,
    // A ball counts as "caught" when resting inside below this speed.
    catchSpeed: 1.2,
    bottomMargin: 28, // distance from bottom of play area
  },

  // --- Note behaviours (color → physics) --------------------------------
  notes: {
    pink: {
      restitution: 0.9, // bouncer / aim
      friction: 0.05,
    },
    blue: {
      restitution: 0.05, // brake
      friction: 0.9,
    },
    // Frames a tracked note may go undetected before its collider is
    // removed. Bridges brief occlusion by a reaching hand (PRD FR-8a).
    occlusionHoldFrames: 12,
  },

  // --- Default HSV ranges (overwritten by calibration) ------------------
  // Hue 0–179, Sat/Val 0–255 (OpenCV convention). These are only fallbacks
  // for before the user calibrates against their real notes & lighting.
  defaultHsv: {
    pink: { hLow: 150, hHigh: 175, sLow: 90, sHigh: 255, vLow: 80, vHigh: 255 },
    blue: { hLow: 95, hHigh: 120, sLow: 90, sHigh: 255, vLow: 80, vHigh: 255 },
  },

  storageKey: 'cascade.calibration.v1',
};
