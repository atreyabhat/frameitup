# Large imports, per-photo controls and output quality

Removed the 80MP import rejection. Imported an actual 10000×9000 JPEG (90MP) and a second camera JPEG together. The large source received a 4320-pixel-long-edge working bitmap, retained its original File, and successfully downloaded a 1080×1440 JPG. Native/source-resolution exports recreate the original bitmap; the existing export canvas guard (16384 maximum dimension or 64MP area) remains explicit.

Verified separate portrait/square settings across photo selection and explicit apply-all propagation. Each new import resets to Instagram, border 5, footer off, JPG 90. JPG quality is per-photo; PNG disables the slider and uses lossless encoding. Output dimensions/encoding/color space are stated together once.

Border, corners and text size use editable steppers; quality retains a bounded slider. Enlarged trash target, quieter pane surfaces/dividers, system UI typography, and checked 390px mobile without page overflow. Research: Apple's official Human Interface Guidelines for steppers, sliders, buttons, checkboxes, sidebars and typography; links are in DESIGN.md.

20 Node tests and 54 browser renderer checks passed. The synthetic large fixture exercises dimensions and memory behavior rather than reproducing the user's unavailable 16MB source. Browser decoding and full-resolution canvas availability still depend on device memory.

Actual JPG quality validation: the same 1080×1440 slide exported as 194750 bytes at 90% and 55624 bytes at 25%; JPEG quantization tables changed accordingly. PNG quality control is disabled.
