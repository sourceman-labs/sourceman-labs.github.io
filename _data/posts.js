import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize markdown parser (already in dependencies)
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

/**
 * Calculates estimated reading time based on word count
 */
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extracts slug from filename
 * Handles both date-prefixed and regular filenames
 */
function extractSlugFromFilename(filename) {
  // Remove .md extension
  const nameWithoutExt = filename.replace(/\.md$/, '');

  // Check if filename starts with date (YYYY-MM-DD-)
  const datePrefix = /^\d{4}-\d{2}-\d{2}-/;
  if (datePrefix.test(nameWithoutExt)) {
    // Remove date prefix: "2024-12-15-my-post" → "my-post"
    return nameWithoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  }

  // No date prefix, use entire filename as slug
  return nameWithoutExt;
}

/**
 * Reads and parses all markdown blog posts from posts/ directory
 */
export default async function () {
  try {
    const postsDir = path.join(__dirname, '../posts');

    console.log('📂 Reading blog posts from posts/ directory...');

    // Check if posts directory exists
    if (!fs.existsSync(postsDir)) {
      console.warn('⚠️  posts/ directory does not exist. Creating it...');
      fs.mkdirSync(postsDir, { recursive: true });
      return [];
    }

    // Read all markdown files
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md') && file !== 'README.md');

    if (files.length === 0) {
      console.log('📭 No markdown posts found in posts/ directory');
      return [];
    }

    console.log(`📄 Found ${files.length} markdown file(s)`);

    // Parse each markdown file
    const posts: BlogPost[] = files
      .map(filename => {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse frontmatter
        const { data: frontmatter, content: markdownContent } = matter(fileContent);

        // Skip drafts in production
        if (frontmatter.draft && process.env.NODE_ENV === 'production') {
          console.log(`⏭️  Skipping draft: ${filename}`);
          return null;
        }

        // Extract slug (prefer frontmatter, fallback to filename)
        const slug = frontmatter.slug || extractSlugFromFilename(filename);

        // Render markdown to HTML
        const content = md.render(markdownContent);

        // Calculate reading time (use frontmatter if provided)
        const readingTime = frontmatter.readingTime || calculateReadingTime(content);

        // Build BlogPost object
        const post: BlogPost = {
          title: frontmatter.title || 'Untitled Post',
          slug,
          excerpt: frontmatter.excerpt || '',
          publishedDate: frontmatter.publishedDate || frontmatter.date || new Date().toISOString(),
          updatedDate: frontmatter.updatedDate,
          content,
          coverImage: frontmatter.coverImage,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          author: frontmatter.author || 'Magnus Källman',
          readingTime,
          url: `/blog/${slug}/`,
        };

        return post;
      })
      .filter((post): post is BlogPost => post !== null) // Remove nulls (drafts)
      .sort((a, b) => {
        // Sort by publishedDate descending (newest first)
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return dateB - dateA;
      });

    console.log(`✅ Loaded ${posts.length} published post(s)`);

    return posts;
  } catch (error) {
    console.error('❌ Error reading markdown posts:', error);

    // In development, return empty array
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Returning empty posts array for development');
      return [];
    }

    throw error;
  }
}
