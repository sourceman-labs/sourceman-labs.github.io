# Blog Posts

This directory contains all blog posts in markdown format.

## Creating a New Post

### Filename Format

Use date-prefixed filenames for easy sorting:

```
YYYY-MM-DD-slug.md
```

**Examples:**
- `2024-12-15-hello-world.md`
- `2024-11-30-getting-started-with-typescript.md`

### Frontmatter Template

Copy this template for new posts:

```yaml
---
title: "Your Post Title"
slug: "your-post-title"
publishedDate: "2024-12-15"
excerpt: "A brief summary of your post that appears in listings"
author: "Magnus Källman"
tags: ["javascript", "tutorial"]
draft: false
---

# Your Post Content

Start writing your markdown content here...
```

### Frontmatter Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | Yes | string | Post title |
| `slug` | No | string | URL-friendly slug (auto-generated from filename if omitted) |
| `publishedDate` | No | string | Publication date (YYYY-MM-DD or ISO) |
| `excerpt` | No | string | Brief summary for listings |
| `author` | No | string | Author name (defaults to site author) |
| `tags` | No | array | Array of tags |
| `readingTime` | No | number | Estimated reading time in minutes (auto-calculated if omitted) |
| `updatedDate` | No | string | Last updated date |
| `coverImage` | No | object | Cover image metadata |
| `draft` | No | boolean | If true, post is hidden in production |

### Workflow

1. **Create branch:**
   ```bash
   git checkout -b post/my-new-post
   ```

2. **Create markdown file:**
   ```bash
   touch posts/2024-12-15-my-new-post.md
   ```

3. **Write your post** (add frontmatter + content)

4. **Preview locally:**
   ```bash
   npm run dev
   # Visit http://localhost:8080
   ```

5. **Commit and push:**
   ```bash
   git add posts/2024-12-15-my-new-post.md
   git commit -m "Add new post: My New Post"
   git push origin post/my-new-post
   ```

6. **Create Pull Request** on GitHub

7. **Review** the generated HTML in preview

8. **Merge to main** → triggers deployment!

### Markdown Support

Your posts support:

- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- Headings (H1-H6)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Blockquotes
- Images
- Tables
- Horizontal rules

### Code Blocks

Use triple backticks with language:

```javascript
const greeting = "Hello, World!";
console.log(greeting);
```

Supported languages: JavaScript, TypeScript, Python, Go, Rust, HTML, CSS, Bash, and more.

### Images

**Local images:**
```markdown
![Alt text](/static/images/my-image.jpg)
```

**External images:**
```markdown
![Alt text](https://example.com/image.jpg)
```

### Draft Posts

To create a draft that won't be published:

```yaml
---
title: "Work in Progress"
draft: true
---
```

Drafts are visible in development (`npm run dev`) but hidden in production.

## Tips

- Keep filenames lowercase and use hyphens
- Use descriptive slugs for SEO
- Write engaging excerpts (they appear in search results and social shares)
- Add relevant tags for organization
- Preview locally before pushing
- Use proper markdown heading hierarchy (H1 → H2 → H3)
