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
  validationScore?: number | null;
  validationVerdict?: string;
  validationSummary?: string;
  validationSources?: { name: string; url: string }[];
  createdAt: Date;
}

export interface GeneratedContent {
  facebook: string;
  instagram: string;
  twitter: string;
  imageCaption: string;
}

export interface ValidationResult {
  score: number;
  verdict: string;
  summary: string;
  sources: { name: string; url: string }[];
}

export const CATEGORIES = [
  'Breaking News',
  'News Update',
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
