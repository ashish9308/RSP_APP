import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {

  private url = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  save(post: Omit<Post, 'id' | '_id' | 'createdAt'>): Promise<Post> {
    return firstValueFrom(this.http.post<Post>(this.url, post));
  }

  getAll(): Promise<Post[]> {
    return firstValueFrom(this.http.get<Post[]>(this.url));
  }

  search(keyword: string): Promise<Post[]> {
    return firstValueFrom(this.http.get<Post[]>(`${this.url}?search=${encodeURIComponent(keyword)}`));
  }

  markCopied(id: string, platform: 'facebook' | 'instagram' | 'twitter'): Promise<Post> {
    return firstValueFrom(this.http.patch<Post>(`${this.url}/${id}/copied`, { platform }));
  }

  delete(id: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.url}/${id}`));
  }
}
