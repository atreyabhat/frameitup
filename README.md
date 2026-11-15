# Frame It Up

A private, browser-only photography workspace for framing complete images and preparing continuous Instagram carousels.

## Run locally

Requires Python 3.9+; no package installation is needed.

```sh
npm run dev
```

Or run `python3 scripts/serve.py` directly. Open http://127.0.0.1:4173. The server binds only to this computer and serves application assets, excluding Git and development records.

## Use the editor

- Add edited JPEG, PNG, or WebP photographs. The app opens empty and additional imports append to the session.
- Auto keeps portraits and squares whole, and proposes two or three connected slides when they make a landscape substantially larger.
- Override any photograph with Single, 2 slides, or 3 slides. The complete framed photograph always comes first, followed by its connected parts; the overview cannot be disabled.
- Select a common canvas ratio: 3:4, 4:5, square, or 1.91:1. Fit each photo keeps complete photos within Instagram’s supported proportions and uses 3:4 viewports for split images, avoiding wide empty halves. Film mode also accounts for the entire physical frame when choosing an adaptive canvas.
- Choose White, Black, Color, or Film. Adjust border and rounded corners. Photos without camera metadata start with Film, and their metadata-footer checkbox is disabled. For photos with camera metadata, enable the footer to edit its prefilled text and size directly; the text is separate for each photo. Frames and metadata appear on the complete photograph, keeping connected edges clear. Film framing does not change photo saturation.
- Move photos using the earlier/later buttons. Each photo’s slide group moves together.
- Export a numbered ZIP, or download individual slides. Auto format offers Custom and Instagram · 1080 px. Instagram sets a shared 3:4 canvas, automatic splits, and 1080×1440 output while preserving the selected PNG or JPEG encoding. Choose Custom to control canvas and resolution independently; changing canvas shape also exits the Instagram preset. Full-resolution PNG is available in Custom. The app allows batches above 20 slides; Instagram’s posting limits are separate. Uncheck Include all photos to export the selected group.

## Image quality

**Full resolution · PNG is the default.** Photo content retains decoded source pixels at 1:1; framing adds canvas space. Native slices share an exact source transform. The full overview can have larger pixel dimensions than its slices, preserving its source detail; all retain the selected aspect ratio. No file-size targets, lossy export, automatic downscaling, filters, sharpening, or enlargement apply in this mode.

**JPEG · 1080 px is explicit.** It creates 1080-pixel-wide, maximum-quality JPEGs in sRGB, encoded once from the source. JPEG remains lossy. Small sources are padded rather than enlarged. Instagram independently resizes and recompresses uploads; this app cannot bypass that.

Previews and library thumbnails use smaller rasters for interaction; exported photographs never derive from them. Canvas exports are SDR sRGB and do not preserve original RAW/HDR/16-bit profiles or embedded source metadata. The metadata footer is visible text. Edit and convert those source formats in a photo editor before import. Very large sources or canvases produce an explicit error, never a silent quality reduction.

Photographs stay on the device. JavaScript libraries and typefaces ship locally; the editor does not upload photos. Only preferences are saved in localStorage. Reloading clears the photo session. v2 preferences migrate without carrying over JPEG quality reductions or artificial 2× enlargement.

## Verification

```sh
npm test
npm run build
```

Node 20+ runs the geometry and settings tests. With the dev server running, open http://127.0.0.1:4173/tests/browser.html for renderer checks: exact source pixels, seamless reassembly for two/three slides, lossless PNG round trips for all four styles, JPEG dimensions, and oversized-export rejection.

The build writes a standalone static candidate to `output/site`, excluding tests, Git, development docs, and local review artifacts. No framework or build dependencies are required. Serve that directory to verify a release candidate before changing hosted configuration.

## Deployment

The previous public site is https://frameitup-ln3n.onrender.com/. This implementation does not automatically publish there. Verify the Render service and repository deployment gates first. Recommended publish directory: `output/site` after `npm run build`. Retain the previously deployed revision and confirm Render’s rollback action before a production release.

Actual account/app upload testing for mixed orientation, final Instagram sharpness/color, and physical iPhone/Android downloads remains required before claiming those behaviors verified. Test posts require an authorized account and audience.

## Sources

- [Instagram photo resolution](https://help.instagram.com/1631821640426723): current documented range 1.91:1 through 3:4; 1080-pixel width baseline.
- [Instagram carousel guidance](https://help.instagram.com/269314186824048): up to 20 media items. Mixed-ratio availability varies; fixed-ratio slides avoid relying on it.
- [Rob Sylvan’s export guide](https://img.kelbymediagroup.com/kelbyone_live/lrc2024/RSylvan_ExportLikeaPro.pdf): sRGB, high-quality JPEG workflow; its older portrait limits are superseded by current Instagram guidance.
- `assets/SOURCES.txt`: locally hosted fonts and pinned library provenance. Rendering fixtures are development-only and excluded from publishing.

## Film frame and visual system

The studio uses one cream, sand, gray and coral scheme with self-hosted Source Serif 4 and Source Sans 3. Motion respects reduced-motion preferences. There is one Add photos action and no theme toggle or preloaded photos. The Fujifilm preset is removed; saved Fuji selections fall back to White. Border width is unitless.

Film framing follows nominal 35mm stock around a 24mm image cross-section, using 2.794×1.981mm KS-shaped perforations at 4.75mm pitch. Rails rotate with the photo, their length adapts to its aspect ratio, and the 35mm label stays outside the original image. Its position is randomized per imported photo and remains stable across previews and exports. Film only, White, and Black background choices frame the complete stock surround; White and Black enable the outer-border control. Perforations stay visible on both mat colors. No frame counters or barcodes are added. All four development passes and research sources are recorded in `tests/film-review.md`. Open `/tests/film.html` on the dev server to inspect the aspect-ratio matrix; this review surface is excluded from the release build.
