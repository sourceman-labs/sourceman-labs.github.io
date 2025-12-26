/**
 * Blog post type definitions
 * These types are used throughout the application
 */

/**
 * Frontmatter structure for markdown blog posts
 */
export interface PostFrontmatter {
  title: string;
  slug?: string;                    // Optional, extracted from filename if not provided
  excerpt?: string;
  publishedDate?: string;           // ISO date or YYYY-MM-DD
  date?: string;                    // Alias for publishedDate
  updatedDate?: string;
  author?: string;
  tags?: string[];
  readingTime?: number;
  coverImage?: {
    url: string;
    title: string;
    description?: string;
  };
  draft?: boolean;                  // If true, skip in production
}

/**
 * Transformed blog post for Eleventy templates
 * This is the final format consumed by templates
 */
export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedDate: string;
  updatedDate?: string;
  content: string;                  // Rendered HTML
  coverImage?: {
    url: string;
    title: string;
    description?: string;
  };
  tags: string[];
  author: string;
  readingTime: number;
  url: string;
}

/**
 * Site metadata
 */
export interface SiteMetadata {
  title: string;
  description: string;
  url: string;
  author: string;
  github?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
  };
}
