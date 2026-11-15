import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, sanitizeSettings, migrateSettings, recommendCount, planPhoto, photoRect, exportName, RATIOS, instagramSettings } from '../src/layout.mjs';

test('auto keeps portraits and squares whole; chooses two or three landscape parts', () => {
  assert.equal(recommendCount(4000, 6000, 0.75), 1);
  assert.equal(recommendCount(4000, 4000, 0.75), 1);
  assert.equal(recommendCount(6000, 4000, 0.75), 2);
  assert.equal(recommendCount(6000, 3000, 0.75), 3);
  assert.equal(recommendCount(4400, 4000, 0.75), 1);
});

test('native slices share one exact transform across odd dimensions', () => {
  const item = { width: 1001, height: 667 };
  const settings = sanitizeSettings({ layout: '2' });
  const plan = planPhoto(item, settings);
  assert.deepEqual(plan.slides.map(x => x.kind), ['overview', 'slice', 'slice']);
  const left = photoRect(item, plan.slides[1], plan, settings);
  const right = photoRect(item, plan.slides[2], plan, settings);
  assert.equal(left.scale, 1);
  assert.equal(right.x, left.x - plan.slides[1].width);
  assert.equal(right.width, item.width);
  assert.equal(right.height, item.height);
  assert.equal(right.y, left.y);
});

test('native full frames preserve all source pixels for every style and ratio', () => {
  for (const dimensions of [[1800,1200],[1200,1800],[1400,1400],[2400,800],[900,1800],[1001,667]]) {
    const item = { width: dimensions[0], height: dimensions[1] };
    for (const ratio of [...Object.keys(RATIOS), 'adaptive']) {
      for (const style of ['classic-white', 'classic-black', 'average', 'film-35mm']) {
        const settings = sanitizeSettings({ ratio, style, metadata: true, layout: 'single', border: 16 });
        const plan = planPhoto(item, settings, true), slide = plan.slides[0];
        const rect = photoRect(item, slide, plan, settings);
        assert.equal(rect.scale, 1);
        assert(rect.x >= 0 && rect.y >= 0, `${ratio}/${style}: source must fit`);
        assert(rect.x + rect.width <= slide.width);
        assert(rect.y + rect.height <= slide.height, `${ratio}/${style}: no lost rows`);
      }
    }
  }
});

test('Instagram copies have exact documented dimensions and never enlarge content', () => {
  const item = { width: 6000, height: 4000 };
  for (const [ratio, height] of [['portrait', 1440], ['classic', 1350], ['square', 1080], ['landscape', 566]]) {
    const settings = sanitizeSettings({ export: 'instagram', ratio });
    const plan = planPhoto(item, settings);
    assert(plan.slides.every(slide => slide.width === 1080 && slide.height === height));
    for (const slide of plan.slides) assert(photoRect({ width: 100, height: 80 }, slide, plan, settings).scale <= 1);
  }
});

test('overview can be disabled and forced counts remain explicit', () => {
  const item = { width: 3000, height: 4000 };
  const plan = planPhoto(item, sanitizeSettings({ layout: '3', overview: false }));
  assert.equal(plan.count, 3);
  assert.equal(plan.slides.length, 3);
  assert(plan.slides.every(slide => slide.kind === 'slice'));
});

test('migration retains useful preferences but resets destructive quality and scaling', () => {
  const settings = migrateSettings({ preset: 'fuji-style', borderWidth: 8, exportQuality: 0.5, nonInstagramScale: 2 });
  assert.equal(settings.export, 'native');
  assert.equal(settings.style, 'classic-white');
  assert.equal(settings.border, 8);
  assert.deepEqual(sanitizeSettings({ border: Infinity, export: 'webp', ratio: 'evil' }).export, DEFAULTS.export);
});

test('ordered export names isolate duplicate source names and unsafe characters', () => {
  const slide = { kind: 'slice', index: 0, count: 2 };
  const one = exportName('../my photo.jpg', 0, 0, slide, 'native');
  const two = exportName('../my photo.jpg', 1, 0, slide, 'native');
  assert.notEqual(one, two);
  assert.match(one, /^01_01_my_photo_part-1-of-2\.png$/);
  assert(!one.includes('/'));
});

test('adaptive split uses portrait viewports rather than wide empty halves', () => {
  const item = {width:1800,height:1200};
  for (const layout of ['auto','2','3']) {
    const settings=sanitizeSettings({ratio:'adaptive',layout});
    const plan=planPhoto(item,settings);
    assert.equal(plan.q,0.75);
    assert.equal(plan.slides[0].kind,'overview');
    assert.equal(plan.slides[1].kind,'slice');
    assert.equal(plan.slides[1].width / plan.slides[1].height,0.75);
  }
});

test('Auto format coordinates dimensions and automatic layouts without lossy encoding', () => {
  const settings=instagramSettings(sanitizeSettings({ratio:'adaptive',layout:'single',overview:false,export:'native',style:'film-35mm'}));
  const plan=planPhoto({width:6000,height:4000},settings);
  assert.equal(settings.export,'native');
  assert.equal(settings.style,'film-35mm');
  assert.equal(settings.instagramReady,true);
  assert.equal(plan.count,2);
  assert.equal(plan.slides[0].kind,'overview');
  assert(plan.slides.every(slide=>slide.width===1080 && slide.height===1440));
});
