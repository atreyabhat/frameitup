// Kodak KS proportions: 2.794 × 1.981 mm perforations; 4.75 mm pitch.
// https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf pp.95–97.
export const FILM = Object.freeze({ across: 2.794, along: 1.981, pitch: 4.75, edge: 2.01, radius: 0.25, rail: 5.5 });

export function filmGeometry(rect, film) {
  const unit = film.mm * rect.scale;
  const vertical = film.vertical;
  const rail = FILM.rail * unit;
  const length = vertical ? rect.height : rect.width;
  const pitch = FILM.pitch * unit;
  const count = Math.max(1, Math.floor((length - FILM.along * unit) / pitch) + 1);
  const first = (length - (count - 1) * pitch) / 2;
  const holes = [];
  for (let i = 0; i < count; i++) {
    const along = first + i * pitch;
    const positions = vertical ? [rect.x - rail + FILM.edge * unit, rect.x + rect.width + rail - (FILM.edge + FILM.across) * unit] : [rect.y - rail + FILM.edge * unit, rect.y + rect.height + rail - (FILM.edge + FILM.across) * unit];
    for (const cross of positions) holes.push(vertical ? { x: cross, y: rect.y + along - FILM.along * unit / 2, width: FILM.across * unit, height: FILM.along * unit } : { x: rect.x + along - FILM.along * unit / 2, y: cross, width: FILM.along * unit, height: FILM.across * unit });
  }
  return { unit, vertical, rail, length, holes, pitch, count };
}

export function drawFilm(ctx, rect, film, background, seedPosition = 0) {
  const geometry = filmGeometry(rect, film);
  const fw = film.width * rect.scale, fh = film.height * rect.scale;
  const fx = rect.x + (rect.width - fw) / 2, fy = rect.y + (rect.height - fh) / 2;
  ctx.save();
  // Stock texture and edge ink are clipped away from the photograph itself.
  ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip('evenodd');
  ctx.fillStyle = '#171410'; ctx.fillRect(fx, fy, fw, fh);
  let seed = 731;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = 'rgba(212,190,150,0.055)';
  for (let i = 0; i < 900; i++) {
    const size = geometry.unit * (0.025 + random() * 0.035);
    ctx.fillRect(fx + random() * fw, fy + random() * fh, size, size);
  }
  const edge = geometry.unit * 0.045;
  ctx.strokeStyle = '#51432e'; ctx.lineWidth = edge;
  ctx.strokeRect(rect.x - edge, rect.y - edge, rect.width + edge * 2, rect.height + edge * 2);
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
  ctx.fillText('35mm', (3 * u) + position.along * Math.max(0, length - 6 * u), (position.side ? 34.05 : 0.95) * u);
  ctx.restore();
  ctx.restore();
}

export function filmLabelPosition(seed) {
  const value = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return { side: value & 1, along: (value >>> 1) / 2147483648 };
}
