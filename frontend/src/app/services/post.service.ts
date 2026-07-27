import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PostService {

  private url = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  save(post: Omit<Post, 'id' | '_id' | 'createdAt'>): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(this.url, post, { headers: this.headers() }));
  }

  getAll(): Promise<Post[]> {
    return firstValueFrom(this.http.get<Post[]>(this.url, { headers: this.headers() }));
  }

  search(keyword: string): Promise<Post[]> {
    return firstValueFrom(this.http.get<Post[]>(`${this.url}?search=${encodeURIComponent(keyword)}`, { headers: this.headers() }));
  }

  markCopied(id: string, platform: 'facebook' | 'instagram' | 'twitter'): Promise<Post> {
    return firstValueFrom(this.http.patch<Post>(`${this.url}/${id}/copied`, { platform }, { headers: this.headers() }));
  }

  delete(id: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.url}/${id}`, { headers: this.headers() }));
  }
}
