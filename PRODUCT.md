# Frame It Up

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Atreya and photographers preparing edited photographs for Instagram on desktop and phones.

## Product Purpose

Frame complete photographs and make landscapes readable as two or three continuous carousel slides preceded by a full framed overview. Automatically propose each photo's layout, with per-photo overrides.

## Capabilities and Constraints

Static local processing, four frame styles, editable metadata footers, individual downloads, and numbered ZIPs. Initial settings are Instagram sizing, 3:4, automatic split, border 5, metadata off, and JPG at quality 90%. PNG is lossless and disables the quality slider. JPG quality is adjustable from 10–100%. File encoding is separate from Instagram 1080-pixel sizing or Custom source resolution.

Each photo retains its resolution profile, canvas, split, frame, footer text, encoding, and quality. Auto format and Canvas shape have independent apply-all checkboxes; canvas changes preserve the resolution profile. Format batch scope copies profile, ratio, and split; canvas batch scope copies only ratio. The overview always precedes parts. No 20-slide application batch cap applies; platform posting limits are separate.

Photos without camera metadata default to Film with a disabled footer control. Other photos offer prefilled directly editable text. There is no metadata source-mode selector, field-toggle group, or separate custom note.

No fixed 80-megapixel import cutoff. Above 24 megapixels, supported browsers keep a working bitmap at a maximum 4320-pixel long edge while retaining the original file and dimensions. Source-resolution exports decode the original again. Export canvases remain bounded to 16384 pixels per side and 64 megapixels, with an explicit error when exceeded. No backend, sign-in, direct publishing, or performance controls in the primary workflow. Native mixed-ratio Instagram support requires account verification.

## Brand Commitments

Keep Frame It Up and one cream (#eae7dc), sand (#d8c3a5), gray (#8e8d8a), coral (#e98074/#e85a4f) world, with darker functional variants for contrast. Source Serif 4 anchors the identity; the editor uses system typography with Source Sans 3 fallback. Keep language functional, one Add photos action, no theme toggle, and no preloaded photos. Use numeric steppers for border, corners, and footer text size; reserve the quality slider for JPG. Keep panes quiet and the trash action easy to identify.

Four styles: White, Black, Color, Film. Film uses only a 35mm label, randomized once per imported photo and stable across previews and exports, with optional white/black surround and width control. No counters or barcodes.

## Evidence on Hand

Existing static code and the approved Frame It Up Revamp Plan in Pages, superseded where the latest user request changes color, frame presets, ordering and Instagram setup. November 14 follow-up authorizes implementation and asks to see a local deployment soon. Use the approved brief directly rather than restarting discovery or visual option approval.

## Product Principles

- Preserve source detail and make export transformations explicit.
- Let the photograph lead the workspace.
- Keep continuous slide boundaries mathematically consistent.
- Handle performance internally rather than asking the photographer to tune it.

## Open Decisions

Actual Instagram account support for Mixed orientation, hosting configuration, and support beyond edited SDR sRGB JPEG/PNG need verification. The initial browser workflow does not claim archival RAW/HDR preservation.
