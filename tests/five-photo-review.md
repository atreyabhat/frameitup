# Five-photo acceptance check

The cream, sand, gray and coral revision was checked in the packaged local release at http://127.0.0.1:4174 before the main push. Test photographs were manually uploaded together. The production application starts empty; fixtures are excluded from the build. Sources are recorded in `fixtures/SOURCES.txt`.

## Individual settings retained across selection

| Photograph | Source | Split | Frame | Background | Border | Corners | Metadata |
| --- | --- | --- | --- | --- | --- | --- | --- |
| landscape-valley.jpg | 1800 × 1200 | 2 parts | Film | White | 8 | 0 | Off |
| portrait-coast.jpg | 1200 × 1800 | Single | Film | Black | 6 | 0 | Manual footer |
| square-mountain.jpg | 1400 × 1400 | Single | White | — | 8 | 5 | Off |
| panorama-trees.jpg | 2400 × 800 | 3 parts | Film | Film only | — | 0 | Off |
| tall-snow.jpg | 900 × 1800 | Single | Color | — | 12 | 0 | Off |

Canvas was shared portrait 3:4. Each split group included the full photograph first. Reselecting all five photographs confirmed that their split, style, mat, border, corner and metadata settings were independent.

## Coverage

All five photographs were exercised through every canvas preset, Auto/Single/2/3 split, all four frame styles, all three film backgrounds, border/corner minima and maxima, metadata modes/field toggles/text/note/text-size controls, and PNG/JPEG format selection. Full-photo inclusion was toggled and restored. Export scope correctly reported five photographs and ten slides.

Three actual ZIP downloads from the release candidate were opened and decoded:

- 1080 px PNG: ten genuine PNG files, each 1080 × 1440.
- 1080 px JPEG: ten genuine JPEG files, each 1080 × 1440.
- Source-resolution PNG: ten genuine PNG files at their planned source-detail sizes. Landscape parts were 900 × 1200; panorama parts were 801 × 1068. Complete frames were larger to preserve source pixels.

All three archives retained photo-group order and full-photo-first order. The source-resolution panorama has padding because its ratio differs from the selected common 3:4 canvas; small sources are never enlarged silently. The 1080 mode displays a padding warning for an undersized split source.

14 Node tests pass, including a five-shape geometry matrix spanning ratios, layouts, formats, film backgrounds, border sizes and metadata. 54 browser checks pass, including exact source RGB preservation, seamless two-/three-part reassembly, PNG round trips, actual JPEG dimensions, and all five photographs under each film background.

Desktop at 1440 CSS pixels and mobile at 390 CSS pixels were inspected without horizontal page overflow. One independent UI/UX reviewer inspected both layouts and all five photo states and returned `ship`, with no material findings. The review requested no further interface features. The manual design detector returned no findings.

## Film refinement

Frame counters, A-suffixes, decorative arrows and barcode marks were removed; only 35mm remains. A white or black mat encloses the complete film strip, with the same unitless border control as other styles. Film only adds no extra mat width. Landscape perforations run above/below; portrait perforations rotate to the sides. Pale perforations are a visible digital treatment on black rather than transparent holes. Texture and lettering remain clipped away from photo pixels.

## Verification limits

This checks local browser rendering and actual downloadable files. It does not establish final Instagram recompression, account-specific mixed-orientation support, or physical-phone file saving. A common canvas avoids depending on mixed-orientation support.
