import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Delete Post?</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this post?</p>
      <p class="preview">"{{ data.preview }}..."</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styles: ['.preview { font-size: 13px; color: #666; font-style: italic; margin-top: 6px; }']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { preview: string }
  ) {}
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatSnackBarModule, MatDialogModule, MatChipsModule, MatTooltipModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  searchKeyword = '';
  expandedPostId: string | null = null;
  expandedPlatform: 'facebook' | 'instagram' | 'twitter' | null = null;

  constructor(
    private postService: PostService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadPosts();
  }

  async loadPosts() {
    this.posts = await this.postService.getAll();
    this.filteredPosts = this.posts;
    this.cdr.markForCheck();
  }

  async search() {
    if (!this.searchKeyword.trim()) {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = await this.postService.search(this.searchKeyword);
    }
    this.cdr.markForCheck();
  }

  toggleExpand(postId: string, platform: 'facebook' | 'instagram' | 'twitter') {
    if (this.expandedPostId === postId && this.expandedPlatform === platform) {
      this.expandedPostId = null;
      this.expandedPlatform = null;
    } else {
      this.expandedPostId = postId;
      this.expandedPlatform = platform;
    }
  }

  isExpanded(postId: string, platform: string): boolean {
    return this.expandedPostId === postId && this.expandedPlatform === platform;
  }

  getContent(post: Post, platform: 'facebook' | 'instagram' | 'twitter'): string {
    const map = {
      facebook: post.facebookContent,
      instagram: post.instagramContent,
      twitter: post.twitterContent
    };
    return map[platform];
  }

  async copyContent(post: Post, platform: 'facebook' | 'instagram' | 'twitter') {
    const content = this.getContent(post, platform);
    await navigator.clipboard.writeText(content);
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    this.snackBar.open(`✅ ${label} content copied!`, '', { duration: 2000 });
    if (post._id) await this.postService.markCopied(post._id, platform);
    await this.loadPosts();
  }

  async deletePost(post: Post) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { preview: post.rawContent.slice(0, 60) }
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;
    if (post._id) await this.postService.delete(post._id);
    this.snackBar.open('Post deleted', '', { duration: 2000 });
    await this.loadPosts();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Breaking News': '#c62828',
      'Politics': '#1565c0',
      'Sports': '#2e7d32',
      'Entertainment': '#6a1b9a',
      'Crime': '#bf360c',
      'Business': '#0277bd',
      'Technology': '#00695c',
      'Health': '#558b2f',
      'Education': '#f57f17'
    };
    return colors[category] || '#555';
  }
}
