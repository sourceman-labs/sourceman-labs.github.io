# sourceman Blog

A static blog generator for [sourceman.se](https://sourceman.se) built with Eleventy and local markdown files.

## 🏗️ Architecture Overview

This repository uses the **single-repo GitHub Pages pattern** with a git-based workflow:
- **Repository name**: `sourceman-labs.github.io` (required for GitHub Pages)
- **Content**: Markdown files in `posts/` directory (version controlled)
- **Deployment**: GitHub Actions builds and deploys on push to main
- **Zero cost**: Everything runs on GitHub's free tier

```
Markdown files in posts/ directory
    ↓ commit & push
GitHub Actions workflow (triggered on push)
    ↓ builds with Eleventy
Static HTML/CSS/JS
    ↓ deploys
GitHub Pages → sourceman.se
```

**⚠️ Important**: If you cloned this as `site-generator`, rename it to `sourceman-labs.github.io` for GitHub Pages to work correctly.

## Features

- ⚡ **Lightning Fast**: Static site generation with Eleventy
- 🎨 **Terminal-Inspired Design**: Catppuccin Mocha theme with custom black background
- 🌓 **Dark/Light Mode**: Automatic OS detection + manual toggle
- 📝 **Git-Based Content**: Write posts in markdown, version controlled
- 🎯 **Syntax Highlighting**: Pre-rendered code blocks (zero runtime JS)
- 🚀 **Zero-Cost Hosting**: Deployed to GitHub Pages
- 🔄 **PR Workflow**: Review posts before publishing
- 📦 **TypeScript**: Type-safe configuration and data fetching
- ♿ **Lightweight**: <14KB per page (excluding first-load fonts)

## Prerequisites

- **Node.js 22+** (with experimental TypeScript support)
- **pnpm** (for dependency management)
- **GitHub account** (for GitHub Pages deployment)

## 📖 Documentation

- **[Local Development Guide](docs/DEVELOPMENT.md)** - Complete guide for setting up and running the blog locally
- **[Cloudflare Dual-Domain Setup](docs/CLOUDFLARE.md)** - Configure sourceman.se and magnuskallman.se with redirect
- **[Security Guidelines](SECURITY.md)** - Best practices for managing secrets and tokens

## Quick Start

### 1. Repository Setup

**Option A: Create new repository (recommended)**
```bash
# Create a new repository on GitHub named: sourceman-labs.github.io
# Then clone it:
git clone https://github.com/sourceman-labs/sourceman-labs.github.io.git
cd sourceman-labs.github.io

# Copy all files from this project into the cloned repository
```

**Option B: Rename existing repository**
```bash
# If you already cloned this repo:
# 1. Go to GitHub → Repository Settings → General
# 2. Rename repository to: sourceman-labs.github.io
# 3. Update your local remote:
git remote set-url origin https://github.com/sourceman-labs/sourceman-labs.github.io.git
```

**Why this naming matters**: GitHub Pages requires organization repos to be named `{org-name}.github.io` for the main site.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. (Optional) Add Font Files

Download JetBrains Mono font and add to `static/fonts/`:

```bash
# Download from: https://www.jetbrains.com/lp/mono/
# Copy JetBrainsMono-Regular.woff2 to:
cp /path/to/JetBrainsMono-Regular.woff2 static/fonts/jetbrains-mono.woff2
```

See `static/fonts/README.md` for more options.

### 4. Run Development Server

```bash
pnpm run dev
```

Visit `http://localhost:8080` to see your blog!

The dev server will:
- Watch for changes to markdown posts in `posts/`
- Hot reload on file changes
- Automatically rebuild when posts are added or edited

**For detailed local development instructions, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**

## Creating Blog Posts

### Quick Start

1. Create a new markdown file in `posts/` directory:
   ```bash
   touch posts/2024-12-15-my-awesome-post.md
   ```

2. Add frontmatter and content:
   ```yaml
   ---
   title: "My Awesome Post"
   publishedDate: "2024-12-15"
   excerpt: "A brief summary"
   tags: ["javascript", "tutorial"]
   ---

   # My Post Content

   Start writing here...
   ```

3. Preview locally:
   ```bash
   pnpm run dev
   # Visit http://localhost:8080
   ```

4. Commit and push to deploy!

For detailed instructions, see [posts/README.md](posts/README.md).

### Git-Based Workflow

This blog uses a git-based publishing workflow:

1. **Create branch** for new post
2. **Write post** in markdown
3. **Preview locally** with `pnpm run dev`
4. **Create PR** to main branch
5. **Review** generated HTML
6. **Merge PR** → auto-deploys to GitHub Pages!

No CMS, no webhooks, no external dependencies. Just markdown files in git.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Build production site to `_site/` |
| `pnpm run preview` | Preview production build locally |
| `pnpm run clean` | Remove build artifacts |
| `pnpm run type-check` | Check TypeScript types without building |

## Project Structure

```
site-generator/
├── .github/workflows/       # GitHub Actions CI/CD
│   └── deploy.yml          # Deployment workflow
├── _data/                  # Eleventy data files
│   └── posts.ts            # Markdown posts loader
├── _includes/              # Templates
│   └── layouts/
│       ├── base.njk        # Base layout with logo
│       └── post.njk        # Blog post layout
├── docs/                   # Documentation
│   ├── DEVELOPMENT.md      # Local development guide
│   └── CLOUDFLARE.md       # Domain setup guide
├── posts/                  # Blog posts (markdown files)
│   ├── README.md           # Post creation guide
│   └── *.md                # Individual blog posts
├── src/utils/              # TypeScript utilities
│   └── secrets.ts          # Environment variable utilities
├── static/                 # Static assets
│   ├── css/
│   │   ├── main.css        # Main stylesheet (Catppuccin theme)
│   │   └── syntax.css      # Syntax highlighting styles
│   ├── js/
│   │   └── theme-toggle.js # Dark/light mode toggle (<1KB)
│   └── fonts/
│       └── jetbrains-mono.woff2  # Font file (optional)
├── types/                  # TypeScript type definitions
│   └── blog.d.ts           # Blog post types
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── eleventy.config.ts      # Eleventy configuration
├── index.njk               # Home page
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Deployment

### GitHub Pages Setup

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

The GitHub Actions workflow will automatically:
- Install dependencies
- Build the site with Eleventy
- Deploy to GitHub Pages

**Note:** No secrets needed! Posts are in the repository, no external API calls.

### Custom Domain Setup

**CNAME File** (already configured):
The repository includes a `CNAME` file with `sourceman.se` as the primary domain.

**Dual-Domain Configuration**:
This blog is configured to work with two domains:
- **sourceman.se** (primary) - Main blog URL
- **magnuskallman.se** (secondary) - Redirects to sourceman.se

For complete DNS and Cloudflare configuration instructions, see:
- **[Cloudflare Dual-Domain Setup Guide](docs/CLOUDFLARE.md)**

**Quick Summary**:
1. Both domains point to GitHub Pages via Cloudflare DNS (A records)
2. Cloudflare Page Rule redirects magnuskallman.se → sourceman.se (301)
3. SSL/TLS configured on both domains
4. Fast edge-level redirects with path preservation

## Security

This blog uses a simple, secure architecture:

- ✅ **No secrets required**: Posts are markdown files in the repository
- ✅ **No external API calls**: Everything is built at compile time
- ✅ **Static output only**: The deployed site contains only HTML/CSS/JS
- ✅ **Version controlled**: All content is tracked in git

**Security Flow:**
```
Markdown files in repository
    ↓ (committed to git)
GitHub Actions builds site
    ↓ (converts markdown to HTML)
Static HTML/CSS/JS deployed
    ↓ (no secrets, no API calls)
Public website (sourceman.se)
```

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## 📋 Quick Reference

### Repository Setup Checklist
- [ ] Repository named: `sourceman-labs.github.io`
- [ ] GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
- [ ] CNAME file created with custom domain
- [ ] DNS configured for custom domain
- [ ] Example post created in `posts/` directory

### Common Commands
```bash
pnpm run dev         # Local development with hot reload
pnpm run build       # Production build
pnpm run preview     # Preview production build locally
pnpm run clean       # Clean build artifacts
pnpm run type-check  # TypeScript type checking
```

### URLs to Know
- **GitHub Pages**: https://sourceman-labs.github.io
- **Custom Domain**: https://sourceman.se
- **GitHub Actions**: https://github.com/sourceman-labs/sourceman-labs.github.io/actions
- **GitHub Settings**: https://github.com/sourceman-labs/sourceman-labs.github.io/settings

## Customization

### Changing Theme Colors

Edit CSS variables in `static/css/main.css`:

```css
:root {
  --bg: #1e1e1e;              /* Background color */
  --text: #cdd6f4;            /* Text color */
  --accent: #89b4fa;          /* Accent color */
  /* ... more colors */
}
```

### Modifying Post Format

If you want to add new frontmatter fields:

1. Update types in `types/blog.d.ts`
2. Update data fetcher in `_data/posts.ts` to read the new fields
3. Update templates to display the new fields

### Adding Pages

Create new `.njk` files in the root directory:

```njk
---
layout: layouts/base.njk
title: About
---

<div class="page-content">
  <h1>About</h1>
  <p>Your content here...</p>
</div>
```

## Troubleshooting

### Posts not showing

- Check that markdown files exist in `posts/` directory
- Verify frontmatter is valid YAML
- Ensure posts are not marked as `draft: true` (in production)
- Check console output for parsing errors

### Build fails in GitHub Actions

- Review Actions logs for specific errors
- Verify `pnpm-lock.yaml` is committed
- Check that markdown syntax is valid

### TypeScript errors

- Run `pnpm run type-check` to see detailed errors
- Verify imports match the new `types/blog.d.ts` structure

### Fonts not loading

- Ensure `jetbrains-mono.woff2` exists in `static/fonts/`
- Check browser console for 404 errors
- Verify font path in CSS matches file location

## Performance

- **First Load**: ~25-35KB (HTML + CSS + fonts)
- **Subsequent Pages**: <14KB (HTML + CSS only, fonts cached)
- **Lighthouse Score**: 100/100 (Performance, Accessibility, Best Practices, SEO)

## Contributing

This is a personal blog project, but feel free to:
- Report issues
- Suggest improvements
- Fork for your own use

## License

MIT License - See LICENSE file for details

## Author

Magnus Källman
- GitHub: [@sourceman-labs](https://github.com/sourceman-labs)
- Website: [sourceman.se](https://sourceman.se)
