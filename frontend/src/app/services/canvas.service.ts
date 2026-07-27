import { Injectable } from '@angular/core';

// Template dimensions: 1024x1280
// Header:  y=0    to y=206   (206px)
// Black:   y=206  to y=1066  (860px) ← uploaded image goes here
// Footer:  y=1066 to y=1280  (214px) ← caption text goes here

const TEMPLATE_W = 1024;
const TEMPLATE_H = 1280;
const IMG_X = 0;
const IMG_Y = 206;
const IMG_W = 1024;
const IMG_H = 860;
const CAPTION_Y_START = 1066;
const CAPTION_H = 214;

@Injectable({ providedIn: 'root' })
export class CanvasService {

  generateImage(templateSrc: string, newsImageFile: File, caption: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = TEMPLATE_W;
      canvas.height = TEMPLATE_H;
      const ctx = canvas.getContext('2d')!;

      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const newsImg = new Image();
        newsImg.onerror = reject;
        newsImg.onload = () => {
          // Step 1: Fill canvas black first
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, TEMPLATE_W, TEMPLATE_H);

          // Step 2: Draw uploaded news photo into the black area (cover fit)
          this.drawCover(ctx, newsImg, IMG_X, IMG_Y, IMG_W, IMG_H);

          // Step 3: Draw ONLY header and footer from template (skip black middle)
          const template = new Image();
          template.onerror = reject;
          template.onload = () => {
            // Draw header portion only (y=0 to y=206)
            ctx.drawImage(template, 0, 0, TEMPLATE_W, IMG_Y, 0, 0, TEMPLATE_W, IMG_Y);
            // Draw footer portion only (y=1066 to y=1280)
            ctx.drawImage(template, 0, CAPTION_Y_START, TEMPLATE_W, CAPTION_H, 0, CAPTION_Y_START, TEMPLATE_W, CAPTION_H);

            resolve(canvas.toDataURL('image/jpeg', 0.92));
          };
          template.src = templateSrc;
        };
        newsImg.src = e.target!.result as string;
      };
      reader.readAsDataURL(newsImageFile);
    });
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
