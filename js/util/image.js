window.Logi = window.Logi || {};
Logi.util = Logi.util || {};
Logi.util.image = (function () {

  const { IMAGE_MAX_EDGE, IMAGE_QUALITY } = Logi.data.config;
  const ACCEPTED = /^image\/(jpeg|png|webp|gif|avif)$/i;

  function processImage(file, options = {}) {
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

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', quality);
  }

  function dataUrlBytes(dataUrl) {
    const comma = String(dataUrl || '').indexOf(',');
    if (comma < 0) return 0;
    return Math.round((dataUrl.length - comma - 1) * 0.75);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return { processImage, dataUrlBytes, formatBytes };
})();
