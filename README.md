# frameitup

Frameitup is a client-side web app to add clean borders and stylized frames to photos for social uploads.

## What is new in v2

- Professional filmic UI with a simple workflow: upload, choose preset, process, download.
- Light/Dark theme toggle with persistent preference.
- Instagram Mode toggle that forces all exports to one fixed selected aspect ratio.
- Instagram Mode aspect selector:
  - `Landscape 1.91:1` -> `1080x566`
  - `Portrait 3:4` -> `1080x1440`
- Fuji Style preset with:
  - Bottom-left logo
  - Bottom-right compact EXIF line
  - White-only background/border style for a clean consistent look
  - Checkbox controls to include/exclude EXIF fields (camera, focal length, aperture, shutter, ISO)
  - Optional custom note checkbox + text (example: `30 frames stacked`)
  - EXIF font-size slider with 10 fixed discrete steps
  - EXIF text auto-wraps to up to 2 lines when needed (all modes)
- 2x internal supersampling for final Fuji/Instagram renders to improve edge smoothness.
- Non-Instagram resolution option (`Original` or `2x`) for sharper zoomed-in exports.
- Drag-and-drop upload support.
- Per-file failure isolation in batch processing.
- Settings persistence in localStorage with key `frameitup.settings.v2`.

## Presets

- `Classic White`
- `Classic Black`
- `Average Color`
- `35mm Film`
- `Fuji Style`

## Instagram Mode

When Instagram Mode is enabled:

- Output is fixed to the selected Instagram aspect:
  - Landscape `1080x566` (`1.91:1`)
  - Portrait `1080x1440` (`3:4`)
- Portrait and landscape images are both contain-fitted (never cropped).
- Mixed-orientation batches produce consistent dimensions for carousel posting.

## iPhone usage

- Open the site in Safari.
- Tap the upload area, then choose `Photo Library`, `Take Photo`, or `Browse`.
- Select your preset and (optionally) turn on Instagram Mode.
- In Instagram Mode, choose `Landscape` or `Portrait` so all outputs share one aspect ratio.
- Tap `Process Images`, then `Download` on each card or `Download All (ZIP)`.

## Fuji Style EXIF behavior

- `EXIF Source: Auto` tries to read metadata from each uploaded image.
- If EXIF data is missing, manual fallback text is used (if provided).
- `EXIF Source: Manual` always uses the manual EXIF text.
- If no EXIF/manual data is available, footer text is left blank.

## Tech notes

- Single page app (`index.html`) with vanilla JS and canvas rendering.
- Uses CDN libraries:
  - JSZip
  - FileSaver
  - exifr (for EXIF parsing)
- No backend required.

Live link: [https://frameitup-ln3n.onrender.com/](https://frameitup-ln3n.onrender.com/)
