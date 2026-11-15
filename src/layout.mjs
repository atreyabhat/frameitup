export const METADATA_FONTS = ['DM Mono', 'Space Mono', 'Courier Prime', 'Barlow Condensed', 'Source Serif 4'];

export const RATIOS = {
  portrait: { label: 'Portrait 3:4', width: 3, height: 4 },
  classic: { label: 'Portrait 4:5', width: 4, height: 5 },
  square: { label: 'Square 1:1', width: 1, height: 1 },
  landscape: { label: 'Landscape 1.91:1', width: 540, height: 283 },
};

export const DEFAULTS = {
  ratio: 'portrait', layout: 'single', style: 'classic-white', border: 5,
  filmBackground: 'black', corners: 0, overview: true, export: 'instagram', jpegQuality: 0.9, instagramReady: true, metadata: false,
  detailX: 0.5, detailY: 0.5, detailZoom: 2,
  metadataMode: 'auto', manual: '', note: '', fontStep: 3, metadataFont: 'DM Mono',
  fields: { camera: true, focal: true, aperture: true, shutter: true, iso: true },
};

const choices = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;

export function sanitizeSettings(value = {}) {
  return {
    ...DEFAULTS,
    ratio: choices(value.ratio, [...Object.keys(RATIOS), 'adaptive'], DEFAULTS.ratio),
    layout: choices(value.layout, ['single', 'detail', '2', '3'], 'single'),
    style: choices(value.style, ['classic-white', 'classic-black', 'average', 'film-35mm'], DEFAULTS.style),
    filmBackground: choices(value.filmBackground, ['white', 'black'], 'black'),
    border: number(value.border, value.style === 'film-35mm' ? 0 : 5, 0, 16), corners: number(value.corners, 0, 0, 25),
    detailX: number(value.detailX, 0.5, 0, 1), detailY: number(value.detailY, 0.5, 0, 1), detailZoom: number(value.detailZoom, 2, 1, 4),
    overview: true, export: choices(value.export, ['native', 'instagram'], DEFAULTS.export),
    jpegQuality: number(value.jpegQuality, 0.9, 0.1, 1),
    instagramReady: value.instagramReady !== false,
    metadata: value.metadata === true, metadataMode: value.metadataMode === 'manual' ? 'manual' : 'auto',
    manual: typeof value.manual === 'string' ? value.manual.slice(0, 1000) : '',
    note: typeof value.note === 'string' ? value.note.slice(0, 200) : '',
    fontStep: number(value.fontStep, 3, 1, 10),
    metadataFont: choices(value.metadataFont, METADATA_FONTS, DEFAULTS.metadataFont),
    fields: Object.fromEntries(Object.keys(DEFAULTS.fields).map(key => [key, value.fields?.[key] !== false])),
  };
}

export function migrateSettings(old = {}) {
  return sanitizeSettings({
    style: old.preset, border: old.borderWidth, corners: old.cornerRadius,
    ratio: old.instagramMode ? old.instagramAspect : 'portrait',
    metadata: old.metadataFooterEnabled, metadataMode: old.fujiExifMode,
    manual: old.fujiManualExifText, note: old.fujiExifFields?.custom ? old.fujiCustomInfo : '',
    fontStep: old.fujiExifFontStep, fields: old.fujiExifFields,
  });
}

export function isFilmPhoto(item, settings) {
  return item.detectedFilm === true || settings.style === 'film-35mm';
}

export function ratioFor(item, settings) {
  if (settings.ratio !== 'adaptive') return RATIOS[settings.ratio];
  const split = !isFilmPhoto(item, settings) && (settings.layout === '2' || settings.layout === '3');
  if (split) return { ...RATIOS.portrait, label: 'Adaptive · 3:4' };
  const frame = settings.style === 'film-35mm' ? filmBox(item.width, item.height) : item;
  const q = frame.width / frame.height;
  if (q < 0.75) return RATIOS.portrait;
  if (q > 540 / 283) return RATIOS.landscape;
  return { width: frame.width, height: frame.height, label: 'Adaptive' };
}

export function frameInsets(q, settings, hasMetadata) {
  let x = settings.border / 100;
  let y = x;
  if (settings.style === 'film-35mm' && q === 1) x = 0;
  const footer = settings.metadata && hasMetadata ? 0.13 : 0;
  return { x, y, footer, innerWidth: 1 - 2 * x, innerHeight: 1 / q - 2 * y - footer };
}

export function planPhoto(item, settings, hasMetadata = false) {
  const ratio = ratioFor(item, settings);
  const q = ratio.width / ratio.height;
  const count = isFilmPhoto(item, settings) || ['single', 'detail'].includes(settings.layout) ? 1 : Number(settings.layout);
  const insets = frameInsets(q, settings, hasMetadata);
  const film = settings.style === 'film-35mm' ? filmBox(item.width, item.height) : null;
  const nativeSize = (needed) => {
    const unit = ratio.label === 'Adaptive' || ratio.width > 4 ? 1 : ratio.width;
    const width = Math.ceil(needed / unit) * unit;
    return { width, height: Math.ceil(width / q) };
  };
  const posting = { width: 1080, height: Math.round(1080 / q) };
  const postingSize = settings.instagramReady;
  const fullSize = postingSize ? posting : nativeSize(Math.max((film?.width || item.width) / insets.innerWidth, (film?.height || item.height) / insets.innerHeight));
  const sliceSize = postingSize ? posting : nativeSize(Math.max(item.width / count, item.height * q));
  const slides = count > 1 ? Array.from({ length: count }, (_, index) => ({ kind: 'slice', index, count, ...sliceSize })) : [];
  if (settings.layout === 'detail') {
    const crop = detailCrop(item, settings, q);
    slides.push({ kind: 'detail', index: 0, count: 1, ...(postingSize ? posting : { width: crop.width, height: crop.height }) });
  }
  slides.unshift({ kind: slides.length === 0 ? 'single' : 'overview', index: 0, count: 1, ...fullSize });
  return { ratio, q, count, slides, insets, film };
}

export function photoRect(item, slide, plan, settings) {
  if (slide.kind === 'detail') {
    const crop = detailCrop(item, settings, plan.q);
    const scale = Math.max(slide.width / crop.width, slide.height / crop.height);
    return { x: Math.floor((slide.width - crop.width * scale) / 2), y: Math.floor((slide.height - crop.height * scale) / 2), width: crop.width * scale, height: crop.height * scale, scale, crop };
  }
  const sliced = slide.kind === 'slice';
  const stripWidth = slide.width * (sliced ? slide.count : 1);
  const area = sliced ? { x: 0, y: 0, width: stripWidth, height: slide.height } : {
    x: plan.insets.x * slide.width, y: plan.insets.y * slide.width,
    width: plan.insets.innerWidth * slide.width, height: plan.insets.innerHeight * slide.width,
  };
  const frame = !sliced && plan.film ? plan.film : item;
  const scale = !settings.instagramReady ? 1 : Math.min(1, area.width / frame.width, area.height / frame.height);
  const width = item.width * scale, height = item.height * scale;
  return { x: Math.floor(area.x + (area.width - width) / 2) - (sliced ? slide.index * slide.width : 0), y: Math.floor(area.y + (area.height - height) / 2), width, height, scale };
}

// Position is normalized over the available travel, so every crop stays in bounds.
export function detailCrop(item, settings, q = ratioFor(item, settings).width / ratioFor(item, settings).height) {
  const width = Math.max(1, Math.floor(Math.min(item.width, item.height * q) / settings.detailZoom));
  const height = Math.max(1, Math.min(item.height, Math.floor(width / q)));
  return { x: Math.round((item.width - width) * settings.detailX), y: Math.round((item.height - height) * settings.detailY), width, height };
}

export function filmBox(width, height) {
  const mm = Math.min(width, height) / 24;
  const vertical = width < height;
  const rail = 5.5 * mm;
  return { width: width + 2 * (vertical ? rail : 0), height: height + 2 * (vertical ? 0 : rail), vertical, mm };
}

export function instagramSettings(settings, item = {}) {
  return sanitizeSettings({ ...settings, instagramReady: true, ratio: isFilmPhoto(item, settings) ? 'square' : 'portrait', layout: 'single', overview: true });
}

export function exportName(fileName, photoIndex, slideIndex, slide, format) {
  const base = fileName.replace(/\.[^.]+$/, '').normalize('NFKC').replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'photo';
  const role = slide.kind === 'detail' ? 'detail' : slide.kind === 'slice' ? `part-${slide.index + 1}-of-${slide.count}` : slide.kind === 'overview' ? 'full' : 'framed';
  return `${String(photoIndex + 1).padStart(2, '0')}_${String(slideIndex + 1).padStart(2, '0')}_${base}_${role}.${format === 'instagram' ? 'jpg' : 'png'}`;
}

export function patchPhotoSettings(items, selectedId, patch, all = false) {
  for (const item of items) if (all || item.id === selectedId) item.settings = sanitizeSettings({ ...item.settings, ...patch });
}


// Copy presentation settings once; each photo retains its camera data and edited text.
export function applySharedSettings(items, selectedId) {
  const source = items.find(item => item.id === selectedId);
  if (!source) return;
  const settings = sanitizeSettings(source.settings);
  const keys = ['ratio','layout','style','filmBackground','border','corners','export','jpegQuality','instagramReady','fontStep','metadataFont'];
  const patch = Object.fromEntries(keys.map(key => [key, settings[key]]));
  patchPhotoSettings(items, selectedId, patch, true);
}

export function aspectRatioLabel(width, height) {
  let a = width, b = height;
  while (b) [a, b] = [b, a % b];
  const w = width / a, h = height / a;
  if (Math.max(w, h) <= 100) return `${w}:${h}`;
  return width >= height ? `≈${(width / height).toFixed(2)}:1` : `≈1:${(height / width).toFixed(2)}`;
}

export function slideKey(slide) {
  return slide.copyId || (slide.kind === 'slice' ? `part-${slide.index}` : slide.kind === 'detail' ? 'detail' : 'full');
}

// Copies retain their own presentation and source layout; sequence edits cannot overwrite them.
export function planSequence(item, settings, hasMetadata = () => false) {
  const plan = planPhoto(item, settings, hasMetadata(settings));
  for (const copy of item.copies || []) {
    const copySettings = sanitizeSettings(copy.settings);
    const isPart = copy.sourceKey.startsWith('part-');
    const copyPlan = planPhoto(isPart ? { ...item, detectedFilm: false } : item, isPart ? { ...copySettings, style: 'classic-white' } : copySettings, hasMetadata(copySettings));
    const source = copyPlan.slides.find(slide => slideKey(slide) === copy.sourceKey) || copyPlan.slides[0];
    const slide = { ...source, copyId: copy.id, ownSettings: copySettings, ownPlan: copyPlan };
    const anchor = plan.slides.findIndex(entry => slideKey(entry) === copy.after);
    plan.slides.splice(anchor < 0 ? plan.slides.length : anchor + 1, 0, slide);
  }
  return plan;
}

export function duplicateSlide(item, slide, settings, id) {
  const copy = { id, after: slideKey(slide), sourceKey: slide.kind === 'slice' ? `part-${slide.index}` : slide.kind === 'detail' ? 'detail' : 'full', settings: structuredClone(slide.ownSettings || settings) };
  (item.copies ||= []).push(copy);
  return copy;
}

export function removeSlideCopy(item, id) {
  const removed = item.copies?.find(copy => copy.id === id);
  if (!removed) return;
  item.copies = item.copies.filter(copy => copy.id !== id);
  for (const copy of item.copies) if (copy.after === id) copy.after = removed.after;
}
