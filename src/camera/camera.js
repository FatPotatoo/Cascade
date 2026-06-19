/**
 * Webcam capture (PRD FR-1, FR-2, FR-3).
 *
 * Wraps getUserMedia in a small class that exposes a ready <video> element
 * the rest of the app can draw from, plus camera enumeration/selection.
 */

import { CONFIG } from '../config.js';

export class Camera {
  constructor() {
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.stream = null;
    this.deviceId = null;
  }

  /** Start (or restart) capture, optionally on a specific device. */
  async start(deviceId = null) {
    this.stop();

    const constraints = {
      audio: false,
      video: {
        width: { ideal: CONFIG.capture.width },
        height: { ideal: CONFIG.capture.height },
        facingMode: 'environment',
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.deviceId = deviceId;
    this.video.srcObject = this.stream;
    await this.video.play();

    // Wait for real frame dimensions before anyone reads them.
    if (!this.video.videoWidth) {
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => resolve();
      });
    }
    return this.video;
  }

  /** List available video input devices (labels populate after permission). */
  async listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput');
  }

  get width() {
    return this.video.videoWidth || CONFIG.capture.width;
  }

  get height() {
    return this.video.videoHeight || CONFIG.capture.height;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}
