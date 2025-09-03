
export interface AdminUser {
  username: string;
  password: string;
}

export interface BlogPostStats {
  id: number;
  views: number;
  clicks: number;
  timeSpent: number; // Average time spent on the post in seconds
}

export interface BlogPostDraft extends Omit<BlogPost, "id" | "date"> {
  id?: number;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  slug: string;
  isPublished?: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  stats?: BlogPostStats;
}
