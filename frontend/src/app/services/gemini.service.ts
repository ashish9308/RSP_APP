import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneratedContent, ValidationResult } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GeminiService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  generateContent(content: string, category: string, language: string): Promise<GeneratedContent> {
    return firstValueFrom(
      this.http.post<GeneratedContent>(
        `${environment.apiUrl}/generate`,
        { content, category, language },
        { headers: this.headers() }
      )
    );
  }

  validateContent(content: string): Promise<ValidationResult> {
    return firstValueFrom(
      this.http.post<ValidationResult>(
        `${environment.apiUrl}/validate`,
        { content },
        { headers: this.headers() }
      )
    );
  }
}
