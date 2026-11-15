export async function parseExifFromFile(file) {
        if (!window.exifr || typeof window.exifr.parse !== "function") {
          return null;
        }
        try {
          const data = await window.exifr.parse(file);
          if (!data) return null;

          const make = cleanValue(data.Make);
          const model = cleanValue(data.Model);
          const lens = cleanValue(data.LensModel || data.LensInfo || data.Lens);
          const focal35 = parseNumber(data.FocalLengthIn35mmFormat);
          const focal = parseNumber(data.FocalLength);
          const fNumber = parseNumber(data.FNumber);
          const exposure = parseNumber(data.ExposureTime);
          const iso = parseNumber(data.ISO || data.ISOSpeedRatings || data.RecommendedExposureIndex);

          return {
            camera: [make, model].filter(Boolean).join(" ").trim(),
            lens,
            focal35,
            focal,
            fNumber,
            exposure,
            iso
          };
        } catch (error) {
          return null;
        }
      }


      function parseNumber(value) {
        if (Array.isArray(value) && value.length > 0) {
          return parseNumber(value[0]);
        }
        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
        if (typeof value === "string") {
          const parsed = Number.parseFloat(value);
          return Number.isFinite(parsed) ? parsed : null;
        }
        if (value && typeof value === "object" && "numerator" in value && "denominator" in value && value.denominator) {
          return value.numerator / value.denominator;
        }
        return null;
      }

      function formatNumber(value) {
        if (!Number.isFinite(value)) return "";
        if (value >= 100) return String(Math.round(value));
        if (value >= 10) return (Math.round(value * 10) / 10).toString();
        return (Math.round(value * 100) / 100).toString();
      }

      function formatExposure(exposure) {
        if (!Number.isFinite(exposure) || exposure <= 0) {
          return "";
        }
        if (exposure >= 1) {
          return `${formatNumber(exposure)}s`;
        }
        const denominator = Math.round(1 / exposure);
        return denominator > 0 ? `1/${denominator}` : "";
      }

      function normalizeCameraLabel(cameraText, stripFujifilmBrand = false) {
        if (typeof cameraText !== "string") return "";
        const compact = cameraText.replace(/\s+/g, " ").trim();
        if (!compact) return "";
        if (!stripFujifilmBrand || !/fujifilm/i.test(compact)) return compact;

        return compact
          .replace(/\bFUJIFILM\b/ig, "")
          .replace(/\s+/g, " ")
          .replace(/^[\-\|]+|[\-\|]+$/g, "")
          .trim();
      }

      function cleanValue(value) {
        if (typeof value !== "string") return "";
        return value
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      function fitTextWithEllipsis(ctx, text, maxWidth) {
        if (!text || maxWidth <= 0) return "";
        if (ctx.measureText(text).width <= maxWidth) return text;
        const ellipsis = "...";
        let output = text;
        while (output.length > 0 && ctx.measureText(output + ellipsis).width > maxWidth) {
          output = output.slice(0, -1);
        }
        return output.length > 0 ? output + ellipsis : ellipsis;
      }

      function fitExifToLines(ctx, text, maxWidth, maxLines) {
        if (!text || maxWidth <= 0) return [""];
        if (maxLines <= 1 || ctx.measureText(text).width <= maxWidth) {
          return [fitTextWithEllipsis(ctx, text, maxWidth)];
        }

        const chunks = text.split(" | ").filter(Boolean);
        if (chunks.length === 0) {
          return [fitTextWithEllipsis(ctx, text, maxWidth)];
        }

        let line1 = "";
        let line2 = "";

        for (const chunk of chunks) {
          const nextLine1 = line1 ? `${line1} | ${chunk}` : chunk;
          if (ctx.measureText(nextLine1).width <= maxWidth || !line1) {
            line1 = nextLine1;
            continue;
          }

          const nextLine2 = line2 ? `${line2} | ${chunk}` : chunk;
          line2 = nextLine2;
        }

        if (!line2) {
          return [fitTextWithEllipsis(ctx, line1, maxWidth)];
        }

        line1 = fitTextWithEllipsis(ctx, line1, maxWidth);
        line2 = fitTextWithEllipsis(ctx, line2, maxWidth);
        return [line1, line2];
      }


export function metadataLine(item, settings) {
  const manual = settings.manual.trim();
  const note = settings.note.trim();
  let text = manual;
  if (settings.metadataMode === 'auto' && item.exif) {
    const d = item.exif, f = settings.fields, parts = [];
    if (f.camera && d.camera) parts.push(normalizeCameraLabel(d.camera));
    if (f.focal && (d.focal || d.focal35)) parts.push(formatNumber(d.focal || d.focal35) + 'mm');
    if (f.aperture && d.fNumber) parts.push('f/' + formatNumber(d.fNumber));
    if (f.shutter && d.exposure) parts.push(formatExposure(d.exposure));
    if (f.iso && d.iso) parts.push('ISO ' + formatNumber(d.iso));
    text = parts.join(' | ') || manual;
  }
  return [text, note].filter(Boolean).join(' | ');
}

export { fitExifToLines };

export function hasCameraMetadata(exif) {
  return Boolean(exif && [exif.camera, exif.lens, exif.focal, exif.focal35, exif.fNumber, exif.exposure, exif.iso].some(Boolean));
}

export function importSettings(exif, preferences) {
  const available = hasCameraMetadata(exif);
  const settings = { ...preferences, border: 5, export: 'instagram', jpegQuality: 0.9, instagramReady: true, ratio: 'portrait', layout: 'auto', metadata: false, metadataMode: 'auto', manual: '', note: '', fields: { camera: true, focal: true, aperture: true, shutter: true, iso: true } };
  if (!available) settings.style = 'film-35mm';
  if (settings.style === 'film-35mm') { settings.ratio = 'square'; settings.border = 0; }
  settings.manual = metadataLine({ exif }, settings);
  return settings;
}
