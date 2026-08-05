import { Injectable } from '@angular/core';

export interface GeneratedImage {
  dataUrl: string;
  width: number;
  height: number;
  captionArea: { x: number; y: number; width: number; height: number };
}

interface TemplateLayout {
  imageArea: { x: number; y: number; width: number; height: number };
  captionArea: { x: number; y: number; width: number; height: number };
}

@Injectable({ providedIn: 'root' })
export class CanvasService {

  /**
   * Composites an already-edited Fabric image into the black photo panel.
   * The panel and caption area are detected from the selected template, so a
   * category header can change without breaking the image/caption placement.
   */
  generateImage(templateSrc: string, editedImage: string): Promise<GeneratedImage> {
    return new Promise((resolve, reject) => {
      const template = new Image();
      template.onerror = () => reject(new Error('Could not load the selected template.'));
      template.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = template.naturalWidth;
        canvas.height = template.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas is not available in this browser.'));
          return;
        }

        const layout = this.findTemplateLayout(template);
        const newsImg = new Image();
        newsImg.onerror = () => reject(new Error('Could not read the edited image.'));
        newsImg.onload = () => {
          // Draw the full template first, then replace only its black photo panel.
          // This preserves each category's own header and footer artwork.
          ctx.drawImage(template, 0, 0);
          this.drawCover(ctx, newsImg, layout.imageArea.x, layout.imageArea.y, layout.imageArea.width, layout.imageArea.height);

          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.92),
            width: canvas.width,
            height: canvas.height,
            captionArea: layout.captionArea
          });
        };
        newsImg.src = editedImage;
      };
      template.src = templateSrc;
    });
  }

  private findTemplateLayout(template: HTMLImageElement): TemplateLayout {
    const width = template.naturalWidth;
    const height = template.naturalHeight;
    const probe = document.createElement('canvas');
    probe.width = width;
    probe.height = height;
    const probeCtx = probe.getContext('2d', { willReadFrequently: true })!;
    probeCtx.drawImage(template, 0, 0);
    const pixels = probeCtx.getImageData(0, 0, width, height).data;

    // The photo panel is the longest almost-solid black horizontal band. Probe
    // across the row so decorative black elements in a header do not match.
    const blackRows: boolean[] = [];
    for (let y = 0; y < height; y++) {
      let blackSamples = 0;
      let samples = 0;
      for (let x = Math.floor(width * 0.08); x < width * 0.92; x += Math.max(1, Math.floor(width / 80))) {
        const index = (y * width + x) * 4;
        if (pixels[index] < 18 && pixels[index + 1] < 18 && pixels[index + 2] < 18) blackSamples++;
        samples++;
      }
      blackRows.push(blackSamples / samples > 0.96);
    }

    let bestStart = -1;
    let bestEnd = -1;
    let runStart = -1;
    for (let y = 0; y <= height; y++) {
      if (y < height && blackRows[y]) {
        if (runStart === -1) runStart = y;
      } else if (runStart !== -1) {
        if (y - runStart > bestEnd - bestStart) {
          bestStart = runStart;
          bestEnd = y;
        }
        runStart = -1;
      }
    }

    // Safe fallback for an unexpected template: retains the legacy layout.
    if (bestStart < 0 || bestEnd - bestStart < height * 0.2) {
      bestStart = Math.round(height * 0.16);
      bestEnd = Math.round(height * 0.79);
    }

    const imageArea = { x: 0, y: bestStart, width, height: bestEnd - bestStart };
    const captionEnd = this.findCaptionEnd(pixels, width, height, bestEnd);
    return {
      imageArea,
      captionArea: { x: 0, y: bestEnd, width, height: Math.max(1, captionEnd - bestEnd) }
    };
  }

  private findCaptionEnd(pixels: Uint8ClampedArray, width: number, height: number, captionStart: number): number {
    // The current templates use a light caption strip followed by a coloured
    // social-media footer. End the caption strip at the first sustained dark/
    // coloured band; if none exists, use the remainder of the template.
    let runStart = -1;
    for (let y = captionStart; y < height; y++) {
      let brightSamples = 0;
      let samples = 0;
      for (let x = Math.floor(width * 0.08); x < width * 0.92; x += Math.max(1, Math.floor(width / 80))) {
        const index = (y * width + x) * 4;
        const max = Math.max(pixels[index], pixels[index + 1], pixels[index + 2]);
        const min = Math.min(pixels[index], pixels[index + 1], pixels[index + 2]);
        if (max > 215 && max - min < 35) brightSamples++;
        samples++;
      }
      if (brightSamples / samples < 0.8) {
        if (runStart === -1) runStart = y;
        if (y - runStart >= 8) return runStart;
      } else {
        runStart = -1;
      }
    }
    return height;
  }

  // Cover fit: fills the target rect, crops excess (like CSS background-size: cover)
  private drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number
  ) {
    const scale = Math.max(w / img.width, h / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const offsetX = (w - scaledW) / 2;
    const offsetY = (h - scaledH) / 2;
    ctx.drawImage(img, x + offsetX, y + offsetY, scaledW, scaledH);
  }

  downloadImage(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }
}
