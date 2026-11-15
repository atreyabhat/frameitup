import test from 'node:test';
import assert from 'node:assert/strict';
import {hasCameraMetadata, importSettings, metadataLine} from '../src/metadata.mjs';
import {sanitizeSettings} from '../src/layout.mjs';
import {filmLabelPosition} from '../src/film.mjs';
test('missing camera metadata selects film and disables footer without carrying another photo text',()=>{
 for(const exif of [null,{}, {camera:'',focal:null}]){
  assert.equal(hasCameraMetadata(exif),false);
  const settings=importSettings(exif,sanitizeSettings({metadata:true,manual:'Other camera',note:'Other note'}));
  assert.equal(settings.style,'film-35mm');assert.equal(settings.metadata,false);assert.equal(settings.manual,'');assert.equal(settings.note,'');
 }
});
test('metadata initializes from each source and manual lens corrections replace the rendered text',()=>{
 const exif={camera:'FUJIFILM X-T5',focal:25,fNumber:2.8,exposure:1/250,iso:200};
 const settings=importSettings(exif,sanitizeSettings({manual:'Other photo'}));
 assert.equal(settings.manual,'FUJIFILM X-T5 | 25mm | f/2.8 | 1/250 | ISO 200');
 const edited={...settings,metadataMode:'manual',manual:settings.manual.replace('25mm','50mm')+' | Evening'};
 assert.equal(metadataLine({exif},edited),'FUJIFILM X-T5 | 50mm | f/2.8 | 1/250 | ISO 200 | Evening');
});
test('film label placement stays fixed per photo and varies across photos',()=>{
 const positions=Array.from({length:50},(_,i)=>filmLabelPosition(i*98987));
 assert(positions.every(p=>p.along>=0&&p.along<=1));assert(new Set(positions.map(p=>p.side)).size===2);
 assert.deepEqual(filmLabelPosition(42),filmLabelPosition(42));assert.notDeepEqual(positions[0],positions[1]);
});
