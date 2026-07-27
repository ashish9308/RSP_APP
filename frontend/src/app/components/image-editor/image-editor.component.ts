import { Component, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
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

  templates = TEMPLATES;
  selectedTemplate = TEMPLATES[0].file;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isGenerating = false;
  showEditor = false;
  overlayText = '';

  imageSizeWarning = false;
  readonly maxImageSize = 5 * 1024 * 1024;

  private fabricCanvas: fabric.Canvas | null = null;
  private history: string[] = [];

  constructor(private canvas: CanvasService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.fabricCanvas?.dispose();
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

  applyAndGenerate() {
    if (!this.fabricCanvas) return;
    if (!this.caption.trim()) {
      this.snackBar.open('Please enter a caption', '', { duration: 2500 });
      return;
    }
    this.isGenerating = true;
    this.cdr.markForCheck();

    const editedDataUrl = this.fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 1 });

    fetch(editedDataUrl)
      .then(r => r.blob())
      .then(blob => {
        const editedFile = new File([blob], 'edited.jpg', { type: 'image/jpeg' });
        const templateSrc = `templates/${this.selectedTemplate}`;
        return this.canvas.generateImage(templateSrc, editedFile, this.caption);
      })
      .then((dataUrl) => {
        this.previewUrl = dataUrl;
        this.isGenerating = false;
        this.cdr.markForCheck();
      })
      .catch((err: any) => {
        this.snackBar.open('Image generation failed: ' + err.message, 'Close', { duration: 4000 });
        this.isGenerating = false;
        this.cdr.markForCheck();
      });
  }

  downloadImage() {
    if (!this.previewUrl) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    this.canvas.downloadImage(this.previewUrl, `rsp-news-${timestamp}.jpg`);
  }

  onCaptionChange(value: string) {
    this.caption = value;
    this.captionChange.emit(value);
  }

  get canUndo(): boolean {
    return this.history.length > 1;
  }
}
