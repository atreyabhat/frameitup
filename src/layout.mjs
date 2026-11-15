export const RATIOS = {
  portrait: { label: 'Portrait 3:4', width: 3, height: 4 },
  classic: { label: 'Portrait 4:5', width: 4, height: 5 },
  square: { label: 'Square 1:1', width: 1, height: 1 },
  landscape: { label: 'Landscape 1.91:1', width: 540, height: 283 },
};

export const DEFAULTS = {
  ratio: 'portrait', layout: 'auto', style: 'classic-white', border: 4,
  filmBackground: 'none', corners: 0, overview: true, export: 'native', instagramReady: false, metadata: false,
  metadataMode: 'auto', manual: '', note: '', fontStep: 3,
  fields: { camera: true, focal: true, aperture: true, shutter: true, iso: true },
};

const choices = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;

export function sanitizeSettings(value = {}) {
  return {
    ...DEFAULTS,
    ratio: choices(value.ratio, [...Object.keys(RATIOS), 'adaptive'], DEFAULTS.ratio),
    layout: choices(value.layout, ['auto', 'single', '2', '3'], 'auto'),
    style: choices(value.style, ['classic-white', 'classic-black', 'average', 'film-35mm'], DEFAULTS.style),
    filmBackground: choices(value.filmBackground, ['none', 'white', 'black'], 'none'),
    border: number(value.border, 4, 0, 16), corners: number(value.corners, 0, 0, 25),
    overview: value.overview !== false, export: choices(value.export, ['native', 'instagram'], 'native'),
    instagramReady: value.instagramReady === true,
    metadata: value.metadata === true, metadataMode: value.metadataMode === 'manual' ? 'manual' : 'auto',
    manual: typeof value.manual === 'string' ? value.manual.slice(0, 1000) : '',
    note: typeof value.note === 'string' ? value.note.slice(0, 200) : '',
    fontStep: number(value.fontStep, 3, 1, 10),
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

export function ratioFor(item, settings) {
  if (settings.ratio !== 'adaptive') return RATIOS[settings.ratio];
  const split = settings.layout === '2' || settings.layout === '3' || (settings.layout === 'auto' && recommendCount(item.width, item.height, 0.75) > 1);
  if (split) return { ...RATIOS.portrait, label: 'Adaptive · 3:4' };
  const frame = settings.style === 'film-35mm' ? filmBox(item.width, item.height) : item;
  const q = frame.width / frame.height;
  if (q < 0.75) return RATIOS.portrait;
  if (q > 540 / 283) return RATIOS.landscape;
  return { width: frame.width, height: frame.height, label: 'Adaptive' };
}

export function recommendCount(width, height, q) {
  if (width <= height) return 1;
  const a = width / height;
  const occupancy = n => Math.min(a / (n * q), n * q / a);
  let best = 1;
  for (const n of [2, 3]) if (occupancy(n) > occupancy(best) + 0.00001) best = n;
  return occupancy(best) - occupancy(1) >= 0.15 ? best : 1;
}

export function frameInsets(q, settings, hasMetadata) {
  let x = settings.border / 100;
  let y = x;
  if (settings.style === 'film-35mm' && settings.filmBackground === 'none') {
    x = y = 0;
  }
  const footer = settings.metadata && hasMetadata ? 0.13 : 0;
  return { x, y, footer, innerWidth: 1 - 2 * x, innerHeight: 1 / q - 2 * y - footer };
}

export function planPhoto(item, settings, hasMetadata = false) {
  const ratio = ratioFor(item, settings);
  const q = ratio.width / ratio.height;
  const count = settings.layout === 'auto' ? recommendCount(item.width, item.height, q) : settings.layout === 'single' ? 1 : Number(settings.layout);
  const insets = frameInsets(q, settings, hasMetadata);
  const film = settings.style === 'film-35mm' ? filmBox(item.width, item.height) : null;
  const nativeSize = (needed) => {
    const unit = ratio.label === 'Adaptive' || ratio.width > 4 ? 1 : ratio.width;
    const width = Math.ceil(needed / unit) * unit;
    return { width, height: Math.ceil(width / q) };
  };
  const posting = { width: 1080, height: Math.round(1080 / q) };
  const postingSize = settings.export === 'instagram' || settings.instagramReady;
  const fullSize = postingSize ? posting : nativeSize(Math.max((film?.width || item.width) / insets.innerWidth, (film?.height || item.height) / insets.innerHeight));
  const sliceSize = postingSize ? posting : nativeSize(Math.max(item.width / count, item.height * q));
  const slides = count > 1 ? Array.from({ length: count }, (_, index) => ({ kind: 'slice', index, count, ...sliceSize })) : [];
  if (count === 1 || settings.overview) slides.unshift({ kind: count === 1 ? 'single' : 'overview', index: 0, count: 1, ...fullSize });
  return { ratio, q, count, slides, insets, film };
}

export function photoRect(item, slide, plan, settings) {
  const sliced = slide.kind === 'slice';
  const stripWidth = slide.width * (sliced ? slide.count : 1);
  const area = sliced ? { x: 0, y: 0, width: stripWidth, height: slide.height } : {
    x: plan.insets.x * slide.width, y: plan.insets.y * slide.width,
    width: plan.insets.innerWidth * slide.width, height: plan.insets.innerHeight * slide.width,
  };
  const frame = !sliced && plan.film ? plan.film : item;
  const scale = settings.export === 'native' && !settings.instagramReady ? 1 : Math.min(1, area.width / frame.width, area.height / frame.height);
  const width = item.width * scale, height = item.height * scale;
  return { x: Math.floor(area.x + (area.width - width) / 2) - (sliced ? slide.index * slide.width : 0), y: Math.floor(area.y + (area.height - height) / 2), width, height, scale };
}

export function filmBox(width, height) {
  const mm = Math.min(width, height) / 24;
  const vertical = width < height;
  const rail = 5.5 * mm, end = 0.85 * mm;
  return { width: width + 2 * (vertical ? rail : end), height: height + 2 * (vertical ? end : rail), vertical, mm };
}

export function instagramSettings(settings) {
  return sanitizeSettings({ ...settings, instagramReady: true, ratio: 'portrait', layout: 'auto', overview: true });
}

export function exportName(fileName, photoIndex, slideIndex, slide, format) {
  const base = fileName.replace(/\.[^.]+$/, '').normalize('NFKC').replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'photo';
  const role = slide.kind === 'slice' ? `part-${slide.index + 1}-of-${slide.count}` : slide.kind === 'overview' ? 'full' : 'framed';
  return `${String(photoIndex + 1).padStart(2, '0')}_${String(slideIndex + 1).padStart(2, '0')}_${base}_${role}.${format === 'instagram' ? 'jpg' : 'png'}`;
}
