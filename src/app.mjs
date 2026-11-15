import { DEFAULTS, sanitizeSettings, migrateSettings, planPhoto, exportName, photoRect, instagramSettings } from './layout.mjs';
import { parseExifFromFile, metadataLine, hasCameraMetadata, importSettings } from './metadata.mjs';
import { renderSlide, encodeCanvas } from './render.mjs';

const $ = id => document.getElementById(id);
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private browsing may disable preference storage. */ } },
};
function loadPreferences() {
  try {
    const current = storage.get('frameitup.settings.v3');
    return current ? sanitizeSettings(JSON.parse(current)) : migrateSettings(JSON.parse(storage.get('frameitup.settings.v2') || '{}'));
  } catch { return sanitizeSettings(); }
}
let preferences = loadPreferences();
const state = { items: [], selected: null, slide: 0, revision: 0, timer: null, exporting: false, outputs: [], lastView: null, motion: null };
const selected = () => state.items.find(item => item.id === state.selected);
const settingsFor = item => ({ ...preferences, ...item.settings, ratio: preferences.ratio, export: preferences.export, instagramReady: preferences.instagramReady });
const planFor = (item, settings = settingsFor(item)) => planPhoto(item, settings, Boolean(metadataLine(item, settings)));
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
function savePreferences() { storage.set('frameitup.settings.v3', JSON.stringify(preferences)); }

function invalidateOutputs() {
  for (const output of state.outputs) URL.revokeObjectURL(output.url);
  state.outputs = [];
  $('results').hidden = true;
  $('result-list').replaceChildren();
}

function updateSetting(key, value, global = false) {
  if (state.exporting) return;
  const item = selected();
  preferences = sanitizeSettings({ ...preferences, [key]: value });
  if (key === 'ratio') preferences.instagramReady = false;
  if (key === 'manual' && item) item.settings.metadataMode = 'manual';
  if (item && !global) item.settings = { ...item.settings, [key]: preferences[key] };
  savePreferences();
  invalidateOutputs();
  syncControls();
  requestPreview();
}

const controlMap = {
  ratio: ['ratio', true], 'film-background': ['filmBackground'], border: ['border'], corners: ['corners'],
  metadata: ['metadata'], 'manual-metadata': ['manual'],
  'font-step': ['fontStep'], 'export-type': ['export', true],
};
for (const [id, [key, global]] of Object.entries(controlMap)) {
  const input = $(id);
  input.addEventListener(input.tagName === 'TEXTAREA' || input.type === 'range' || input.type === 'text' ? 'input' : 'change', () => {
    updateSetting(key, input.type === 'checkbox' ? input.checked : input.type === 'range' ? Number(input.value) : input.value, global);
  });
}
document.querySelectorAll('[data-layout]').forEach(button => button.addEventListener('click', () => {
  state.slide = 0; updateSetting('layout', button.dataset.layout);
}));
document.querySelectorAll('[data-style]').forEach(button => button.addEventListener('click', () => updateSetting('style', button.dataset.style)));
$('apply-layout').addEventListener('click', () => {
  const layout = selected() ? settingsFor(selected()).layout : preferences.layout;
  state.items.forEach(item => { item.settings.layout = layout; });
  invalidateOutputs(); syncControls(); renderLibrary(); requestPreview(); setStatus('Layout applied to every photograph.');
});

$('auto-format').addEventListener('change', () => {
  if (state.exporting) return;
  if ($('auto-format').value === 'instagram') {
    preferences = instagramSettings(preferences);
    for (const item of state.items) item.settings.layout = 'auto';
  } else preferences = sanitizeSettings({ ...preferences, instagramReady: false });
  savePreferences(); invalidateOutputs(); state.slide = 0;
  syncControls(); requestPreview();
});
$('export-all').addEventListener('change', () => { invalidateOutputs(); syncControls(); });

function syncControls() {
  const item = selected();
  const settings = item ? settingsFor(item) : preferences;
  for (const [id, [key]] of Object.entries(controlMap)) {
    if ($(id).type === 'checkbox') $(id).checked = settings[key]; else $(id).value = settings[key];
  }
  document.querySelectorAll('[data-layout]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layout === settings.layout)));
  document.querySelectorAll('[data-style]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.style === settings.style)));
  $('border-value').value = String(settings.border);
  $('corners-value').value = `${settings.corners}%`;
  $('font-value').value = String(settings.fontStep);
  const available = hasCameraMetadata(item?.exif);
  $('metadata').disabled = !available;
  $('metadata-hint').hidden = !item || available;
  $('metadata-controls').hidden = !settings.metadata || !available;
  if (item && settings.metadataMode === 'auto') $('manual-metadata').value = metadataLine(item, { ...settings, manual: '', note: '' });
  const filmOnly = settings.style === 'film-35mm' && settings.filmBackground === 'none';
  $('film-background-control').hidden = settings.style !== 'film-35mm';
  $('border').disabled = filmOnly;
  $('border').hidden = filmOnly;
  document.querySelector('label[for="border"]').hidden = filmOnly;
  $('quality-description').textContent = settings.export === 'native' ? settings.instagramReady ? 'Lossless · 1080 px wide' : 'Lossless · Source resolution' : 'JPEG 100% · 1080 px wide';
  $('export-type').options[0].textContent = settings.instagramReady ? 'PNG · 1080 px' : 'Full resolution · PNG';
  $('auto-format').value = settings.instagramReady ? 'instagram' : 'custom';
  $('auto-format').disabled = !item || state.exporting;
  $('ready-hint').textContent = settings.instagramReady ? 'Portrait 3:4 · Automatic splits' : 'Choose canvas and resolution below.';
  $('export-format-label').textContent = settings.export === 'native' ? 'Lossless PNG · sRGB' : 'JPEG 100% · sRGB';
  $('scope-row').hidden = state.items.length < 2;
  const targets = $('export-all').checked ? state.items : item ? [item] : [];
  const count = targets.reduce((sum, entry) => sum + planFor(entry).slides.length, 0);
  $('export-count').textContent = `${targets.length} photo${targets.length === 1 ? '' : 's'} · ${count} slide${count === 1 ? '' : 's'}`;
  $('export-button').disabled = !count || state.exporting;
  $('export-current').disabled = !item || state.exporting;
  $('remove-photo').disabled = !item || state.exporting;
  $('move-before').disabled = !item || state.items.indexOf(item) === 0 || state.exporting;
  $('move-after').disabled = !item || state.items.indexOf(item) === state.items.length - 1 || state.exporting;
  $('apply-layout').hidden = state.items.length < 2;
  $('apply-layout').disabled = !item || state.exporting;
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
    button.append(img, el('span', 'photo-item-name', item.name), el('span', 'photo-item-detail', `${item.width} × ${item.height}`));
    button.addEventListener('click', () => {
      state.selected = item.id; state.slide = 0; state.inspecting = false;
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
function requestPreview() {
  const revision = ++state.revision;
  clearTimeout(state.timer);
  state.timer = setTimeout(() => renderPreview(revision).catch(error => {
    if (revision === state.revision) setStatus(`Preview failed: ${error.message}`, true);
  }), 80);
}

async function renderPreview(revision) {
  const item = selected();
  $('empty-state').hidden = Boolean(item);
  $('preview-mat').hidden = !item;
  $('workspace').dataset.empty = String(!item);
  $('sequence-heading').hidden = $('slide-strip').hidden = !item;
  $('quality-warning').hidden = true;
  if (!item) {
    $('photo-title').textContent = 'Your photograph'; $('source-info').textContent = 'Add a photograph to start framing.';
    $('slide-strip').replaceChildren(); $('output-dimensions').textContent = '—'; $('slide-description').textContent = 'No photo selected';
    $('sequence-summary').textContent = '0 slides'; $('auto-description').textContent = '';
    $('previous-slide').disabled = $('next-slide').disabled = true;
    return;
  }
  const settings = structuredClone(settingsFor(item));
  const plan = planFor(item, settings);
  state.slide = Math.max(0, Math.min(state.slide, plan.slides.length - 1));
  const index = state.slide, slide = plan.slides[index];
  const view = await renderSlide(item, slide, plan, settings, 900);
  if (revision !== state.revision) return;
  copyCanvas(view, $('main-canvas'));
  const viewKey = `${item.id}:${index}`;
  if (state.lastView !== viewKey && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state.motion?.cancel();
    state.motion = $('main-canvas').animate([{ opacity: 0.7, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  state.lastView = viewKey;
  $('main-canvas').setAttribute('aria-label', `${item.name}, ${slide.kind === 'slice' ? `continuous part ${slide.index + 1} of ${slide.count}` : 'full framed photograph'}`);
  $('photo-title').textContent = item.name;
  $('source-info').textContent = `${item.width} × ${item.height} px · ${item.width > item.height ? 'Landscape' : item.width < item.height ? 'Portrait' : 'Square'}`;
  $('output-dimensions').textContent = `${slide.width} × ${slide.height} px`;
  $('slide-description').textContent = slide.kind === 'slice' ? `Part ${slide.index + 1} of ${slide.count}` : 'Full photo';
  $('sequence-summary').textContent = `${plan.slides.length} slide${plan.slides.length === 1 ? '' : 's'} · ${plan.ratio.label.replace('Portrait ', '')}`;
  $('auto-description').hidden = settings.layout !== 'auto';
  $('auto-description').textContent = `Auto: ${plan.count === 1 ? 'single' : `${plan.count} parts`}`;
  const lowResolution = (settings.export === 'instagram' || settings.instagramReady) && photoRect(item, slide, plan, settings).scale === 1;
  $('quality-warning').hidden = !lowResolution;
  $('quality-warning').textContent = lowResolution ? 'Small source: padding added to avoid enlargement.' : '';
  $('previous-slide').disabled = index === 0;
  $('next-slide').disabled = index === plan.slides.length - 1;
  const fragment = document.createDocumentFragment();
  for (const [i, entry] of plan.slides.entries()) {
    const button = el('button', `slide-tile${entry.kind === 'overview' ? ' overview' : ''}`);
    button.dataset.slideIndex = String(i);
    button.setAttribute('aria-pressed', String(i === index));
    button.setAttribute('aria-label', `Show slide ${i + 1}, ${entry.kind === 'slice' ? `part ${entry.index + 1}` : 'full photograph'}`);
    const canvas = await renderSlide(item, entry, plan, settings, 160);
    if (revision !== state.revision) return;
    button.append(canvas, el('span', '', `${String(i + 1).padStart(2, '0')} · ${entry.kind === 'slice' ? `Part ${entry.index + 1}` : 'Full photo'}`));
    button.addEventListener('click', () => { state.slide = i; syncControls(); requestPreview(); });
    fragment.append(button);
  }
  const focusedSlide = document.activeElement?.closest('.slide-tile')?.dataset.slideIndex;
  $('slide-strip').replaceChildren(fragment);
  if (focusedSlide !== undefined) {
    const nextFocus = Math.min(Number(focusedSlide), plan.slides.length - 1);
    $('slide-strip').children[nextFocus]?.focus({ preventScroll: true });
  }
  syncControls();
}

for (const [id, direction] of [['previous-slide', -1], ['next-slide', 1]]) $(id).addEventListener('click', () => {
  const item = selected();
  if (!item) return;
  state.slide = Math.max(0, Math.min(state.slide + direction, planFor(item).slides.length - 1));
  syncControls(); requestPreview();
});
let touchStart = null;
$('preview-stage').addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive: true });
$('preview-stage').addEventListener('touchend', event => {
  if (touchStart === null) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  touchStart = null;
  const button = $(delta < 0 ? 'next-slide' : 'previous-slide');
  if (Math.abs(delta) > 45 && !button.disabled) button.click();
}, { passive: true });
$('workspace').addEventListener('keydown', event => {
  if (event.target.closest('input,textarea,select')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const button = $(event.key === 'ArrowRight' ? 'next-slide' : 'previous-slide');
    if (!button.disabled) { event.preventDefault(); button.click(); }
  }
});

async function decodeFile(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: use an edited JPEG, PNG, or WebP. Convert HEIC, RAW, or HDR files in your photo editor first.`);
  const url = URL.createObjectURL(file);
  const image = new Image(); image.src = url;
  try {
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > 80000000) throw new Error('This source exceeds the 80-megapixel browser import limit. Use a smaller edited copy.');
    const item = { id: crypto.randomUUID(), name: file.name, file, image, width: image.naturalWidth, height: image.naturalHeight, settings: structuredClone(preferences.instagramReady ? { ...preferences, layout: 'auto', overview: true } : preferences), thumbnail: '', average: '#c4bba6', exif: null };
    const canvas = document.createElement('canvas');
    const thumbnailScale = 180 / Math.max(item.width, item.height);
    canvas.width = Math.max(1, Math.round(item.width * thumbnailScale));
    canvas.height = Math.max(1, Math.round(item.height * thumbnailScale));
    const ctx = canvas.getContext('2d', { colorSpace: 'srgb' }); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    item.thumbnail = canvas.toDataURL('image/jpeg', 0.85);
    canvas.width = canvas.height = 1; ctx.drawImage(image, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    item.average = `rgb(${r}, ${g}, ${b})`;
    item.exif = await parseExifFromFile(file);
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
        state.items.push(item); state.selected = item.id; state.slide = 0;
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
  state.items.splice(index, 1); state.selected = state.items[Math.min(index, state.items.length - 1)]?.id || null; state.slide = 0; state.inspecting = false;
  invalidateOutputs(); renderLibrary(); syncControls(); requestPreview(); setStatus('Photograph removed from this session.');
});
for (const [id, direction] of [['move-before', -1], ['move-after', 1]]) $(id).addEventListener('click', () => {
  const index = state.items.findIndex(item => item.id === state.selected), destination = index + direction;
  if (destination < 0 || destination >= state.items.length) return;
  [state.items[index], state.items[destination]] = [state.items[destination], state.items[index]];
  invalidateOutputs(); renderLibrary(); syncControls(); setStatus('Photograph and its slides moved together.');
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
    return plan.slides.flatMap((slide, slideIndex) => currentOnly && slideIndex !== state.slide ? [] : [{ item, settings, plan, slide, name: exportName(item.name, photoIndex, slideIndex, slide, settings.export) }]);
  });
  state.exporting = true; state.revision++; clearTimeout(state.timer); invalidateOutputs();
  $('editor').inert = true; $('editor').setAttribute('aria-busy', 'true'); $('add-photos').disabled = true;
  const failures = [];
  try {
    for (const [index, job] of jobs.entries()) {
      setStatus(`Rendering ${index + 1} of ${jobs.length}: ${job.name}`);
      try {
        const canvas = await renderSlide(job.item, job.slide, job.plan, job.settings);
        const blob = await encodeCanvas(canvas, job.settings.export);
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
