import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CanvasService } from '../../services/canvas.service';

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
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent {
  @Input() caption = '';
  @Output() captionChange = new EventEmitter<string>();

  templates = TEMPLATES;
  selectedTemplate = TEMPLATES[0].file;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isGenerating = false;

  imageSizeWarning = false;
  readonly maxImageSize = 5 * 1024 * 1024; // 5MB

  constructor(private canvas: CanvasService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.imageSizeWarning = this.selectedFile.size > this.maxImageSize;
      this.previewUrl = null;
      this.cdr.markForCheck();
    }
  }

  generatePreview() {
    if (!this.selectedFile) {
      this.snackBar.open('Please upload a news photo first', '', { duration: 2500 });
      return;
    }
    if (!this.caption.trim()) {
      this.snackBar.open('Please enter a caption', '', { duration: 2500 });
      return;
    }
    this.isGenerating = true;

    const templateSrc = `templates/${this.selectedTemplate}`;
    this.canvas.generateImage(templateSrc, this.selectedFile, this.caption)
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
}
