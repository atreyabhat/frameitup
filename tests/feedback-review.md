# Metadata and batch export acceptance

- Imported 30 JPEGs without camera EXIF; each defaults to Film and its camera metadata footer is disabled.
- Forced three parts per photo and exported the whole collection: 120 PNGs downloaded in one ZIP. Opened every file and verified that every fourth file is the full image preceding its three parts.
- Imported a JPEG fixture with actual FUJIFILM X-T5 EXIF: 25mm, f/2.8, 1/250, ISO 200. The editable field was prefilled correctly. Changed 25mm to 50mm and appended a note; switching photos preserved the edit and displayed it in the footer.
- The metadata editor has one text field and size control. Full-photo-first and pixel-inspection controls are removed.
- Film label position is generated once at import and reused for all previews and downloads of that photo.
- 17 Node tests pass; 54 browser renderer checks pass. Desktop and 390px mobile reviewed without page overflow. Browser console reports no errors.

The batch exercise used 600×400 fixtures to verify ordering and the removal of the platform limit. Device memory still bounds extremely large full-resolution batches. Instagram posting itself was not tested.
