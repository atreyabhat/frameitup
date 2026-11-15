# Frame It Up

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Atreya and photographers preparing edited photographs for Instagram on desktop and phones.

## Product Purpose

Frame complete photographs and make landscapes readable as two or three continuous carousel slides preceded by a full framed overview. Default every photo to Single; allow explicit two- or three-part splits for digital photos.

## Capabilities and Constraints

Static local processing, four frame styles, editable metadata footers, individual downloads, and numbered ZIPs. Initial digital settings are Instagram sizing, 3:4, Single, border 5, metadata off, and JPG at quality 90%. Film imports or selecting Film default to square, border 0, and no splitting. PNG is lossless and disables the quality slider. JPG quality is adjustable from 10–100%. File encoding is separate from Instagram 1080-pixel sizing or Custom source resolution.

All edits affect the selected photo. One Apply settings to all photos action copies layout, frame and export settings once; later edits remain individual. Camera metadata, footer visibility and edited metadata text stay with each photo.

Photos without camera metadata default to Film with a disabled footer control. Other photos offer prefilled directly editable text. There is no metadata source-mode selector, field-toggle group, or separate custom note.

No fixed 80-megapixel import cutoff. Above 24 megapixels, supported browsers keep a working bitmap at a maximum 4320-pixel long edge while retaining the original file and dimensions. Source-resolution exports decode the original again. Export canvases remain bounded to 16384 pixels per side and 64 megapixels, with an explicit error when exceeded. No backend, sign-in, direct publishing, or performance controls in the primary workflow. Native mixed-ratio Instagram support requires account verification.

## Brand Commitments

Keep Frame It Up and one cream (#eae7dc), sand (#d8c3a5), gray (#8e8d8a), coral (#e98074/#e85a4f) world, with darker functional variants for contrast. Source Serif 4 anchors the identity; the editor uses system typography with Source Sans 3 fallback. Keep language functional, one Add photos action, no theme toggle, and no preloaded photos. Use numeric steppers for border, corners, and footer text size; reserve the quality slider for JPG. Keep panes quiet and the trash action easy to identify.

Four styles: White, Black, Color, Film. Film uses only a 35MM label, randomized once per imported photo and stable across previews and exports, with optional white/black surround and width control. No counters or barcodes.

## Evidence on Hand

Existing static code and the approved Frame It Up Revamp Plan in Pages, superseded where the latest user request changes color, frame presets, ordering and Instagram setup. November 14 follow-up authorizes implementation and asks to see a local deployment soon. Use the approved brief directly rather than restarting discovery or visual option approval.

## Product Principles

- Preserve source detail and make export transformations explicit.
- Let the photograph lead the workspace.
- Keep continuous slide boundaries mathematically consistent.
- Handle performance internally rather than asking the photographer to tune it.

## Open Decisions

Actual Instagram account support for Mixed orientation, hosting configuration, and support beyond edited SDR sRGB JPEG/PNG need verification. The initial browser workflow does not claim archival RAW/HDR preservation.

Film-framed photographs and photographs detected as film (no readable camera EXIF at import) always remain whole. This classification stays with the photo if its frame changes. Explicit, shared and preset layouts all respect this rule; two-/three-part controls are disabled for these photos. Digital photos default to Single and split only when explicitly selected.

The editor occupies the viewport. The left library and right settings panel scroll independently; preview and export actions stay fixed. Layout and Frame share one scrollable Layout & frame tab, with Export as the other tab. Expanded frame details remain in the same flow. Original aspect ratio appears beside the filename.
- Film detection or selecting Film defaults to Square; users can explicitly choose another shape. Film remains unsplit.
- Film stock includes slight stable amber edge fog and wear outside the picture, with uppercase `35MM` lettering.
- The output quality track distinguishes the filled segment. Remove the posting guide.

Film stock has no end padding on non-perforated edges. Aspect-ratio padding remains only as required to fit the complete photograph and sprockets. Amber edge blooms vary in count, spread, intensity and angle; straight simulated scratch lines are removed.

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
