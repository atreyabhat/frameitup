import { photoRect } from './layout.mjs?v=5';
import { metadataLine, fitExifToLines } from './metadata.mjs?v=5';
import { drawFilm } from './film.mjs?v=5';

export function backgroundFor(item, settings) {
  if (settings.style === 'film-35mm') return settings.filmBackground === 'white' ? '#ffffff' : settings.filmBackground === 'black' ? '#111110' : '#171410';
  if (settings.style === 'classic-black') return '#111110';
  return settings.style === 'average' ? item.average || '#c4bba6' : '#ffffff';
}

export async function renderSlide(item, slide, plan, settings, previewWidth = null) {
  if (!previewWidth && (slide.width > 16384 || slide.height > 16384 || slide.width * slide.height > 64000000)) {
    throw new Error('This full-resolution canvas is too large for a reliable browser export. Choose a 1080 px format or use a smaller source.');
  }
  if (document.fonts) await document.fonts.ready;
  const scale = previewWidth ? Math.min(1, previewWidth / slide.width) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(slide.width * scale));
  canvas.height = Math.max(1, Math.round(slide.height * scale));
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
  if (!ctx) throw new Error('The browser could not create this canvas. Try exporting one photograph at a time.');
  ctx.scale(canvas.width / slide.width, canvas.height / slide.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = backgroundFor(item, settings);
  ctx.fillRect(0, 0, slide.width, slide.height);
  const rect = photoRect(item, slide, plan, settings);
  ctx.save();
  if (slide.kind !== 'slice' && settings.corners > 0) {
    const r = Math.min(rect.width, rect.height) * settings.corners / 100;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, r);
    ctx.clip();
  }
  // Every viewport uses the same source transform; interior seams never get a frame.
  ctx.drawImage(item.image, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
  if (slide.kind !== 'slice') {
    if (settings.style === 'film-35mm') drawFilm(ctx, rect, plan.film, backgroundFor(item, settings), item.filmSeed || 0);
    if (plan.insets.footer) {
      const y = slide.height - plan.insets.footer * slide.width;
      const dark = settings.style === 'classic-black' || (settings.style === 'film-35mm' && settings.filmBackground !== 'white');
      ctx.fillStyle = dark ? '#111110' : backgroundFor(item, settings);
      ctx.fillRect(0, y, slide.width, slide.height - y);
      const pad = slide.width * 0.04;
      let left = pad;
      ctx.fillStyle = dark ? '#ffffff' : '#24211b';
      ctx.font = `500 ${(16 + (settings.fontStep - 1) * 26 / 9) * slide.width / 1080}px sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      const lines = fitExifToLines(ctx, metadataLine(item, settings), slide.width - pad - left, 2);
      const lineHeight = slide.width * 0.035;
      ctx.save(); ctx.beginPath(); ctx.rect(left, y, slide.width - pad - left, slide.height - y); ctx.clip();
      lines.forEach((line, i) => ctx.fillText(line, slide.width - pad, y + (slide.height - y) / 2 + (i - (lines.length - 1) / 2) * lineHeight));
      ctx.restore();
    }
  }
  return canvas;
}

export function encodeCanvas(canvas, type, quality = 0.9) {
  const mime = type === 'instagram' ? 'image/jpeg' : 'image/png';
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (!blob || blob.type !== mime) reject(new Error('Your browser could not encode the selected format. Try another browser.'));
    else resolve(blob);
  }, mime, quality));
}
