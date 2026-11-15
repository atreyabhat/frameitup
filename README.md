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
- New photos use Instagram sizing, a 3:4 canvas, Single, border width 5, and metadata off. JPG at 90% is the initial encoding default.
- Single is the default for every photo. 2 slides and 3 slides are explicit per-photo choices. The full framed overview always precedes connected parts.
- Auto format selects Instagram (1080 pixels wide) or Custom (source resolution) for the selected photo. Canvas shape is independent: 3:4, 4:5, square, 1.91:1, or Fit each photo. Changing shape retains the resolution profile. Fit each photo uses supported proportions and 3:4 split viewports.
All edits affect the selected photo. One Apply settings to all photos action copies layout, frame and export settings once; later edits remain individual. Camera metadata, footer visibility and edited metadata text stay with each photo.
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

Film framing follows nominal 35mm stock around a 24mm image cross-section, using 2.794×1.981mm KS-shaped perforations at 4.75mm pitch. Rails rotate with the photo, their length adapts to its aspect ratio, and the 35MM label stays outside the original image. Its position is randomized per imported photo and remains stable across previews and exports. White and Black background choices frame the complete stock surround; White and Black enable the outer-border control. Perforations stay visible on both mat colors. No frame counters or barcodes are added. All four development passes and research sources are recorded in `tests/film-review.md`. Open `/tests/film.html` on the dev server to inspect the aspect-ratio matrix; this review surface is excluded from the release build.

Film-framed photographs and photographs detected as film (no readable camera EXIF at import) always remain whole. This classification stays with the photo if its frame changes. Explicit, shared and preset layouts all respect this rule; two-/three-part controls are disabled for these photos. Digital photos default to Single and split only when explicitly selected.

The editor occupies the viewport. The left library and right settings panel scroll independently; preview and export actions stay fixed. Layout and Frame share one scrollable Layout & frame tab, with Export as the other tab. Expanded frame details remain in the same flow. Original aspect ratio appears beside the filename.

Film defaults to border 0. Non-perforated stock ends are flush with the photo in either orientation. Follow photo proportions (previously Fit each photo) chooses a canvas from the photo and frame within supported posting ratios; split images use portrait 3:4 slides.

Film background offers Black and White only. Legacy Film only settings map to Black. Film border defaults to 0; non-film imports retain border 5.

Metadata font choices: DM Mono (default), Space Mono, Courier Prime, Barlow Condensed, and Source Serif 4. The small Font dropdown appears with the enabled metadata footer. Selection is per photo; the one-time bulk action copies font styling while preserving individual metadata text. Fonts are hosted locally and explicitly loaded before measuring or rendering previews and exports.

Slide controls offer Single, Detail, 2 slides and 3 slides. Legacy Auto settings map to Single. Switching from Film to a non-film frame restores border 5. The Frame heading has no scope suffix or separator line.


## Detail slides and copies

Single remains the import default. Detail adds one close-up after the full photograph; it starts centered at 2×. Selecting the Detail thumbnail opens the finished crop beside the original, with a draggable crop rectangle, 1–4× zoom, and Center action. Arrow keys move the crop; Shift increases the step. The crop follows the selected canvas ratio and stays inside the source. Crop position and zoom remain individual when presentation settings are copied to all photos.

Detail is an explicit choice, including for film photos; film is never automatically split. Film stock and metadata stay on the full photograph, while the detail shows only the selected image region. Posting-size detail exports fill the canvas; a small-source notice appears when enlargement is necessary. Custom-resolution details retain the selected source pixels. Working-copy imports decode the original for detail exports.

Each bottom thumbnail has a Duplicate action. Copies appear immediately after their source with a 200ms entrance and maintain independent settings, including metadata on full-photo copies. Copies can be removed separately and remain intact when the original sequence changes. Export numbering follows the visible slide order. Layout controls are omitted for a copy because the copy is one existing slide; frame controls are omitted for copied crop/part slides. Reduced-motion preferences remove the entrance.

The photo library is 25% wider (180px desktop, 200px wide desktop, 140px compact desktop, 95px mobile). Thumbnail dimensions are omitted; source dimensions remain above the main preview. Mouse clicks do not create an outer focus rectangle. Keyboard focus remains visible with a close neutral indicator. Film hides Rounded corners and always preserves square image corners.


Square Film output with border 0 and no metadata footer now adapts its stock to fill the entire square. Landscape rails expand above/below the intact photo; portrait rails expand at the sides. Perforations retain their proportions and pitch; their size reduces for narrow rails. Near-square sources use a minimum visible rail and a continuous film surround. Non-square canvases and explicitly added border/footer space retain their existing mat layout. White/Black selects the perforation background when the stock fills the canvas.

Missing camera metadata still initializes Film, but only the currently selected Film style disables two/three-part splitting. Switching to White, Black, or Color enables split controls and uses the normal Auto format behavior, including for Photoshop exports without EXIF.
