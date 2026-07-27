import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { GeminiService } from '../../services/gemini.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CATEGORIES, LANGUAGES, GeneratedContent } from '../../models/post.model';
import { ImageEditorComponent } from '../image-editor/image-editor.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatInputModule, MatSelectModule,
    MatTabsModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatIconModule, MatTooltipModule, MatCardModule,
    ImageEditorComponent
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  rawContent = '';
  category = 'Breaking News';
  language = 'Hindi';
  categories = CATEGORIES;
  languages = LANGUAGES;

  facebookContent = '';
  instagramContent = '';
  twitterContent = '';
  imageCaption = '';

  isGenerating = false;
  isSaving = false;
  generated = false;
  saved = false;
  geminiError = '';

  readonly twitterLimit = 280;
  readonly currentYear = new Date().getFullYear();

  constructor(
    private gemini: GeminiService,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {}

  generate() {
    if (!this.rawContent.trim()) {
      this.snackBar.open('Please enter news content first', '', { duration: 2500 });
      return;
    }
    this.isGenerating = true;
    this.geminiError = '';
    this.saved = false;
    this.cdr.markForCheck();

    this.gemini.generateContent(this.rawContent, this.category, this.language)
      .then((result: GeneratedContent) => {
        this.facebookContent = result.facebook;
        this.instagramContent = result.instagram;
        this.twitterContent = result.twitter;
        this.imageCaption = result.imageCaption;
        this.generated = true;
        this.isGenerating = false;
        this.cdr.markForCheck();
      })
      .catch((err: any) => {
        this.geminiError = err?.error?.error || err?.message || 'Could not connect to server. Make sure the backend is running.';
        this.isGenerating = false;
        this.cdr.markForCheck();
      });
  }

  async copyToClipboard(platform: 'facebook' | 'instagram' | 'twitter') {
    const contentMap = {
      facebook: this.facebookContent,
      instagram: this.instagramContent,
      twitter: this.twitterContent
    };
    const content = contentMap[platform];
    if (!content) return;

    await navigator.clipboard.writeText(content);
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    this.snackBar.open(`✅ ${label} content copied to clipboard!`, '', { duration: 2000 });
  }

  savePost(): Promise<void> {
    if (!this.generated) {
      this.snackBar.open('Generate content first before saving', '', { duration: 2500 });
      return Promise.resolve();
    }
    this.isSaving = true;
    this.cdr.markForCheck();

    return this.postService.save({
      rawContent: this.rawContent,
      category: this.category,
      language: this.language,
      facebookContent: this.facebookContent,
      instagramContent: this.instagramContent,
      twitterContent: this.twitterContent,
      imageCaption: this.imageCaption,
      copiedTo: { facebook: false, instagram: false, twitter: false }
    })
    .then(() => {
      this.saved = true;
      this.snackBar.open('✅ Post saved to history!', '', { duration: 2500 });
    })
    .catch((err: any) => {
      this.snackBar.open('Save failed: ' + err.message, 'Close', { duration: 4000 });
    })
    .finally(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
    });
  }

  async saveAndGoToHistory() {
    await this.savePost();
    this.router.navigate(['/history']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  get twitterCharCount(): number {
    return this.twitterContent.length;
  }

  get twitterOverLimit(): boolean {
    return this.twitterCharCount > this.twitterLimit;
  }
}
