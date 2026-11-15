import { METADATA_FONTS, DEFAULTS, sanitizeSettings, migrateSettings, planPhoto, exportName, photoRect, instagramSettings, patchPhotoSettings, isFilmPhoto, applySharedSettings, aspectRatioLabel, detailCrop, planSequence, slideKey, duplicateSlide, removeSlideCopy } from './layout.mjs?v=11';
import { parseExifFromFile, metadataLine, hasCameraMetadata, importSettings } from './metadata.mjs?v=11';
import { renderSlide, encodeCanvas } from './render.mjs?v=11';

const $ = id => document.getElementById(id);
// Native selects can match :focus-visible after mouse clicks; track input intent.
document.documentElement.dataset.input = 'pointer';
document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, true);
document.addEventListener('keydown', event => {
  if (event.key === 'Tab' || event.key.startsWith('Arrow')) document.documentElement.dataset.input = 'keyboard';
}, true);
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private browsing may disable preference storage. */ } },
};
function loadPreferences() {
  try {
    const current = storage.get('frameitup.settings.v4');
    return current ? sanitizeSettings(JSON.parse(current)) : sanitizeSettings();
  } catch { return sanitizeSettings(); }
}
let preferences = loadPreferences();
const state = { items: [], selected: null, slide: 0, copyId: null, revision: 0, timer: null, exporting: false, outputs: [], lastView: null, motion: null };
const selected = () => state.items.find(item => item.id === state.selected);
const settingsFor = item => sanitizeSettings(item.settings);
const planFor = (item, settings = settingsFor(item)) => planSequence(item, settings, value => Boolean(metadataLine(item, value)));
const selectedCopy = () => selected()?.copies?.find(copy => copy.id === state.copyId);
const editingSettings = () => selectedCopy() ? sanitizeSettings(selectedCopy().settings) : selected() ? settingsFor(selected()) : preferences;
function chooseSlide(index) {
  const slides = planFor(selected()).slides;
  state.slide = Math.max(0, Math.min(index, slides.length - 1));
  state.copyId = slides[state.slide]?.copyId || null;
}
const el = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
function setStatus(message, error = false) {
  $('status').textContent = message;
  $('status').parentElement.classList.toggle('error', error);
}
function savePreferences() { storage.set('frameitup.settings.v4', JSON.stringify(preferences)); }

function invalidateOutputs() {
  for (const output of state.outputs) URL.revokeObjectURL(output.url);
  state.outputs = [];
  $('results').hidden = true;
  $('result-list').replaceChildren();
}

function updateSetting(key, value) {
  if (state.exporting) return;
  const item = selected();
  const current = editingSettings();
  const patch = { [key]: value };
  if (key === 'style' && value === 'film-35mm' && current.style !== value) { patch.ratio = 'square'; patch.border = 0; }
  if (key === 'style' && value !== 'film-35mm' && current.style === 'film-35mm') patch.border = 5;
  if (key === 'manual') patch.metadataMode = 'manual';
  if (selectedCopy()) selectedCopy().settings = sanitizeSettings({ ...current, ...patch });
  else {
    preferences = sanitizeSettings({ ...preferences, ...patch });
    patchPhotoSettings(state.items, state.selected, patch);
    savePreferences();
  }
  invalidateOutputs();
  syncControls();
  requestPreview();
}

for (const family of METADATA_FONTS) {
  const option = el('option', '', family); option.value = family; $('metadata-font').append(option);
}

const controlMap = {
  'detail-zoom': ['detailZoom'], ratio: ['ratio'], 'film-background': ['filmBackground'], border: ['border'], corners: ['corners'],
  metadata: ['metadata'], 'manual-metadata': ['manual'],
  'metadata-font': ['metadataFont'], 'font-step': ['fontStep'], 'export-type': ['export'],
};
for (const [id, [key]] of Object.entries(controlMap)) {
  const input = $(id);
  input.addEventListener(input.tagName === 'TEXTAREA' || input.type === 'range' || input.type === 'number' || input.type === 'text' ? 'input' : 'change', () => {
    updateSetting(key, input.type === 'checkbox' ? input.checked : input.type === 'range' || input.type === 'number' ? Number(input.value) : input.value);
  });
}
document.querySelectorAll('[data-layout]').forEach(button => button.addEventListener('click', () => {
  state.copyId = null; updateSetting('layout', button.dataset.layout);
  if (selected()) {
    const slides = planFor(selected()).slides;
    chooseSlide(button.dataset.layout === 'detail' ? slides.findIndex(slide => slide.kind === 'detail' && !slide.copyId) : 0);
  }
}));
document.querySelectorAll('[data-style]').forEach(button => button.addEventListener('click', () => updateSetting('style', button.dataset.style)));
$('apply-settings').addEventListener('click', () => {
  if (!selected() || state.exporting) return;
  applySharedSettings(state.items, state.selected);
  invalidateOutputs(); syncControls(); requestPreview();
  setStatus('Settings applied to all photos. Further edits affect only the selected photo.');
});

$('auto-format').addEventListener('change', () => {
  if (state.exporting) return;
  const current = editingSettings();
  const instagram = $('auto-format').value === 'instagram';
  const next = instagram ? instagramSettings(current, selected()) : sanitizeSettings({ ...current, instagramReady: false });
  if (selectedCopy()) selectedCopy().settings = sanitizeSettings({ ...next, layout: current.layout });
  else {
    preferences = next;
    if (selected()) selected().settings = structuredClone(preferences);
    savePreferences(); state.slide = 0;
  }
  invalidateOutputs();
  syncControls(); requestPreview();
});
$('export-all').addEventListener('change', () => { invalidateOutputs(); syncControls(); });

function syncControls() {
  const item = selected();
  const settings = editingSettings();
  for (const [id, [key]] of Object.entries(controlMap)) {
    if ($(id).type === 'checkbox') $(id).checked = settings[key]; else $(id).value = settings[key];
  }
  $('layout-options').hidden = $('layout-label').hidden = Boolean(selectedCopy());
  const film = item ? isFilmPhoto(item, settings) : settings.style === 'film-35mm';
  const layout = film && ['2', '3'].includes(settings.layout) ? 'single' : settings.layout;
  document.querySelectorAll('[data-layout]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.layout === layout));
    button.disabled = film && ['2', '3'].includes(button.dataset.layout);
  });
  document.querySelectorAll('[data-style]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.style === settings.style)));
  $('border-value').value = String(settings.border);
  $('corners-value').value = `${settings.corners}%`;
  $('font-value').value = String(settings.fontStep);
  const available = hasCameraMetadata(item?.exif);
  $('metadata').disabled = !available;
  $('metadata-hint').hidden = !item || available;
  $('metadata-controls').hidden = !settings.metadata || !available;
  if (item && settings.metadataMode === 'auto') $('manual-metadata').value = metadataLine(item, { ...settings, manual: '', note: '' });
  $('film-background-control').hidden = settings.style !== 'film-35mm';
  $('corners-row').hidden = settings.style === 'film-35mm';
  const displayed = item ? planFor(item).slides.find(slide => slide.copyId === state.copyId && state.copyId) : null;
  $('panel-frame').hidden = Boolean(displayed && ['slice', 'detail'].includes(displayed.kind));
  $('jpeg-quality').value = Math.round(settings.jpegQuality * 100);
  $('jpeg-quality').style.setProperty('--quality-fill', `${(Math.round(settings.jpegQuality * 100) - 10) / 90 * 100}%`);
  $('jpeg-quality').disabled = settings.export === 'native';
  $('jpeg-quality-value').value = settings.export === 'native' ? '—' : `${Math.round(settings.jpegQuality * 100)}%`;
  $('quality-description').textContent = `${settings.export === 'native' ? 'PNG · Lossless' : 'JPG'} · ${settings.instagramReady ? '1080 px' : 'Source resolution'} · sRGB`;
  $('auto-format').value = settings.instagramReady ? 'instagram' : 'custom';
  $('auto-format').disabled = !item || state.exporting;
  $('ratio-hint').hidden = settings.ratio !== 'adaptive';
  $('scope-row').hidden = state.items.length < 2;
  const targets = $('export-all').checked ? state.items : item ? [item] : [];
  const count = targets.reduce((sum, entry) => sum + planFor(entry).slides.length, 0);
  $('export-count').textContent = `${targets.length} photo${targets.length === 1 ? '' : 's'} · ${count} slide${count === 1 ? '' : 's'}`;
  $('export-button').disabled = !count || state.exporting;
  $('export-current').disabled = !item || state.exporting;
  $('remove-photo').disabled = !item || state.exporting;
  $('previous-photo').disabled = !item || state.items.indexOf(item) === 0 || state.exporting;
  $('next-photo').disabled = !item || state.items.indexOf(item) === state.items.length - 1 || state.exporting;
  $('apply-settings').hidden = state.items.length < 2 || Boolean(selectedCopy());
  $('apply-settings').disabled = !item || state.exporting;
  $('library').hidden = !state.items.length;
}

function renderLibrary() {
  const focusedId = document.activeElement?.closest('.photo-item')?.dataset.photoId;
  $('photo-list').replaceChildren();
  $('photo-count').textContent = state.items.length;
  state.items.forEach((item, index) => {
    const button = el('button', 'photo-item');
    button.dataset.photoId = item.id;
    button.setAttribute('aria-pressed', String(item.id === state.selected));
    button.setAttribute('aria-label', `Select ${item.name}`);
    const img = el('img', 'photo-thumb'); img.src = item.thumbnail; img.alt = '';
    button.append(img, el('span', 'photo-item-name', item.name));
    button.addEventListener('click', () => {
      state.selected = item.id; state.slide = 0; state.copyId = null;
      renderLibrary(); syncControls(); requestPreview();
    });
    $('photo-list').append(button);
    if (focusedId === item.id) button.focus({ preventScroll: true });
  });
}

function copyCanvas(source, target) {
  target.width = source.width; target.height = source.height;
  target.getContext('2d', { colorSpace: 'srgb' }).drawImage(source, 0, 0);
}
function requestPreview(delay = 80) {
  if (delay === 16 && state.timer) return;
  const revision = ++state.revision;
  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    state.timer = null;
    renderPreview(revision).catch(error => {
      if (revision === state.revision) setStatus(`Preview failed: ${error.message}`, true);
    });
  }, delay);
}

async function renderPreview(revision) {
  const item = selected();
  $('empty-state').hidden = Boolean(item);
  $('preview-mat').hidden = !item;
  $('workspace').dataset.empty = String(!item);
  $('sequence-heading').hidden = $('slide-strip').hidden = !item;
  $('quality-warning').hidden = true;
  if (!item) {
    $('crop-editor').hidden = true; $('preview-stage').classList.remove('editing-detail');
    $('photo-title').textContent = 'Your photograph'; $('source-ratio').textContent = ''; $('source-info').textContent = 'Add a photograph to start framing.';
    $('slide-strip').replaceChildren(); $('output-dimensions').textContent = '—'; $('slide-description').textContent = 'No photo selected';
    $('sequence-summary').textContent = '0 slides';
    $('previous-slide').disabled = $('next-slide').disabled = true;
    return;
  }
  const sequence = planFor(item);
  const copiedIndex = sequence.slides.findIndex(slide => slide.copyId === state.copyId);
  if (state.copyId && copiedIndex >= 0) state.slide = copiedIndex;
  const plan = sequence;
  state.slide = Math.max(0, Math.min(state.slide, plan.slides.length - 1));
  const index = state.slide, slide = plan.slides[index];
  state.copyId = slide.copyId || null;
  const settings = structuredClone(slide.ownSettings || settingsFor(item));
  const renderPlan = slide.ownPlan || plan;
  const view = await renderSlide(item, slide, renderPlan, settings, 900);
  if (revision !== state.revision) return;
  copyCanvas(view, $('main-canvas'));
  const editingDetail = slide.kind === 'detail';
  $('crop-editor').hidden = !editingDetail;
  $('preview-stage').classList.toggle('editing-detail', editingDetail);
  if (editingDetail) {
    const original = $('crop-original');
    if (original.dataset.photo !== item.id) {
      const scale = Math.min(1, 1200 / Math.max(item.width, item.height));
      original.width = Math.round(item.width * scale); original.height = Math.round(item.height * scale);
      original.getContext('2d').drawImage(item.image, 0, 0, original.width, original.height);
      original.dataset.photo = item.id;
    }
    positionCrop();
  }
  const viewKey = `${item.id}:${slideKey(slide)}`;
  if (state.lastView !== viewKey && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state.motion?.cancel();
    state.motion = $('main-canvas').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
  }
  state.lastView = viewKey;
  $('main-canvas').setAttribute('aria-label', `${item.name}, ${slide.kind === 'detail' ? 'detail crop' : slide.kind === 'slice' ? `continuous part ${slide.index + 1} of ${slide.count}` : 'full framed photograph'}`);
  $('photo-title').textContent = item.name;
  $('source-ratio').textContent = aspectRatioLabel(item.width, item.height);
  $('source-info').textContent = `${item.width} × ${item.height} px · ${item.width > item.height ? 'Landscape' : item.width < item.height ? 'Portrait' : 'Square'}`;
  $('output-dimensions').textContent = `${slide.width} × ${slide.height} px`;
  $('slide-description').textContent = (slide.kind === 'detail' ? 'Detail' : slide.kind === 'slice' ? `Part ${slide.index + 1} of ${slide.count}` : 'Full photo') + (slide.copyId ? ' · copy' : '');
  $('sequence-summary').textContent = `${plan.slides.length} slide${plan.slides.length === 1 ? '' : 's'} · ${renderPlan.ratio.label.replace('Portrait ', '')}`;
  const sourceScale = photoRect(item, slide, renderPlan, settings).scale;
  const lowResolution = settings.instagramReady && (slide.kind === 'detail' ? sourceScale > 1 : sourceScale === 1);
  $('quality-warning').hidden = !lowResolution;
  $('quality-warning').textContent = lowResolution ? (slide.kind === 'detail' ? 'This crop is below output resolution. Reduce zoom for more detail.' : 'Small source: padding added to avoid enlargement.') : '';
  $('previous-slide').disabled = index === 0;
  $('next-slide').disabled = index === plan.slides.length - 1;
  const fragment = document.createDocumentFragment();
  for (const [i, entry] of plan.slides.entries()) {
    const tile = el('div', 'slide-item');
    const button = el('button', `slide-tile${entry.kind === 'overview' ? ' overview' : ''}`);
    button.dataset.slideIndex = String(i);
    button.setAttribute('aria-pressed', String(i === index));
    button.setAttribute('aria-label', `Show slide ${i + 1}, ${entry.kind === 'detail' ? 'detail crop' : entry.kind === 'slice' ? `part ${entry.index + 1}` : 'full photograph'}${entry.copyId ? ', copy' : ''}`);
    const canvas = await renderSlide(item, entry, entry.ownPlan || plan, entry.ownSettings || settingsFor(item), 160);
    if (revision !== state.revision) return;
    button.append(canvas, el('span', '', `${String(i + 1).padStart(2, '0')} · ${entry.kind === 'detail' ? 'Detail' : entry.kind === 'slice' ? `Part ${entry.index + 1}` : 'Full photo'}`));
    button.addEventListener('click', () => { chooseSlide(i); syncControls(); requestPreview(); });
    const actions = el('div', 'slide-actions');
    const duplicate = el('button', 'slide-action');
    duplicate.setAttribute('aria-label', `Duplicate slide ${i + 1}`); duplicate.title = 'Duplicate slide';
    duplicate.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></svg>';
    duplicate.addEventListener('click', () => {
      const copy = duplicateSlide(item, entry, settingsFor(item), crypto.randomUUID());
      state.copyId = copy.id; state.newCopy = copy.id;
      invalidateOutputs(); syncControls(); requestPreview(); setStatus('Slide duplicated. Edits to this copy stay separate.');
    });
    actions.append(duplicate);
    if (entry.copyId) {
      const remove = el('button', 'slide-action'); remove.setAttribute('aria-label', `Remove slide ${i + 1} copy`); remove.title = 'Remove copy';
      remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>';
      remove.addEventListener('click', () => {
        removeSlideCopy(item, entry.copyId); chooseSlide(Math.max(0, i - 1));
        invalidateOutputs(); syncControls(); requestPreview(); setStatus('Slide copy removed.');
      }); actions.append(remove);
    }
    tile.dataset.copyId = entry.copyId || ''; tile.append(button, actions); fragment.append(tile);
  }
  const focusedSlide = document.activeElement?.closest('.slide-tile')?.dataset.slideIndex;
  $('slide-strip').replaceChildren(fragment);
  if (focusedSlide !== undefined) {
    const nextFocus = Math.min(Number(focusedSlide), plan.slides.length - 1);
    $('slide-strip').children[nextFocus]?.querySelector('.slide-tile')?.focus({ preventScroll: true });
  }
  if (state.newCopy) {
    const added = [...$('slide-strip').children].find(tile => tile.dataset.copyId === state.newCopy);
    if (added && !matchMedia('(prefers-reduced-motion: reduce)').matches) added.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 200, easing: 'ease-out' });
    added?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    added?.querySelector('.slide-tile')?.focus({ preventScroll: true }); state.newCopy = null;
  }
  syncControls();
}

for (const [id, direction] of [['previous-slide', -1], ['next-slide', 1]]) $(id).addEventListener('click', () => {
  const item = selected();
  if (!item) return;
  chooseSlide(state.slide + direction);
  syncControls(); requestPreview();
});
let touchStart = null;
$('preview-stage').addEventListener('touchstart', event => { touchStart = event.target.closest('.crop-editor') ? null : event.touches[0].clientX; }, { passive: true });
$('preview-stage').addEventListener('touchend', event => {
  if (touchStart === null) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  touchStart = null;
  const button = $(delta < 0 ? 'next-slide' : 'previous-slide');
  if (Math.abs(delta) > 45 && !button.disabled) button.click();
}, { passive: true });
$('workspace').addEventListener('keydown', event => {
  if (event.target.closest('input,textarea,select,.photo-actions,.crop-editor')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const button = $(event.key === 'ArrowRight' ? 'next-slide' : 'previous-slide');
    if (!button.disabled) { event.preventDefault(); button.click(); }
  }
});

// Crop controls operate in original-image coordinates, independent of preview size.
function positionCrop() {
  const item = selected();
  if (!item || $('crop-editor').hidden) return;
  const settings = editingSettings(), crop = detailCrop(item, settings);
  const area = $('crop-area').getBoundingClientRect();
  const scale = Math.min(area.width / item.width, area.height / item.height);
  const surface = $('crop-surface');
  surface.style.width = `${item.width * scale}px`; surface.style.height = `${item.height * scale}px`;
  const rectangle = $('crop-rectangle');
  Object.assign(rectangle.style, { left: `${crop.x / item.width * 100}%`, top: `${crop.y / item.height * 100}%`, width: `${crop.width / item.width * 100}%`, height: `${crop.height / item.height * 100}%` });
}
new ResizeObserver(positionCrop).observe($('crop-area'));
function moveCrop(x, y) {
  if (!selected() || state.exporting) return;
  if (selectedCopy()) selectedCopy().settings = sanitizeSettings({ ...selectedCopy().settings, detailX: x, detailY: y });
  else patchPhotoSettings(state.items, state.selected, { detailX: x, detailY: y });
  invalidateOutputs(); positionCrop(); requestPreview(16);
}
let cropDrag = null;
$('crop-rectangle').addEventListener('pointerdown', event => {
  if (event.button !== 0 || state.exporting) return;
  const item = selected(), settings = editingSettings(), crop = detailCrop(item, settings);
  const bounds = $('crop-surface').getBoundingClientRect();
  cropDrag = { pointer: event.pointerId, id: item.id, x: event.clientX, y: event.clientY, startX: settings.detailX, startY: settings.detailY, travelX: bounds.width * (1 - crop.width / item.width), travelY: bounds.height * (1 - crop.height / item.height) };
  event.currentTarget.setPointerCapture(event.pointerId);
  event.currentTarget.classList.add('dragging');
  event.preventDefault(); event.currentTarget.focus({ preventScroll: true });
});
$('crop-rectangle').addEventListener('pointermove', event => {
  if (!cropDrag || cropDrag.pointer !== event.pointerId || cropDrag.id !== state.selected) return;
  moveCrop(cropDrag.startX + (cropDrag.travelX ? (event.clientX - cropDrag.x) / cropDrag.travelX : 0), cropDrag.startY + (cropDrag.travelY ? (event.clientY - cropDrag.y) / cropDrag.travelY : 0));
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('crop-rectangle').addEventListener(type, () => {
  cropDrag = null; $('crop-rectangle').classList.remove('dragging');
});
$('crop-rectangle').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const settings = editingSettings(), step = event.shiftKey ? 0.1 : 0.01;
  moveCrop(settings.detailX + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), settings.detailY + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0));
});
$('center-crop').addEventListener('click', () => moveCrop(0.5, 0.5));

async function decodeFile(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: use an edited JPEG, PNG, or WebP. Convert HEIC, RAW, or HDR files in your photo editor first.`);
  const url = URL.createObjectURL(file);
  const image = new Image(); image.src = url;
  try {
    await image.decode();

    const item = { id: crypto.randomUUID(), name: file.name, file, image, width: image.naturalWidth, height: image.naturalHeight, settings: structuredClone(preferences.instagramReady ? { ...preferences, layout: 'single', overview: true } : preferences), thumbnail: '', average: '#c4bba6', exif: null };
    const canvas = document.createElement('canvas');
    const thumbnailScale = 180 / Math.max(item.width, item.height);
    canvas.width = Math.max(1, Math.round(item.width * thumbnailScale));
    canvas.height = Math.max(1, Math.round(item.height * thumbnailScale));
    const ctx = canvas.getContext('2d', { colorSpace: 'srgb' }); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    item.thumbnail = canvas.toDataURL('image/jpeg', 0.85);
    canvas.width = canvas.height = 1; ctx.drawImage(image, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    item.average = `rgb(${r}, ${g}, ${b})`;
    if (item.width * item.height > 24000000 && window.createImageBitmap) {
      const scale = Math.min(1, 4320 / Math.max(item.width, item.height));
      item.image = await createImageBitmap(file, { resizeWidth: Math.max(1, Math.round(item.width * scale)), resizeHeight: Math.max(1, Math.round(item.height * scale)), resizeQuality: 'high' });
      item.workingCopy = true; image.src = '';
    }
    item.exif = await parseExifFromFile(file);
    item.detectedFilm = !hasCameraMetadata(item.exif);
    item.settings = importSettings(item.exif, item.settings);
    item.filmSeed = crypto.getRandomValues(new Uint32Array(1))[0];
    return item;
  } finally { URL.revokeObjectURL(url); }
}

let importing = false;
async function addFiles(files) {
  if (state.exporting || importing) return;
  importing = true;
  $('add-photos').disabled = true;
  invalidateOutputs();
  const failures = [];
  try {
    for (const [index, file] of Array.from(files).entries()) {
      setStatus(`Reading photograph ${index + 1} of ${files.length}…`);
      try {
        const item = await decodeFile(file);
        state.items.push(item); state.selected = item.id; state.slide = 0; state.copyId = null;
        renderLibrary(); syncControls(); requestPreview();
      } catch (error) { failures.push(error.message); }
    }
  } finally {
    importing = false; $('add-photos').disabled = false;
    if (!state.items.some(item => item.id === state.selected)) state.selected = state.items[0]?.id || null;
    renderLibrary(); syncControls(); requestPreview();
    setStatus(failures.length ? failures.join(' ') : `${state.items.length} photograph${state.items.length === 1 ? '' : 's'} ready.`, failures.length > 0);
  }
}

$('add-photos').addEventListener('click', () => $('file-input').click());
$('file-input').addEventListener('change', event => { const files = Array.from(event.target.files); event.target.value = ''; addFiles(files); });
let dragDepth = 0;
document.addEventListener('dragenter', event => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); dragDepth++; if (!state.exporting) $('drop-overlay').hidden = false; } });
document.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('Files')) event.preventDefault(); });
document.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('drop-overlay').hidden = true; } });
document.addEventListener('drop', event => { event.preventDefault(); dragDepth = 0; $('drop-overlay').hidden = true; if (event.dataTransfer?.files.length) addFiles(Array.from(event.dataTransfer.files)); });

$('remove-photo').addEventListener('click', () => {
  const index = state.items.findIndex(item => item.id === state.selected);
  if (selected()?.workingCopy) selected().image.close();
  state.items.splice(index, 1); state.selected = state.items[Math.min(index, state.items.length - 1)]?.id || null; state.slide = 0; state.copyId = null;
  invalidateOutputs(); renderLibrary(); syncControls(); requestPreview(); setStatus('Photograph removed from this session.');
});
for (const [id, direction] of [['previous-photo', -1], ['next-photo', 1]]) $(id).addEventListener('click', () => {
  const index = state.items.findIndex(item => item.id === state.selected), destination = index + direction;
  if (destination < 0 || destination >= state.items.length) return;
  state.selected = state.items[destination].id; state.slide = 0; state.copyId = null;
  renderLibrary(); syncControls(); requestPreview();
  const active = $('photo-list').querySelector('[aria-pressed=true]');
  if (active) {
    const scroll = active.closest('.library-scroll');
    const row = active.getBoundingClientRect(), bounds = scroll.getBoundingClientRect();
    if (row.top < bounds.top) scroll.scrollTop += row.top - bounds.top;
    else if (row.bottom > bounds.bottom) scroll.scrollTop += row.bottom - bounds.bottom;
  }
});

function download(blob, name) {
  const url = URL.createObjectURL(blob), link = el('a'); link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function exportFiles(currentOnly = false) {
  if (state.exporting || !selected()) return;
  const targets = currentOnly || !$('export-all').checked ? [selected()] : [...state.items];
  const snapshot = targets.map(item => ({ item, settings: structuredClone(settingsFor(item)) }));
  const jobs = snapshot.flatMap(({ item, settings }, photoIndex) => {
    const plan = planFor(item, settings);
    return plan.slides.flatMap((slide, slideIndex) => currentOnly && slideIndex !== state.slide ? [] : [{ item, settings: slide.ownSettings || settings, plan: slide.ownPlan || plan, slide, name: exportName(item.name, photoIndex, slideIndex, slide, (slide.ownSettings || settings).export) }]);
  });
  state.exporting = true; state.revision++; clearTimeout(state.timer); invalidateOutputs();
  $('editor').inert = true; $('editor').setAttribute('aria-busy', 'true'); $('add-photos').disabled = true;
  const failures = [];
  try {
    for (const [index, job] of jobs.entries()) {
      setStatus(`Rendering ${index + 1} of ${jobs.length}: ${job.name}`);
      try {
        let original;
        let canvas;
        try {
          if (job.item.workingCopy && (!job.settings.instagramReady || job.slide.kind === 'detail')) original = await createImageBitmap(job.item.file);
          canvas = await renderSlide(original ? { ...job.item, image: original } : job.item, job.slide, job.plan, job.settings);
        } finally { original?.close(); }
        const blob = await encodeCanvas(canvas, job.settings.export, job.settings.jpegQuality);
        canvas.width = canvas.height = 1;
        state.outputs.push({ name: job.name, blob, url: URL.createObjectURL(blob), width: job.slide.width, height: job.slide.height });
      } catch (error) { failures.push(`${job.name}: ${error.message}`); }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (!state.outputs.length) throw new Error(failures.join(' ') || 'No files could be exported.');
    const results = $('result-list');
    for (const output of state.outputs) {
      const a = el('a', 'result-link', output.name); a.href = output.url; a.download = output.name;
      a.append(el('span', '', `${output.width} × ${output.height} · ${(output.blob.size / 1024 / 1024).toFixed(1)} MB`)); results.append(a);
    }
    $('results').hidden = false;
    if (state.outputs.length === 1) download(state.outputs[0].blob, state.outputs[0].name);
    else {
      try {
        if (!window.JSZip) throw new Error('ZIP library unavailable');
        setStatus('Preparing the numbered carousel ZIP…');
        const zip = new window.JSZip(); state.outputs.forEach(output => zip.file(output.name, output.blob));
        const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        download(blob, 'frame-it-up_carousel.zip');
      } catch { failures.push('ZIP could not be created. Download the individual files below.'); }
    }
    setStatus(failures.length ? `${state.outputs.length} files available. ${failures.join(' ')}` : `${state.outputs.length} file${state.outputs.length === 1 ? '' : 's'} exported.`, failures.length > 0);
  } catch (error) { setStatus(error.message, true); }
  finally {
    state.exporting = false; $('editor').inert = false; $('editor').removeAttribute('aria-busy'); $('add-photos').disabled = false; syncControls(); requestPreview();
  }
}
$('export-button').addEventListener('click', () => exportFiles());
$('export-current').addEventListener('click', () => exportFiles(true));
$('close-results').addEventListener('click', () => { invalidateOutputs(); $('export-button').focus({ preventScroll: true }); });
syncControls();
requestPreview();
setStatus('Add your photographs to begin.');

$('jpeg-quality').addEventListener('input', () => updateSetting('jpegQuality', Number($('jpeg-quality').value) / 100));
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
  const input = $(button.dataset.step);
  if (button.dataset.delta === '1') input.stepUp(); else input.stepDown();
  input.dispatchEvent(new Event('input', { bubbles: true }));
}));

const inspectorTabs = [...document.querySelectorAll('[data-panel]')];
function showPanel(tab) {
  for (const button of inspectorTabs) {
    const active = button === tab;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    $(`panel-${button.dataset.panel}`).hidden = !active;
  }
}
for (const [index, tab] of inspectorTabs.entries()) {
  tab.addEventListener('click', () => showPanel(tab));
  tab.addEventListener('keydown', event => {
    const next = event.key === 'ArrowRight' ? (index + 1) % inspectorTabs.length : event.key === 'ArrowLeft' ? (index + inspectorTabs.length - 1) % inspectorTabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? inspectorTabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); showPanel(inspectorTabs[next]); inspectorTabs[next].focus();
  });
}
