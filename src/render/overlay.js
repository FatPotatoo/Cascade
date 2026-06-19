/**
 * Canvas renderer: draws the webcam feed with the physics overlay on top,
 * aligned 1:1 in game coordinates (PRD §12 game view, FR-19).
 *
 * The canvas backing store matches the play-area (game) resolution; CSS
 * scales it to fit the viewport while preserving aspect ratio.
 */

import { CONFIG } from '../config.js';

export class Overlay {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d');
    // Mirror horizontally so moving a note left moves it left on screen
    // (webcam acts like a mirror — more intuitive for reaching at a wall).
    this.mirror = true;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawFeed(video) {
    const { ctx, width, height } = this;
    ctx.save();
    if (this.mirror) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    if (video && video.videoWidth) {
      ctx.drawImage(video, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  drawSpout(x, y) {
    const { ctx } = this;
    const sx = this.mirror ? this.width - x : x;
    ctx.save();
    ctx.fillStyle = 'rgba(232,236,244,0.9)';
    ctx.beginPath();
    ctx.moveTo(sx - 18, y);
    ctx.lineTo(sx + 18, y);
    ctx.lineTo(sx + 10, y + 16);
    ctx.lineTo(sx - 10, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawBucket(rect) {
    const { ctx } = this;
    const { wallThickness: t, height: bh } = CONFIG.bucket;
    const x = this.mirror ? this.width - rect.x - rect.w : rect.x;
    ctx.save();
    ctx.strokeStyle = 'rgba(232,236,244,0.95)';
    ctx.lineWidth = t;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + t / 2, rect.y);
    ctx.lineTo(x + t / 2, rect.y + bh); // left wall
    ctx.lineTo(x + rect.w - t / 2, rect.y + bh); // floor
    ctx.lineTo(x + rect.w - t / 2, rect.y); // right wall
    ctx.stroke();
    ctx.restore();
  }

  drawBalls(balls) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = 'rgba(255,209,102,0.6)';
    ctx.shadowBlur = 12;
    for (const ball of balls) {
      const x = this.mirror ? this.width - ball.position.x : ball.position.x;
      ctx.beginPath();
      ctx.arc(x, ball.position.y, CONFIG.physics.ballRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Brief celebratory text on catch (PRD §5, §9). */
  drawWellDone(alpha) {
    if (alpha <= 0) return;
    const { ctx, width, height } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffd166';
    ctx.font = '700 64px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 16;
    ctx.fillText('Well done!', width / 2, height / 2);
    ctx.restore();
  }
}
