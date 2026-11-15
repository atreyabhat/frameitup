# Film border review

Four implementation and visual review passes, each rendered through the production layout and canvas renderer on landscape, portrait, square, and panoramic source shapes. Captures are local development artifacts in `output/film-iterations` and are excluded from publishing.

1. **Measured proportions:** replaced the generic twelve-hole decoration with rotated 2.794 × 1.981 mm KS-shaped perforations. Reviewed `pass-1.jpg`. Hole shape improved; adapting only the photo ratio left avoidable padding and evenly distributed holes changed their pitch.
2. **Spacing and complete frame:** fixed pitch at 4.75 mm, centered the complete visible perforation sequence, and let Adaptive measure the film frame around the image. Reviewed `pass-2.jpg`. Portrait and landscape rails now follow the source orientation. Small wide images still received unnecessary rounding space.
3. **Edge identity and rounding:** removed coarse 540-pixel rounding for native wide canvases, added restrained 35 MM lettering, edge indices, and decorative identification marks in the outer rebate. Reviewed `pass-3.jpg`. Panoramas retain useful area; lettering rotates with the stock.
4. **Stock finish and preservation:** added a faint deterministic stock texture and gate edge, clipped all decoration outside the image, and linked indices to the photo order. Reviewed `pass-4.jpg`. Sprockets remain complete at the ends; the photograph retains its source pixels. Geometry tests cover all supported canvas ratios and the browser test checks unchanged RGB and lossless PNG encoding.

## References

- [Kodak Essential Reference Guide, printed pages 95–97](https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf): perforation shape, KS dimensions 2.794 × 1.981 mm, 0.25 mm corner radius, 4.75 mm long pitch.
- [ILFORD Shooting Sprockets](https://www.ilfordphoto.com/shooting-sprockets/): standard 24 × 36 mm image area on a 35 mm strip.
- [Actual Portra negative strip](https://photo.stackexchange.com/questions/116856/poorly-scanned-or-poorly-shot-film-roll): hole orientation, paired rows, numbering and edge marks.
- [Actual ILFORD XP2 strip](https://www.nikonistas.com/digital/foro/topic/433102-problema-con-algunas-fotos-veladas/): portrait rail orientation and rotated lettering.

The digital frame uses these proportions as a visual model. Its length adapts to the photograph; it is not a claim that the image was captured on a particular film stock. The 5.5 mm rails derive from a nominal 35 mm strip around a 24 mm image. Decorative identification marks do not encode a real DX stock code.

## Border patina and square defaults — November 15, 2026

Reference: [Lomography's full-border scanning examples](https://www.lomography.com/school/how-to-scan-sprocket-holes-and-film-borders-at-home-fa-q2evqbl3), [ILFORD processing defects](https://www.ilfordphoto.com/common-film-processing-problems/), and [a photographer's actual negative scans](https://forums.negativelabpro.com/t/light-leaks-from-sprocket-holes-in-digital-camera-scan/5481). The discussion distinguishes edge exposure, pressure marks and processing artifacts; these are not all caused by development.

The rendering is a restrained interpretation: three uneven amber edge blooms, fine edge wear and stock grain. It is not a copied scan overlay. All marks use the existing per-photo random seed, rotate with the stock orientation, and are clipped to the film outside the image aperture. Perforations are drawn afterwards so the cutouts stay clear. White and black mats stay clean. Lettering reads `35MM`.

Film imports and switching into Film default to square. This is a default, not a forced aspect ratio; explicit canvas choices remain available. The never-split film rule remains unchanged.
