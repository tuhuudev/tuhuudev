import * as THREE from 'three';

// Text rendered to a canvas and shown as a camera-facing sprite.
export function createLabel(text, { color = '#ffffff', fontSize = 64, height = 0.32, pill = true } = {}) {
  const pad = fontSize * 0.55;
  const font = `600 ${fontSize}px "Space Grotesk", system-ui, sans-serif`;

  const measure = document.createElement('canvas').getContext('2d');
  measure.font = font;
  const width = Math.ceil(measure.measureText(text).width + pad * 2);
  const h = Math.ceil(fontSize * 1.6);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (pill) {
    ctx.fillStyle = 'rgba(12, 12, 24, 0.72)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const r = h / 2 - 3;
    ctx.beginPath();
    ctx.roundRect(3, 3, width - 6, h - 6, r);
    ctx.fill();
    ctx.stroke();
  }

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, h / 2 + fontSize * 0.04);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set((height * width) / h, height, 1);
  sprite.userData.baseScale = sprite.scale.clone();
  return sprite;
}
