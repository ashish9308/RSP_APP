import Dexie, { type Table } from 'dexie';
import { Post } from '../models/post.model';

export class AppDB extends Dexie {
  posts!: Table<Post, number>;

  constructor() {
    super('rsp_news_db');
    this.version(1).stores({
      posts: '++id, category, createdAt'
    });
  }
}

export const db = new AppDB();
