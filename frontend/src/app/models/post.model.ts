export interface Post {
  id?: number;
  _id?: string;
  rawContent: string;
  category: string;
  language: string;
  facebookContent: string;
  instagramContent: string;
  twitterContent: string;
  imageCaption: string;
  copiedTo: {
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
  };
  createdAt: Date;
}

export interface GeneratedContent {
  facebook: string;
  instagram: string;
  twitter: string;
  imageCaption: string;
}

export const CATEGORIES = [
  'Breaking News',
  'Politics',
  'Sports',
  'Entertainment',
  'Crime',
  'Business',
  'Technology',
  'Health',
  'Education'
];

export const LANGUAGES = ['Hindi', 'English', 'Hinglish'];
