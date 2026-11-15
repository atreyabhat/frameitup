---
name: Frame It Up
description: Cream photography workspace with system typography and precise per-photo controls.
colors:
  page: '#eae7dc'
  panel: '#f6f3ec'
  stage: '#dedbd1'
  ink: '#302f2b'
  muted: '#66645e'
  line: '#d4cfc4'
  accent: '#a93f36'
  coral: '#e85a4f'
  sand: '#d8c3a5'
  accent-soft: '#ecd5c8'
  button-ink: '#fffaf4'
  hover: '#e5e0d5'
  danger: '#a33329'
  swatch-gray: '#8e8d8a'
  scrollbar: '#aaa393'
  upload-hover: '#47443d'
  export-hover: '#8c332c'
  library: '#eeebe3'
  stage-surface: '#e0ddd4'
  field-surface: '#fffdf780'
  field-line: '#d9d3c7'
  segment-surface: '#e9e5dc'
  selected-surface: '#fffdf8'
  stepper-line: '#d7d1c4'
  slider-track: '#d4cec1'
  slider-thumb-line: '#b8b0a0'
typography:
  brand:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: 27px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.035em
  title:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 19px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.015em
  body:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  section:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  hint:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
  text-action:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  empty-state:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.02em
  scope:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", "Source Sans 3", sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  image: 1px
  surface: 2px
  selection: 3px
  control: 4px
  field: 8px
  segment-selected: 5px
  stage: 9px
  stepper: 9px
  trash: 10px
spacing:
  '2': 2px
  '3': 3px
  '4': 4px
  '5': 5px
  '6': 6px
  '7': 7px
  '8': 8px
  '9': 9px
  '10': 10px
  '12': 12px
  '14': 14px
  '15': 15px
  '16': 16px
  '17': 17px
  '18': 18px
  '20': 20px
  '22': 22px
  '24': 24px
  '25': 25px
  '26': 26px
  '28': 28px
  '30': 30px
  '36': 36px
  '46': 46px
  '48': 48px
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.button-ink}'
    rounded: '{rounded.control}'
    padding: 9px 17px
    height: 44px
  button-primary-hover:
    backgroundColor: '{colors.upload-hover}'
  button-export:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.button-ink}'
    rounded: '{rounded.control}'
    padding: 9px 17px
    height: 44px
    width: 100%
  button-export-hover:
    backgroundColor: '{colors.export-hover}'
  button-text:
    textColor: '{colors.accent}'
    typography: '{typography.text-action}'
    padding: 6px 0
    height: 44px
  button-icon:
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    height: 44px
    width: 44px
  auto-format:
    backgroundColor: '{colors.field-surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    padding: 9px
    height: 44px
    width: 100%
  field:
    backgroundColor: '{colors.field-surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    padding: 9px
    height: 44px
    width: 100%
  layout-segment:
    typography: '{typography.caption}'
    rounded: '{rounded.segment-selected}'
    padding: 5px 2px
    height: 38px
  layout-segment-selected:
    backgroundColor: '{colors.selected-surface}'
    textColor: '{colors.ink}'
  photo-item:
    rounded: '{rounded.selection}'
    padding: 5px
    width: 100%
  photo-item-selected:
    backgroundColor: '{colors.accent-soft}'
    rounded: '{rounded.selection}'
  frame-option:
    typography: '{typography.caption}'
    rounded: '{rounded.selection}'
    padding: 0 0 5px
    height: 65px
  slide-tile:
    rounded: '{rounded.selection}'
    padding: 5px
  preview-stage:
    backgroundColor: '{colors.stage-surface}'
    rounded: '{rounded.stage}'
    padding: 26px 48px
    height: clamp(340px,55vh,640px)
  stepper:
    backgroundColor: '{colors.selected-surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.stepper}'
  stepper-button:
    width: 38px
    height: 40px
  stepper-input:
    textColor: '{colors.ink}'
    width: 42px
    height: 36px
    padding: '0'
  scope-checkbox:
    typography: '{typography.scope}'
    textColor: '{colors.muted}'
    height: 36px
  quality-slider:
    height: 32px
    width: 100%
  remove-photo:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.trash}'
    width: 46px
    height: 46px
---

# Design System: Frame It Up

## Overview

**Creative North Star: "The Photography Light Table"**

The Photography Light Table uses one cream and sand palette, warm gray structure, charcoal text, and restrained coral accents. The identity and empty invitation use Source Serif 4; the editor uses the platform system sans-serif stack, with Source Sans 3 as a fallback.

Quiet panes and compact controls keep photographs central. Exact values use editable numeric steppers; JPEG quality keeps a bounded slider. The final cascade in styles.css and the controls in index.html are normative.

**Key Characteristics:**
- One fixed light palette; no theme switch.
- Serif identity and system-font controls.
- Per-photo settings with independent batch-scope checkboxes.
- Soft field edges, restrained shadows, and visible numeric values.

## Colors

### Primary

The reference coral remains available as coral. Its darker functional accent carries export, text actions, focus, and checkboxes; accent-soft supplies selected photograph and frame fills. Add photos is charcoal. Primary and export hover values remain distinct.

### Secondary

Sand appears in the Color frame sample. Native selects remain neutral.

### Neutral

Page is cream, the library is slightly darker, and panel is the lighter inspector. Stage-surface is the actual preview backdrop; stage remains the small-preview fallback. Fields use a translucent warm white surface, fine field-line, and subtle shadow. Layout segments use a quiet backing with a raised white selection. Ink and muted separate controls from supporting measurements. Exact palette values are in frontmatter.

## Typography

The wordmark and invitation use locally hosted Source Serif 4. Body, filenames, labels, selects, and numeric controls use the system stack in frontmatter; Source Sans 3 remains a locally hosted fallback and serves the rendered film label. Body size is (14px), photograph title (19px), legends (15px), labels and text actions (13px), and captions and scope labels (12px). Measurements use tabular numerals. The system stack adapts its face to the platform; this web interface does not claim native Dynamic Type behavior.

At (760px) and below, the wordmark uses (24px), photo title (18px), and invitation (28px). At (380px) and below, the wordmark uses (22px).

## Layout

Desktop uses rail / flexible preview / inspector columns (150px / minmax(0,1fr) / 350px). Header height is (78px). Workspace padding is (25px 30px 24px); inspector padding is (25px 22px). Settings sections have (25px) bottom padding and margin. The photograph fits within a stage of (clamp(340px,55vh,640px)) with (26px 48px) padding. The empty library is hidden.

- At (1500px) and above: columns (168px / minmax(0,1fr) / 380px); workspace padding (28px 48px); stage (clamp(400px,57vh,680px)).
- At (1100px) and below: columns (115px / minmax(0,1fr) / 310px); workspace padding (24px 18px); inspector padding (24px 17px).
- At (760px) and below: photograph, horizontal photo rail, then inspector. The header is (68px) high; workspace padding is (18px). Inspector uses two columns with (24px 22px 36px) padding; export and posting guidance span both. Split segments use two columns. Stage is (clamp(290px,48svh,500px)) with (24px 46px) padding. The inspector shadow is removed. Trash control becomes (42px × 44px); other photo actions become (36px) wide.
- At (560px) and below: inspector stacks, split segments return to four columns, and download links stack filename and dimensions.
- At (380px) and below: header gutters are (12px); non-trash photo actions become (30px) wide.

Desktop photo thumbnails are (87px) tall, compact desktop (67px), and mobile (57px) within (86px) wide choices. Slide canvases are (88px) tall on desktop and (76px) on mobile. Both rails scroll when needed. The full photograph is separated from connected parts with a fine divider. Empty stage is (calc(100svh - 166px)), minimum (400px); mobile uses (42svh), minimum (260px). The status row stays in document flow.

## Elevation & Depth

Tonal panes and fine borders provide structure. The photograph uses a soft offset shadow; the inspector has a very faint lateral shadow on desktop. Fields, selected split segments, steppers, and the quality thumb have subtle local shadows. Exact values are in the sidecar. There is no decorative blur or glass layer.

## Shapes

Photograph thumbnails retain nearly square corners. The preview and numeric stepper use softly rounded corners; fields and split groups use their own slightly smaller radius. The larger trash button has a distinct radius and visible border. Photograph rounding remains an explicit user setting. Film rails rotate with source orientation. The 35mm label position is chosen once per imported photo and stays stable across previews and exports.

## Components

- **Actions:** Add photos is charcoal; export is the functional accent. Main buttons have a (44px) minimum height. Contextual text actions reveal an underline on hover. Trash is larger, outlined, and uses a (22px) icon; hover changes its fill and ink to the accent treatment. Disabled buttons use opacity (.4).
- **Auto format and Canvas shape:** separate native selects. Each has its own adjacent Apply to all photos checkbox, unchecked by default. Selecting a profile changes the current photo unless its scope checkbox is checked. Canvas changes retain the chosen resolution profile. Auto format batch scope copies the selected profile, ratio, and split; canvas batch scope copies only ratio.
- **Precision controls:** border width, rounded corners, and metadata text size use decrement / editable number / increment. Buttons are (38px × 40px); numeric input is (42px × 36px). Border is bounded (0–16), corners (0–25), and text size (1–10), with step (1). The current value is always visible. Film only hides the border row; White and Black film backgrounds expose it.
- **Quality:** File format offers PNG and JPG independently of resolution profile. The output-quality slider spans (10–100%) in steps of (1), with its value shown beside the label. PNG disables it and identifies the encoding as Lossless in the quality description. A warm neutral track and pale round thumb keep it subordinate to the photograph.
- **Metadata:** Frame details contains a footer checkbox, prefilled directly editable textarea, and text-size stepper. Footer starts off. When camera metadata is unavailable, its checkbox is disabled and a concise explanation appears. There is no source-mode selector, field-toggle group, or custom-note field.
- **Selections:** photo and frame choices share the accent outline and soft fill. Split segments use white selected fill, charcoal text, and a subtle shadow. Each split segment has a (38px) minimum height. Frame styles remain White, Black, Color, and Film.
- **Focus and browser surfaces:** focus is a (2px) accent outline offset (4px); focused selects and textareas also change border color. Selection uses accent-soft and ink; caret uses accent; scrollbars use warm gray. The skip link is clipped until keyboard focus.
- **Motion:** control transitions use (.18s); enabled main buttons press down (1px). Photograph selection settles from opacity (.7) and translateY(3px) over (220ms). Metadata controls enter over (.18s ease-out) from opacity (.7) and translateY(-3px). Unselected slide tiles rise (2px) on hover. Reduced motion removes animations, transitions, and smooth scrolling.

Control choices are informed by Apple’s HIG: [steppers](https://developer.apple.com/design/human-interface-guidelines/steppers) pair incremental adjustment with an obvious value and direct entry; [sliders](https://developer.apple.com/design/human-interface-guidelines/sliders) support a bounded range and visible feedback; [toggles and checkboxes](https://developer.apple.com/design/human-interface-guidelines/toggles) represent independent opposing states. [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) need clear purpose and usable hit regions; [typography](https://developer.apple.com/design/human-interface-guidelines/typography) prioritizes legibility and hierarchy; [sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars) should adapt to available space. These principles inform the web implementation; they do not assert native-platform compliance.

## Do's and Don'ts

### Do:

- Do preserve the fixed cream, sand, gray, and coral world.
- Do use system typography for controls and Source Serif 4 for identity and invitation.
- Do show the current value beside decrement and increment actions, with direct numeric entry.
- Do keep Auto format and Canvas shape scope independent.
- Do keep visible focus and reduced-motion behavior.

### Don't:

- Don't reintroduce dark/light themes, marketing copy, or preloaded photographs.
- Don't describe file encoding as a resolution choice; JPG/PNG and Instagram/Custom are independent.
- Don't add film counters or barcodes; 35mm is the only film lettering.
- Don't add source-mode selectors, metadata field toggles, or custom-note controls.

Film-framed or detected-film photos always use one full-photo slide. Split-count buttons are disabled for these photos; Auto and Single remain available. Detection persists when a user changes the frame.

### Bounded editing workspace

The editor occupies the viewport; only the left library scrolls. Preview and export actions stay in place. Layout, Frame and Export tabs expose one inspector section at a time, with arrow-key navigation. Frame details replace the basic frame controls while open, keeping metadata editing within the same space. Individual download recovery links sit in the scrollable library rather than extending the preview. The slide strip fits at most four thumbnails without a second scrollbar. Small screens retain a vertical library beside the preview and a compact tabbed inspector below it.

The quality slider fills its leading segment in muted amber. Film defaults square, uses uppercase `35MM`, and has seeded amber edge patina confined to the stock. See tests/film-review.md for sources.
