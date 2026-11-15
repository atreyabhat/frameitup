import test from 'node:test';
import assert from 'node:assert/strict';
import { FILM, filmGeometry } from '../src/film.mjs';
import { sanitizeSettings, planPhoto, photoRect } from '../src/layout.mjs';

test('film uses source orientation and true KS hole proportions at fixed pitch', () => {
  for (const [width,height] of [[900,600],[600,900],[700,700],[1800,600]]) {
    const item={width,height},settings=sanitizeSettings({instagramReady:false, style:'film-35mm',layout:'single',ratio:'adaptive'});
    const plan=planPhoto(item,settings),rect=photoRect(item,plan.slides[0],plan,settings);
    const g=filmGeometry(rect,plan.film);
    assert.equal(g.vertical,width<height);
    assert(Math.abs(g.pitch/g.unit-FILM.pitch)<1e-9);
    const h=g.holes[0];
    assert(Math.abs((g.vertical?h.width:h.height)/g.unit-FILM.across)<1e-9);
    assert(Math.abs((g.vertical?h.height:h.width)/g.unit-FILM.along)<1e-9);
    assert(g.holes.every(hole => hole.x+hole.width<=rect.x || hole.x>=rect.x+rect.width || hole.y+hole.height<=rect.y || hole.y>=rect.y+rect.height));
    const first=g.holes[0],second=g.holes[2];
    assert(Math.abs((g.vertical?second.y-first.y:second.x-first.x)-g.pitch)<1e-9);
  }
});

test('all film perforations and full image fit their planned canvas', () => {
  for(const ratio of ['portrait','classic','square','landscape','adaptive']) {
    for(const [width,height] of [[900,600],[600,900],[700,700],[1800,600]]) {
      const item={width,height},settings=sanitizeSettings({instagramReady:false, style:'film-35mm',layout:'single',ratio});
      const plan=planPhoto(item,settings),slide=plan.slides[0],rect=photoRect(item,slide,plan,settings);
      for(const hole of filmGeometry(rect,plan.film).holes) assert(hole.x>=0&&hole.y>=0&&hole.x+hole.width<=slide.width&&hole.y+hole.height<=slide.height);
    }
  }
});

test('native wide output does not add hundreds of padding pixels for ratio rounding', () => {
  const settings=sanitizeSettings({instagramReady:false, style:'film-35mm',layout:'single',ratio:'adaptive'});
  const plan=planPhoto({width:1200,height:400},settings);
  assert(plan.slides[0].width-plan.film.width<2);
});

test('five photo shapes retain their image and film within all supported layouts', () => {
  for(const [width,height] of [[1800,1200],[1200,1800],[1400,1400],[2400,800],[900,1800]]) {
    const item={width,height};
    for(const ratio of ['portrait','classic','square','landscape','adaptive'])
    for(const layout of ['auto','single','2','3'])
    for(const format of ['native','instagram'])
    for(const filmBackground of ['white','black'])
    for(const border of [0,4,16])
    for(const metadata of [false,true]) {
      const settings=sanitizeSettings({instagramReady:false, style:'film-35mm',ratio,layout,export:format,filmBackground,border,metadata});
      const plan=planPhoto(item,settings,metadata);
      for(const slide of plan.slides) {
        const rect=photoRect(item,slide,plan,settings);
        assert(rect.scale<=1);
        if(slide.kind==='slice')continue;
        const label=`${width}x${height}/${ratio}/${layout}/${format}/${filmBackground}/${border}/${metadata}`;
        const fw=plan.film.width*rect.scale,fh=plan.film.height*rect.scale;
        const fx=rect.x+(rect.width-fw)/2,fy=rect.y+(rect.height-fh)/2;
        // Integer source placement may leave a subpixel stock edge at the canvas boundary.
        assert(fx>=-1&&fy>=-1,label);
        assert(fx+fw<=slide.width+1,label);
        assert(fy+fh<=slide.height-plan.insets.footer*slide.width+1,label);
      }
    }
  }
});

test('film background is validated and white or black mats use the border control', () => {
  assert.equal(sanitizeSettings({instagramReady:false, filmBackground:'invalid'}).filmBackground,'black');
  const item={width:1800,height:1200};
  const only=planPhoto(item,sanitizeSettings({instagramReady:false, style:'film-35mm',layout:'single',filmBackground:'black',border:0}));
  assert.equal(sanitizeSettings({filmBackground:'none'}).filmBackground,'black');
  assert.equal(sanitizeSettings({style:'film-35mm'}).border,0);
  for(const filmBackground of ['white','black']) {
    const mat=planPhoto(item,sanitizeSettings({instagramReady:false, style:'film-35mm',layout:'single',filmBackground,border:8}));
    assert(mat.slides[0].width>only.slides[0].width);
    assert.equal(mat.insets.x,.08);
  }
});


test('film removes end stock and reaches the sides when geometry permits',()=>{
 for(const filmBackground of ['white','black']) {
  const item={width:2400,height:800};
  const settings=sanitizeSettings({style:'film-35mm',ratio:'square',filmBackground,border:5});
  const plan=planPhoto(item,settings),r=photoRect(item,plan.slides[0],plan,settings);
  assert.equal(plan.insets.x,0);
  assert.equal(plan.film.width,item.width);
  assert.equal(r.x,0);assert.equal(r.width,1080);
  assert(r.y>=0&&r.y+r.height<=1080);
 }
 const portrait={width:1200,height:1800};
 const s=sanitizeSettings({style:'film-35mm',ratio:'square'}),p=planPhoto(portrait,s);
 assert(p.film.vertical);assert(p.film.width>portrait.width,'Portrait side sprockets must remain intact');
});


test('film stock ends exactly at the photograph on the non-perforated edges',()=>{
 for(const [width,height] of [[1800,1200],[1200,1800],[2400,800]]) {
  const item={width,height},settings=sanitizeSettings({style:'film-35mm',border:0,ratio:'square'});
  const plan=planPhoto(item,settings);
  if(width<height) assert.equal(plan.film.height,height);
  else assert.equal(plan.film.width,width);
 }
});


test('square film stock fills the canvas and retains proportional holes without cropping photos',()=>{
 for(const [width,height] of [[6000,4000],[4000,6000],[9000,3000],[3000,9000],[4000,4000],[4001,4000]])
 for(const instagramReady of [false,true]) for(const filmBackground of ['white','black']) {
  const item={width,height},s=sanitizeSettings({style:'film-35mm',ratio:'square',border:0,instagramReady,filmBackground});
  const p=planPhoto(item,s),slide=p.slides[0],r=photoRect(item,slide,p,s),g=filmGeometry(r,p.film);
  assert.equal(slide.width,slide.height);assert.equal(p.film.width,p.film.height);
  assert.deepEqual(r.filmBounds,{x:0,y:0,width:slide.width,height:slide.height});
  assert(r.x>=0&&r.y>=0&&r.x+r.width<=slide.width&&r.y+r.height<=slide.height);
  for(const h of g.holes) {
   assert(h.x>=-1&&h.y>=-1&&h.x+h.width<=slide.width+1&&h.y+h.height<=slide.height+1);
   assert(Math.abs((g.vertical?h.width/h.height:h.height/h.width)-FILM.across/FILM.along)<1e-8);
  }
 }
});


test('perforations stay close to the image with more stock outside, including expanded square rails',()=>{
 for(const ratio of ['adaptive','square','portrait']) for(const [width,height] of [[1800,1200],[1200,1800],[2400,800],[800,2400],[1400,1400],[1401,1400]]) {
  const item={width,height},s=sanitizeSettings({style:'film-35mm',border:0,ratio});
  const p=planPhoto(item,s),r=photoRect(item,p.slides[0],p,s),g=filmGeometry(r,p.film);
  const h=g.holes[0],gap=g.vertical?r.x-h.x-h.width:r.y-h.y-h.height;
  assert(Math.abs(gap/g.unit-.696)<1e-8);
  const outside=g.rail-gap-FILM.across*g.unit;
  assert(outside>gap*2,`${ratio}/${width}x${height}: outside stock should exceed the image-side gap`);
 }
});
