import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneratedContent } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class GeminiService {

  constructor(private http: HttpClient) {}

  generateContent(content: string, category: string, language: string): Promise<GeneratedContent> {
    return firstValueFrom(
      this.http.post<GeneratedContent>(`${environment.apiUrl}/generate`, { content, category, language })
    );
  }
}
