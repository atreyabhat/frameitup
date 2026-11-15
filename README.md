# Frame It Up

A private, browser-only photography workspace for framing complete images and preparing continuous Instagram carousels.

## Run locally

Requires Python 3.9+; no package installation is needed.

```sh
npm run dev
```

Or run `python3 scripts/serve.py` directly. Open http://127.0.0.1:4173. The server binds only to this computer and serves application assets, excluding Git and development records.

## Use the editor

- Add edited JPEG, PNG, or WebP photographs. The app opens empty; additional imports append to the session.
- New photos use Instagram sizing, a 3:4 canvas, automatic splits, border width 5, and metadata off. JPG at 90% is the initial encoding default.
- Auto keeps portraits and squares whole and suggests connected parts for suitable landscapes. Single, 2 slides, and 3 slides override the selected photo. The full framed overview always precedes connected parts.
- Auto format selects Instagram (1080 pixels wide) or Custom (source resolution) for the selected photo. Canvas shape is independent: 3:4, 4:5, square, 1.91:1, or Fit each photo. Changing shape retains the resolution profile. Fit each photo uses supported proportions and 3:4 split viewports.
- Auto format and Canvas shape each have an independent Apply to all photos checkbox. Checking one immediately copies that selected setting; subsequent changes use that scope. Format scope copies profile, canvas, and split; canvas scope copies only shape. Frame, metadata, file encoding, and quality remain per-photo.
- Choose White, Black, Color, or Film. Border width, rounded corners, and metadata text size have numeric entry and decrement/increment controls. Photos without camera metadata start with Film and a disabled metadata-footer checkbox. Otherwise enable the footer to edit its prefilled text. Frames and metadata stay on the overview, leaving connected edges clear.
- Choose JPG or PNG independently of resolution. JPG quality ranges from 10–100%; PNG disables the quality slider and remains lossless. Move photos with earlier/later actions; each slide group moves together.
- Export all photos as a numbered ZIP, the selected group by unchecking Include all photos, or one slide with Download this slide. Batches above 20 slides are allowed; Instagram’s posting limits are separate.

## Image quality

**The initial default is Instagram-sized JPG at 90%.** Instagram profile outputs 1080-pixel-wide files at the selected canvas ratio. JPG is encoded once at the selected quality and remains lossy. Small sources are padded instead of enlarged. PNG offers lossless encoding at the same posting size.

**Custom uses source resolution with either encoding.** Photo content keeps a 1:1 decoded source transform; framing adds canvas space. Connected slices share an exact source transform. Full overviews may have larger dimensions than their slices. PNG preserves rendered pixels; JPG applies the selected lossy quality. No sharpening, filters, or enlargement are added. Instagram may resize and recompress files independently.

There is no application-level 80-megapixel import cutoff. Import still depends on browser decoding and memory. Sources above 24 megapixels use a working bitmap with a maximum long edge of 4320 pixels where createImageBitmap is available. The original file and dimensions remain in the session; source-resolution exports decode the original file again rather than enlarging the working copy. Posting-size output can use the working bitmap. Previews and thumbnails are smaller interaction rasters.

Export canvases retain the reliability guard: no side above 16384 pixels and no canvas above 64 megapixels. An oversized source-resolution output reports an error; use Instagram sizing or a smaller edited source. Canvas output is SDR sRGB, without original RAW/HDR/16-bit profiles or embedded source metadata. Footer metadata is visible text.

Photos stay on the device. Libraries and custom fonts ship locally; the app uploads no photographs. Only preferences are stored in localStorage. Reloading clears the photo session.

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

The studio uses one cream, sand, gray and coral scheme. Source Serif 4 serves the identity; controls use the platform system sans-serif stack with locally hosted Source Sans 3 as a fallback. Motion respects reduced-motion preferences. There is one Add photos action and no theme toggle or preloaded photos. The Fujifilm preset is removed; saved Fuji selections fall back to White. Border width is unitless.

Film framing follows nominal 35mm stock around a 24mm image cross-section, using 2.794×1.981mm KS-shaped perforations at 4.75mm pitch. Rails rotate with the photo, their length adapts to its aspect ratio, and the 35mm label stays outside the original image. Its position is randomized per imported photo and remains stable across previews and exports. Film only, White, and Black background choices frame the complete stock surround; White and Black enable the outer-border control. Perforations stay visible on both mat colors. No frame counters or barcodes are added. All four development passes and research sources are recorded in `tests/film-review.md`. Open `/tests/film.html` on the dev server to inspect the aspect-ratio matrix; this review surface is excluded from the release build.

Film-framed photographs and photographs detected as film (no readable camera EXIF at import) always remain whole. This classification stays with the photo if its frame changes. Automatic, explicit, shared and preset layouts all respect this rule; two-/three-part controls are disabled for these photos. Digital photos continue to split automatically only when occupancy improves by at least 15 percentage points.
