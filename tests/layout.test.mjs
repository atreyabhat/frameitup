import test from 'node:test';
import assert from 'node:assert/strict';
import { METADATA_FONTS, DEFAULTS, sanitizeSettings, migrateSettings, planPhoto, photoRect, exportName, RATIOS, instagramSettings, patchPhotoSettings, applySharedSettings, aspectRatioLabel } from '../src/layout.mjs';

test('all new and legacy automatic layouts default to one full photograph',()=>{
 for(const layout of [undefined,'auto','invalid','single']) {
  const settings=sanitizeSettings({layout});assert.equal(settings.layout,'single');
  const plan=planPhoto({width:6000,height:2000},settings);assert.equal(plan.count,1);assert.equal(plan.slides.length,1);
 }
 assert.equal(instagramSettings(sanitizeSettings({layout:'3'})).layout,'single');
});

test('native slices share one exact transform across odd dimensions', () => {
  const item = { width: 1001, height: 667 };
  const settings = sanitizeSettings({instagramReady:false,  layout: '2' });
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
        const settings = sanitizeSettings({instagramReady:false,  ratio, style, metadata: true, layout: 'single', border: 16 });
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
    const settings = sanitizeSettings({instagramReady:true, export: 'instagram', ratio });
    const plan = planPhoto(item, settings);
    assert(plan.slides.every(slide => slide.width === 1080 && slide.height === height));
    for (const slide of plan.slides) assert(photoRect({ width: 100, height: 80 }, slide, plan, settings).scale <= 1);
  }
});

test('full photo always comes first even with old disabled preferences', () => {
  const item = { width: 3000, height: 4000 };
  const plan = planPhoto(item, sanitizeSettings({instagramReady:false,  layout: '3', overview: false }));
  assert.equal(plan.count, 3);
  assert.equal(plan.slides.length, 4);
  assert.equal(plan.slides[0].kind, 'overview');
  assert(plan.slides.slice(1).every(slide => slide.kind === 'slice'));
});

test('migration retains useful preferences but resets destructive quality and scaling', () => {
  const settings = migrateSettings({ preset: 'fuji-style', borderWidth: 8, exportQuality: 0.5, nonInstagramScale: 2 });
  assert.equal(settings.export, 'instagram');
  assert.equal(settings.style, 'classic-white');
  assert.equal(settings.border, 8);
  assert.deepEqual(sanitizeSettings({instagramReady:false,  border: Infinity, export: 'webp', ratio: 'evil' }).export, DEFAULTS.export);
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
  for (const layout of ['2','3']) {
    const settings=sanitizeSettings({instagramReady:false, ratio:'adaptive',layout});
    const plan=planPhoto(item,settings);
    assert.equal(plan.q,0.75);
    assert.equal(plan.slides[0].kind,'overview');
    assert.equal(plan.slides[1].kind,'slice');
    assert.equal(plan.slides[1].width / plan.slides[1].height,0.75);
  }
});

test('Auto format uses posting dimensions and a single image without changing the encoding', () => {
  const settings=instagramSettings(sanitizeSettings({instagramReady:false, ratio:'adaptive',layout:'single',overview:false,export:'native',style:'film-35mm'}));
  const plan=planPhoto({width:6000,height:4000},settings);
  assert.equal(settings.export,'native');
  assert.equal(settings.style,'film-35mm');
  assert.equal(settings.instagramReady,true);
  assert.equal(plan.count,1);
  assert.equal(plan.slides[0].kind,'single');
  assert(plan.slides.every(slide=>slide.width===1080 && slide.height===1080));
});

test('format and canvas changes stay on the selected photo unless apply-all is explicit',()=>{
 const items=[{id:'a',settings:sanitizeSettings()},{id:'b',settings:sanitizeSettings()}];
 patchPhotoSettings(items,'a',{ratio:'square',instagramReady:false});
 assert.equal(items[0].settings.ratio,'square');assert.equal(items[1].settings.ratio,'portrait');
 patchPhotoSettings(items,'a',{ratio:'landscape'},true);
 assert(items.every(i=>i.settings.ratio==='landscape'));
});
test('new defaults are Instagram dimensions, border5, footer off and JPEG90',()=>{
 const s=sanitizeSettings();assert.equal(s.border,5);assert.equal(s.instagramReady,true);assert.equal(s.metadata,false);assert.equal(s.jpegQuality,.9);
});

test('film frames and detected film always stay whole, including forced and shared layouts',()=>{
 for(const dimensions of [[6000,4000],[9000,3000],[4000,6000]])
 for(const ratio of [...Object.keys(RATIOS),'adaptive'])
 for(const layout of ['auto','single','2','3'])
 for(const detectedFilm of [false,true]){
  const item={width:dimensions[0],height:dimensions[1],detectedFilm};
  const settings=sanitizeSettings({style:detectedFilm?'classic-white':'film-35mm',ratio,layout});
  const plan=planPhoto(item,settings);
  assert.equal(plan.count,1);assert.equal(plan.slides.length,1);assert.equal(plan.slides[0].kind,'single');
 }
 const digital={width:6000,height:4000,detectedFilm:false};
 assert.equal(planPhoto(digital,sanitizeSettings({style:'classic-white',layout:'2'})).count,2);
 const film={...digital,detectedFilm:true};
 assert.equal(planPhoto(film,sanitizeSettings({style:'classic-black',layout:'3'})).count,1);
});


test('Instagram format defaults detected film square even after changing its frame',()=>{
 const original=sanitizeSettings({style:'classic-white',ratio:'portrait'});
 const film=instagramSettings(original,{detectedFilm:true});
 assert.equal(film.ratio,'square');
 assert.equal(instagramSettings(original).ratio,'portrait');
 const explicit=sanitizeSettings({...film,ratio:'classic'});
 assert.equal(planPhoto({width:1800,height:1200,detectedFilm:true},explicit).slides[0].height,1350);
});


test('bulk application is a one-time copy and retains each photo metadata',()=>{
 const items=Array.from({length:3},(_,i)=>({id:String(i),detectedFilm:i===2,settings:sanitizeSettings({manual:`Camera ${i}`,metadata:i===1})}));
 items[0].settings=sanitizeSettings({...items[0].settings,ratio:'square',border:8,filmBackground:'white',export:'native'});
 applySharedSettings(items,'0');
 assert(items.every(i=>i.settings.ratio==='square'&&i.settings.border===8&&i.settings.export==='native'));
 assert.deepEqual(items.map(i=>i.settings.manual),['Camera 0','Camera 1','Camera 2']);
 assert.equal(items[1].settings.metadata,true);
 patchPhotoSettings(items,'2',{ratio:'portrait',border:2,instagramReady:false});
 assert.deepEqual(items.map(i=>i.settings.ratio),['square','square','portrait']);
 assert.deepEqual(items.map(i=>i.settings.border),[8,8,2]);
 assert.deepEqual(items.map(i=>i.settings.instagramReady),[true,true,false]);
 assert.equal(items[2].detectedFilm,true);
});

test('original aspect ratios use reduced fractions and mark approximations',()=>{
 for(const [w,h,label] of [[6000,4000,'3:2'],[4000,6000,'2:3'],[1400,1400,'1:1'],[4032,3024,'4:3'],[2400,800,'3:1'],[6000,4001,'≈1.50:1'],[4001,6000,'≈1:1.50']]) assert.equal(aspectRatioLabel(w,h),label);
});


test('metadata fonts are validated, individual, and copied only by an explicit bulk action',()=>{
 assert.deepEqual(METADATA_FONTS,['DM Mono','Space Mono','Courier Prime','Barlow Condensed','Source Serif 4']);
 assert.equal(sanitizeSettings({metadataFont:'missing-font'}).metadataFont,'DM Mono');
 assert.equal(sanitizeSettings().metadataFont,'DM Mono');
 for(const font of METADATA_FONTS) assert.equal(sanitizeSettings({metadataFont:font}).metadataFont,font);
 const items=[{id:'a',settings:sanitizeSettings({manual:'Camera A'})},{id:'b',settings:sanitizeSettings({manual:'Camera B'})}];
 patchPhotoSettings(items,'a',{metadataFont:'Space Mono'});
 assert.equal(items[1].settings.metadataFont,'DM Mono');
 applySharedSettings(items,'a');
 assert.equal(items[1].settings.metadataFont,'Space Mono');
 patchPhotoSettings(items,'b',{metadataFont:'Courier Prime'});
 assert.equal(items[0].settings.metadataFont,'Space Mono');
 assert.deepEqual(items.map(i=>i.settings.manual),['Camera A','Camera B']);
});
