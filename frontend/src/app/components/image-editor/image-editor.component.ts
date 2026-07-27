import { Component, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { CanvasService } from '../../services/canvas.service';
import * as fabric from 'fabric';

const TEMPLATES = [
  { label: 'Breaking News', file: 'breaking-news.png' },
  { label: 'Politics',      file: 'politics.png' },
  { label: 'Sports',        file: 'sports.png' },
  { label: 'Entertainment', file: 'entertainment.png' },
  { label: 'Crime',         file: 'crime.png' },
  { label: 'Business',      file: 'business.png' },
];

interface CaptionConfig {
  text: string;
  align: 'left' | 'center' | 'right';
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatInputModule, MatSelectModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule
  ],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent implements AfterViewInit, OnDestroy {
  @Input() caption = '';
  @Output() captionChange = new EventEmitter<string>();
  @ViewChild('fabricCanvas') fabricCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvasRef!: ElementRef<HTMLCanvasElement>;

  captions: CaptionConfig[] = [{ text: '', align: 'center', color: '#ffffff', bgColor: 'transparent' }];

  templates = TEMPLATES;
  selectedTemplate = TEMPLATES[0].file;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isGenerating = false;
  showEditor = false;
  overlayText = '';
  showPreviewEditor = false;

  imageSizeWarning = false;
  readonly maxImageSize = 5 * 1024 * 1024;

  private fabricCanvas: fabric.Canvas | null = null;
  private previewFabric: fabric.Canvas | null = null;
  private history: string[] = [];

  constructor(private canvas: CanvasService, private snackBar: MatSnackBar, public cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Pre-fill first caption from @Input
    if (this.caption) this.captions[0].text = this.caption;
  }

  ngOnDestroy() {
    this.fabricCanvas?.dispose();
    this.previewFabric?.dispose();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    this.imageSizeWarning = this.selectedFile.size > this.maxImageSize;
    this.previewUrl = null;
    this.showEditor = false;
    this.cdr.markForCheck();

    setTimeout(() => this.initFabricCanvas(), 100);
  }

  private initFabricCanvas() {
    if (!this.selectedFile) return;
    this.showEditor = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      if (this.fabricCanvas) {
        this.fabricCanvas.dispose();
        this.fabricCanvas = null;
      }

      const canvasEl = this.fabricCanvasRef?.nativeElement;
      if (!canvasEl) return;

      this.fabricCanvas = new fabric.Canvas(canvasEl, {
        width: 640,
        height: 480,
        backgroundColor: '#1a1a1a'
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.FabricImage.fromURL(e.target!.result as string).then((img) => {
          const scale = Math.min(640 / img.width!, 480 / img.height!);
          img.set({ scaleX: scale, scaleY: scale, left: 320, top: 240, originX: 'center', originY: 'center' });
          this.fabricCanvas!.add(img);
          this.fabricCanvas!.setActiveObject(img);
          this.saveHistory();
          this.fabricCanvas!.renderAll();
          this.cdr.markForCheck();
        });
      };
      reader.readAsDataURL(this.selectedFile!);

      this.fabricCanvas.on('object:modified', () => this.saveHistory());
    }, 150);
  }

  private saveHistory() {
    if (!this.fabricCanvas) return;
    this.history.push(JSON.stringify(this.fabricCanvas.toJSON()));
    if (this.history.length > 20) this.history.shift();
  }

  undo() {
    if (!this.fabricCanvas || this.history.length < 2) return;
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    this.fabricCanvas.loadFromJSON(JSON.parse(prev)).then(() => {
      this.fabricCanvas!.renderAll();
    });
  }

  addText() {
    if (!this.fabricCanvas) return;
    const text = new fabric.IText(this.overlayText || 'Add text here', {
      left: 320, top: 240, originX: 'center', originY: 'center',
      fontSize: 28, fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 6, offsetX: 2, offsetY: 2 })
    });
    this.fabricCanvas.add(text);
    this.fabricCanvas.setActiveObject(text);
    this.fabricCanvas.renderAll();
    this.saveHistory();
    this.overlayText = '';
    this.cdr.markForCheck();
  }

  deleteSelected() {
    if (!this.fabricCanvas) return;
    const active = this.fabricCanvas.getActiveObject();
    if (active) {
      this.fabricCanvas.remove(active);
      this.fabricCanvas.renderAll();
      this.saveHistory();
    }
  }

  zoomIn() {
    if (!this.fabricCanvas) return;
    this.fabricCanvas.setZoom(Math.min(this.fabricCanvas.getZoom() * 1.2, 5));
    this.fabricCanvas.renderAll();
  }

  zoomOut() {
    if (!this.fabricCanvas) return;
    this.fabricCanvas.setZoom(Math.max(this.fabricCanvas.getZoom() / 1.2, 0.2));
    this.fabricCanvas.renderAll();
  }

  resetZoom() {
    if (!this.fabricCanvas) return;
    this.fabricCanvas.setZoom(1);
    this.fabricCanvas.renderAll();
  }

  flipHorizontal() {
    if (!this.fabricCanvas) return;
    const obj = this.fabricCanvas.getActiveObject();
    if (obj) { obj.set('flipX', !obj.flipX); this.fabricCanvas.renderAll(); this.saveHistory(); }
  }

  flipVertical() {
    if (!this.fabricCanvas) return;
    const obj = this.fabricCanvas.getActiveObject();
    if (obj) { obj.set('flipY', !obj.flipY); this.fabricCanvas.renderAll(); this.saveHistory(); }
  }

  rotateLeft() {
    if (!this.fabricCanvas) return;
    const obj = this.fabricCanvas.getActiveObject();
    if (obj) { obj.set('angle', (obj.angle || 0) - 90); this.fabricCanvas.renderAll(); this.saveHistory(); }
  }

  rotateRight() {
    if (!this.fabricCanvas) return;
    const obj = this.fabricCanvas.getActiveObject();
    if (obj) { obj.set('angle', (obj.angle || 0) + 90); this.fabricCanvas.renderAll(); this.saveHistory(); }
  }

  addCaption() {
    this.captions.push({ text: '', align: 'center', color: '#ffffff', bgColor: 'transparent' });
    this.cdr.markForCheck();
  }

  removeCaption(index: number) {
    if (this.captions.length > 1) {
      this.captions.splice(index, 1);
      this.cdr.markForCheck();
    }
  }

  setCaptionAlign(index: number, align: 'left' | 'center' | 'right') {
    this.captions[index].align = align;
    this.cdr.markForCheck();
  }

  trackByIndex(index: number) { return index; }

  applyAndGenerate() {
    if (!this.fabricCanvas || !this.selectedFile) return;
    this.isGenerating = true;
    this.cdr.markForCheck();

    // Use the original uploaded file directly — canvas.service cover-fits it
    // into the template's black area (y=206 to y=1066) exactly as before.
    // The Fabric editor adjustments (zoom/rotate/flip) are for visual reference;
    // the final composite is built from the original photo + selected template.
    const templateSrc = `templates/${this.selectedTemplate}`;
    this.canvas.generateImage(templateSrc, this.selectedFile)
      .then((dataUrl) => {
        this.previewUrl = dataUrl;
        this.isGenerating = false;
        this.showPreviewEditor = true;
        this.cdr.markForCheck();
        setTimeout(() => this.initPreviewFabric(dataUrl), 150);
      })
      .catch((err: any) => {
        this.snackBar.open('Image generation failed: ' + err.message, 'Close', { duration: 4000 });
        this.isGenerating = false;
        this.cdr.markForCheck();
      });
  }

  private initPreviewFabric(bgDataUrl: string) {
    if (this.previewFabric) {
      this.previewFabric.dispose();
      this.previewFabric = null;
    }
    const canvasEl = this.previewCanvasRef?.nativeElement;
    if (!canvasEl) return;

    // Display at 480px wide, proportional height from 1024x1280
    const displayW = 480;
    const displayH = Math.round(1280 * displayW / 1024); // 600px
    const scale = displayW / 1024;

    this.previewFabric = new fabric.Canvas(canvasEl, { width: displayW, height: displayH });

    // Load the fully composited template image (header + photo + footer) as background
    fabric.FabricImage.fromURL(bgDataUrl).then((img) => {
      // img.width = 1024, img.height = 1280 — scale down to displayW x displayH
      img.set({
        left: 0, top: 0,
        scaleX: scale, scaleY: scale,
        selectable: false, evented: false,
        originX: 'left', originY: 'top'
      });
      this.previewFabric!.add(img);

      // Place initial captions in the footer area as draggable IText objects
      const footerMidY = Math.round((1066 + 107) * scale);
      this.captions.filter(c => c.text.trim()).forEach((cap, i) => {
        const leftPos = cap.align === 'left' ? 10 : cap.align === 'right' ? displayW - 10 : displayW / 2;
        const originX = cap.align === 'left' ? 'left' : cap.align === 'right' ? 'right' : 'center';
        const t = new fabric.IText(cap.text, {
          left: leftPos,
          top: footerMidY + i * 30,
          originX,
          originY: 'center',
          textAlign: cap.align,
          fontSize: 18,
          fill: cap.color,
          backgroundColor: cap.bgColor === 'transparent' ? '' : cap.bgColor,
          fontFamily: '"Noto Sans Devanagari", Arial, sans-serif',
          fontWeight: 'bold',
          shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 6, offsetX: 2, offsetY: 2 })
        });
        this.previewFabric!.add(t);
      });

      this.previewFabric!.renderAll();
      this.cdr.markForCheck();
    });
  }

  downloadImage() {
    if (!this.previewFabric) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    // displayW=480, template=1024 → multiplier = 1024/480
    const multiplier = 1024 / 480;
    const dataUrl = this.previewFabric.toDataURL({ format: 'jpeg', quality: 0.92, multiplier });
    this.canvas.downloadImage(dataUrl, `rsp-news-${timestamp}.jpg`);
  }

  onCaptionChange(value: string) {
    this.caption = value;
    this.captionChange.emit(value);
    if (this.captions.length > 0) this.captions[0].text = value;
  }

  get canUndo(): boolean {
    return this.history.length > 1;
  }
}
