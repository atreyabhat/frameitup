---
name: Frame It Up
description: One cream and sand photography workspace with restrained coral controls.
colors:
  page: '#eae7dc'
  panel: '#f3f0e8'
  stage: '#dedbd1'
  ink: '#302f2b'
  muted: '#66645e'
  line: '#cdc8bc'
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
typography:
  brand:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: 27px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.035em
  title:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 19px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.015em
  body:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  section:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  hint:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
  text-action:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  empty-state:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.02em
rounded:
  image: 1px
  surface: 2px
  selection: 3px
  control: 4px
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
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: 9px
    height: 44px
    width: 100%
  field:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: 9px
    height: 44px
    width: 100%
  layout-segment:
    typography: '{typography.caption}'
    rounded: '{rounded.surface}'
    padding: 5px 2px
    height: 38px
  layout-segment-selected:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.accent}'
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
    backgroundColor: '{colors.stage}'
    rounded: '{rounded.surface}'
    padding: 26px 48px
    height: clamp(340px,55vh,640px)
---

# Design System: Frame It Up

## Overview

**Creative North Star: "The Photography Light Table"**

The Photography Light Table uses a single cream and sand visual system, warm gray structure, charcoal text, and restrained coral interaction accents. Source Serif 4 gives the identity a composed serif voice; Source Sans 3 keeps photographs, measurements, and settings readable.

Working surfaces stay flat and compact. Photograph frames remain separate from the interface palette. The current implementation in styles.css and index.html is normative; the editor uses plain HTML, CSS, and JavaScript.

**Key Characteristics:**
- One fixed light palette; no theme switch.
- Serif identity with sans-serif filenames and controls.
- Fine borders, small corner radii, and restrained selection states.

## Colors

### Primary

The reference coral is retained as the coral token. The darker functional accent carries export, text actions, pressed states, ranges, checkboxes, and focus so these remain legible on cream surfaces. Accent-soft supplies the subdued selected fill. Charcoal distinguishes Add photos from the coral export action.

### Secondary

Sand is retained in the Color frame sample. Auto format uses the same native select treatment as canvas and export format.

### Neutral

Page is the cream workspace; panel is the slightly lighter rail and inspector; stage is the gray preview surface. Ink and muted distinguish content from measurements and supporting text. Line separates fields and regions; hover supplies quiet feedback. Swatch-gray represents photograph content in frame samples. Scrollbar, selection, and caret use the same palette. The frontmatter records exact values; the sidecar's tonal ramps are display metadata rather than additional application colors.

## Typography

Both variable font families are hosted locally with font-display swap. Source Serif 4 serves the wordmark and empty invitation. Source Sans 3 serves filenames, controls, descriptions, and measurements. Photograph titles are medium-weight sans-serif. Numeric measurements and counts use tabular figures.

The frontmatter records desktop roles. Field labels and text actions use (13px), captions and hints (12px), settings legends (15px), and photograph titles (19px). The wordmark becomes (24px) at the mobile breakpoint and (22px) on the smallest phones. Mobile photograph titles use (18px), and the empty invitation becomes (28px). The invitation uses a tighter line height; other text follows the role values above.

## Layout

Desktop uses a photo rail, flexible photograph workspace, and inspector: (150px / minmax(0,1fr) / 350px). Header height is (78px); workspace padding is (25px 30px 24px), and inspector padding is (25px 22px). The stage height is (clamp(340px,55vh,640px)); its photograph fits without stretching. The rail is hidden while empty, leaving the workspace and inspector. Empty-stage height is (calc(100svh - 166px)), with a minimum of (400px).

- At (1500px) and above: columns (168px / minmax(0,1fr) / 380px), workspace padding (28px 48px), stage height (clamp(400px,57vh,680px)).
- At (1100px) and below: columns (115px / minmax(0,1fr) / 310px), workspace padding (24px 18px), inspector padding (24px 17px), rail thumbnail height (67px).
- At (760px) and below: the photograph workspace comes first, horizontal photo rail second, inspector third. Header height is (68px). Workspace padding is (18px); inspector padding is (24px 22px 36px). The inspector has two columns; export and posting guidance span both. Layout segments use two columns. The stage uses (clamp(290px,48svh,500px)) and (24px 46px) padding. Empty stage uses (42svh), minimum (260px). Rail choices are (86px) wide with (57px) thumbnails; slide thumbnails are (76px) tall. Photo-action widths become (36px).
- At (560px) and below: inspector sections stack, layout segments return to four columns, and download result links stack their name and dimensions.
- At (380px) and below: header gutters are (12px), and photo-action widths become (30px).

The slide sequence scrolls horizontally and separates the full photograph from connected parts with a fine divider. The selected slide and selected photograph share the accent outline and soft fill. The status row remains in document flow.

## Elevation & Depth

Tonal surfaces and single-pixel borders distinguish regions. The fitted photograph alone has a soft offset shadow (0 10px 30px #4d47341c). Buttons, inspector, rail, and arrows remain flat.

## Shapes

Photograph thumbnails use nearly square corners. Preview surfaces, selected items, and controls use the small radii in the frontmatter. Fields and arrows follow the control radius. Rounded photograph corners are an explicit user setting, independent of the interface shapes. Film samples show pale perforations on dark stock; the rendered frame preserves source orientation and uses 35mm as its only film lettering. The label position varies per imported photograph and remains stable across that photograph’s previews and exports.

## Components

- **Buttons:** Add photos uses charcoal; export uses the functional accent. Both use a minimum height of (44px), medium weight, and the control radius. Text actions use accent and reveal an underline on hover. Icon actions use the same radius and authored stroke SVGs. Disabled buttons use opacity (.4).
- **Auto format:** a native select with Custom and Instagram · 1080 px choices. It shares the field treatment and has an explicit all-photos label. The caption describes the chosen setup. Changing canvas shape returns the select to Custom.
- **Fields:** native selects, text inputs, and textareas use panel, ink, line, the control radius, and a minimum height of (44px). Focused selects and textareas also change their border to accent. Ranges and checkboxes use accent. The per-photo metadata textarea and text-size control remain inside Frame details. Text is prefilled from the source and can be edited directly; there is no source-mode selector, field-toggle group, or custom-note field. The footer checkbox is disabled when camera metadata is unavailable, with a concise explanation. The film-background choice appears only for Film. Film only hides the border control; White and Black backgrounds expose it.
- **Layout segments:** four equal choices with a fine outlined group. Selected state uses accent-soft, accent, and weight (600). Each segment has a minimum height of (38px); responsive column changes are recorded above.
- **Photo navigation:** image, truncated filename, and source dimensions. Desktop thumbnails are (87px) tall. Selection uses the shared accent treatment. On mobile the rail scrolls horizontally.
- **Frame choices:** White, Black, Color, and Film share one compact group. Neutral swatches show frame treatment without introducing sample photographs. Selected state follows the shared treatment. Film's optional white or black surround and width remain per-photo settings.
- **Slide tiles:** small canvas previews with meaningful ordered captions. Desktop canvas height is (88px); the full photograph is separated from slices by a divider. Unselected tiles move up (2px) on hover.
- **Focus and browser surfaces:** focus is a (2px) accent outline offset (4px). The skip link is clipped until keyboard focus. Selection uses accent-soft and ink; caret uses accent; scrollbars use the warm gray token. Programmatic workspace focus suppresses its outline.
- **Motion:** controls transition over (.18s), using cubic-bezier(.16,1,.3,1) for background and ease for borders, shadow, and transform. Enabled main buttons press down (1px). A changed photograph settles from opacity (.7) and vertical offset (3px) over (220ms). Metadata controls enter over (.18s ease-out) from opacity (.7) and vertical offset (-3px). Reduced-motion preference removes those animations, CSS transitions, and smooth scrolling.

## Do's and Don'ts

### Do:

- Do use the fixed cream, sand, gray, and coral world.
- Do use the darker functional accent for readable actions, selection, and focus.
- Do keep Source Serif 4 for the identity and invitation, and Source Sans 3 for editor controls.
- Do keep visible focus, reduced-motion behavior, and photograph proportions.
- Do keep copy functional and upload access to one Add photos action.

### Don't:

- Don't reintroduce dark/light themes, gold accents, or the previous fonts.
- Don't add preloaded photographs, marketing sentences, or repeated explanatory copy.
- Don't add film counters or barcodes; the film lettering is 35mm only.
- Don't turn photographs or settings into decorative cards or add conspicuous motion.
