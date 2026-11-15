// Kodak KS proportions: 2.794 × 1.981 mm perforations; 4.75 mm pitch.
// https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf pp.95–97.
export const FILM = Object.freeze({ across: 2.794, along: 1.981, pitch: 4.75, edge: 2.01, radius: 0.25, rail: 5.5 });

export function filmGeometry(rect, film) {
  const unit = film.mm * rect.scale;
  const vertical = film.vertical;
  const rail = (film.rail ?? FILM.rail * film.mm) * rect.scale;
  const length = vertical ? rect.height : rect.width;
  const pitch = FILM.pitch * unit;
  const count = Math.max(1, Math.floor((length - FILM.along * unit) / pitch) + 1);
  const first = (length - (count - 1) * pitch) / 2;
  // A nominal 5.5 mm rail has 2.01 mm outside the hole, leaving 0.696 mm at the image.
  // Keep that inner gap when a square canvas adds extra stock outside the perforations.
  const innerGap = (FILM.rail - FILM.edge - FILM.across) * unit;
  const holes = [];
  for (let i = 0; i < count; i++) {
    const along = first + i * pitch;
    const positions = vertical ? [rect.x - innerGap - FILM.across * unit, rect.x + rect.width + innerGap] : [rect.y - innerGap - FILM.across * unit, rect.y + rect.height + innerGap];
    for (const cross of positions) holes.push(vertical ? { x: cross, y: rect.y + along - FILM.along * unit / 2, width: FILM.across * unit, height: FILM.along * unit } : { x: rect.x + along - FILM.along * unit / 2, y: cross, width: FILM.along * unit, height: FILM.across * unit });
  }
  return { unit, vertical, rail, innerGap, length, holes, pitch, count };
}

export function drawFilm(ctx, rect, film, background, seedPosition = 0) {
  const geometry = filmGeometry(rect, film);
  const fw = rect.filmBounds?.width ?? film.width * rect.scale, fh = rect.filmBounds?.height ?? film.height * rect.scale;
  const fx = rect.filmBounds?.x ?? rect.x + (rect.width - fw) / 2, fy = rect.filmBounds?.y ?? rect.y + (rect.height - fh) / 2;
  ctx.save();
  // Stock texture and edge ink are clipped away from the photograph itself.
  ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip('evenodd');
  ctx.fillStyle = '#171410'; ctx.fillRect(fx, fy, fw, fh);
  let seed = seedPosition >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  // Uneven amber edge fog, scaled with the stock and stable for this photo.
  const blooms = 2 + Math.floor(random() * 3);
  for (let i = 0; i < blooms; i++) {
    const along = random(), side = random() > 0.5;
    const x = geometry.vertical ? (side ? fx + fw : fx) : fx + along * fw;
    const y = geometry.vertical ? fy + along * fh : (side ? fy + fh : fy);
    const reach = geometry.unit * (3 + random() * 3);
    const spread = 2.2 + random() * 2.6, strength = 0.28 + random() * 0.26;
    ctx.save(); ctx.translate(x, y); ctx.rotate((random() - 0.5) * 0.3);
    ctx.scale(geometry.vertical ? 1 : spread, geometry.vertical ? spread : 1);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
    glow.addColorStop(0, `rgba(190,98,35,${strength})`);
    glow.addColorStop(0.25 + random() * 0.25, `rgba(135,55,22,${strength * 0.55})`);
    glow.addColorStop(1, 'rgba(95,37,17,0)');
    ctx.fillStyle = glow; ctx.fillRect(-reach, -reach, reach * 2, reach * 2); ctx.restore();
  }
  ctx.fillStyle = 'rgba(212,190,150,0.10)';
  for (let i = 0; i < 900; i++) {
    const size = geometry.unit * (0.025 + random() * 0.035);
    ctx.fillRect(fx + random() * fw, fy + random() * fh, size, size);
  }
  ctx.fillStyle = background === '#ffffff' ? '#ffffff' : '#f0e8d8';
  for (const hole of geometry.holes) {
    ctx.beginPath(); ctx.roundRect(hole.x, hole.y, hole.width, hole.height, FILM.radius * geometry.unit); ctx.fill();
  }
  const { unit: u, vertical, rail, length } = geometry;
  ctx.save();
  if (vertical) { ctx.translate(rect.x - rail, rect.y + rect.height); ctx.rotate(-Math.PI / 2); }
  else ctx.translate(rect.x, rect.y - rail);
  ctx.fillStyle = '#c8a36b';
  ctx.font = `500 ${0.85 * u}px "Source Sans 3", sans-serif`;
  ctx.textBaseline = 'middle';
  const position = filmLabelPosition(seedPosition);
  ctx.textAlign = 'center';
  ctx.fillText('35MM', (3 * u) + position.along * Math.max(0, length - 6 * u), position.side ? rail + (vertical ? rect.width : rect.height) + rail - 0.95 * u : 0.95 * u);
  ctx.restore();
  ctx.restore();
}

export function filmLabelPosition(seed) {
  const value = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return { side: value & 1, along: (value >>> 1) / 2147483648 };
}
