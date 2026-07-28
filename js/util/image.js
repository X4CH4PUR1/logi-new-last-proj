/**
 * Client-side image processing for admin uploads.
 *
 * Uploaded photos are downscaled and re-encoded as JPEG data URLs before they
 * go anywhere near storage. A 4 MB phone photo becomes roughly 200 KB, which
 * matters because everything is kept in localStorage (~5 MB total) until it is
 * published into data/content.json.
 */

import { IMAGE_MAX_EDGE, IMAGE_QUALITY } from '../data/config.js';

const ACCEPTED = /^image\/(jpeg|png|webp|gif|avif)$/i;

/**
 * Reads a File, downscales it so the longest edge is at most `maxEdge`, and
 * returns a JPEG data URL.
 *
 * @param {File} file
 * @param {{maxEdge?: number, quality?: number}} [options]
 * @returns {Promise<string>} data URL
 */
export function processImage(file, options = {}) {
  const maxEdge = options.maxEdge ?? IMAGE_MAX_EDGE;
  const quality = options.quality ?? IMAGE_QUALITY;

  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }
    if (!ACCEPTED.test(file.type)) {
      reject(new Error('Please choose a JPEG, PNG, WebP, GIF or AVIF image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        try {
          resolve(drawToDataURL(img, maxEdge, quality));
        } catch (err) {
          reject(err);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function drawToDataURL(img, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');

  // JPEG has no alpha channel; without this, transparent PNGs come out black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}

/** Human-readable size of a data URL, for the admin storage readout. */
export function dataUrlBytes(dataUrl) {
  const comma = String(dataUrl || '').indexOf(',');
  if (comma < 0) return 0;
  return Math.round((dataUrl.length - comma - 1) * 0.75);
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
