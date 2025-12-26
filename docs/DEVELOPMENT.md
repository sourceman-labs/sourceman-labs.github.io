# Local Development Guide

Complete guide for setting up and running the sourceman blog locally.

**Note:** This blog now uses local markdown files instead of Contentful CMS. Posts are stored in the `posts/` directory and version controlled with git.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Creating Blog Posts](#creating-blog-posts)
- [Git Remote Setup](#git-remote-setup)
- [Running Locally](#running-locally)
- [Development Workflow](#development-workflow)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Tips and Best Practices](#tips-and-best-practices)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js 22.0.0 or higher**
  ```bash
  node --version  # Should output v22.0.0 or higher
  ```

  If you need to install or upgrade Node.js:
  - Download from [nodejs.org](https://nodejs.org/)
  - Or use a version manager like [nvm](https://github.com/nvm-sh/nvm):
    ```bash
    nvm install 22
    nvm use 22
    ```

- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

- **Git**
  ```bash
  git --version
  ```

### Accounts Required

- **GitHub Account**
  - For pushing code to `sourceman-labs/sourceman-labs.github.io`
  - For GitHub Pages deployment

### Optional

- **GoDaddy Account** - If managing custom domains
- **Cloudflare Account** - For DNS and domain redirect configuration

## Initial Setup

### Step 1: Clone the Repository

If you haven't already cloned the repository:

```bash
# Clone the repository
git clone https://github.com/sourceman-labs/sourceman-labs.github.io.git
cd sourceman-labs.github.io
```

Or if you're already in the repository directory (renamed from `site-generator`):

```bash
# Verify you're in the correct directory
pwd  # Should end with /site-generator or /sourceman-labs.github.io
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Eleventy (static site generator)
- gray-matter (frontmatter parsing)
- TypeScript and tsx (TypeScript support)
- Syntax highlighting plugin
- Other dependencies

**Expected output:**
```
added 234 packages, and audited 235 packages in 8s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Step 3: Add Font File (Optional)

Download the JetBrains Mono font (used for the terminal-inspired design):

1. Visit [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
2. Download the font package
3. Copy the `.woff2` file to the static fonts directory:

```bash
cp /path/to/JetBrainsMono-Regular.woff2 static/fonts/jetbrains-mono.woff2
```

The site will work without this (using system monospace fonts as fallback), but JetBrains Mono provides the intended aesthetic.

## Creating Blog Posts

Blog posts are markdown files stored in the `posts/` directory. This allows version control, easy editing, and a simple git-based workflow.

### Step 1: Create a Markdown File

Create a new file in the `posts/` directory with a date-prefixed filename:

```bash
touch posts/2024-12-15-hello-world.md
```

**Filename convention:**
- Date prefix: `YYYY-MM-DD-`
- Slug: `my-post-title`
- Extension: `.md`

**Examples:**
- `posts/2024-12-15-hello-world.md`
- `posts/2024-11-30-getting-started.md`

### Step 2: Add Frontmatter and Content

Open the file in your text editor and add frontmatter (YAML) at the top:

```markdown
---
title: "Hello World"
publishedDate: "2024-12-15"
excerpt: "My first blog post!"
tags: ["meta"]
---

# Hello World

This is my first post using markdown!

## Features

- Simple workflow
- Git-based
- No CMS needed

## Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
```

### Frontmatter Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | Yes | string | Post title |
| `slug` | No | string | URL slug (auto-generated from filename if omitted) |
| `publishedDate` | No | string | Publication date (YYYY-MM-DD or ISO) |
| `excerpt` | No | string | Brief summary for listings |
| `author` | No | string | Author name (defaults to "Magnus Källman") |
| `tags` | No | array | Array of tags |
| `readingTime` | No | number | Minutes to read (auto-calculated if omitted) |
| `updatedDate` | No | string | Last updated date |
| `draft` | No | boolean | If true, hidden in production |

### Step 3: Preview Your Post

Start the development server:

```bash
pnpm run dev
```

Visit `http://localhost:8080` and you should see your new post on the homepage!

### Markdown Tips

- Use `#` for headings (H1-H6)
- Use `**bold**` for bold text
- Use `*italic*` for italic text
- Use triple backticks for code blocks
- Add language for syntax highlighting: \`\`\`javascript

For a complete markdown guide, see [posts/README.md](../posts/README.md)

## Git Remote Setup

If you haven't connected your local repository to GitHub yet:

```bash
# Add the remote repository
git remote add origin https://github.com/sourceman-labs/sourceman-labs.github.io.git

# Verify the remote was added
git remote -v

# Expected output:
# origin  https://github.com/sourceman-labs/sourceman-labs.github.io.git (fetch)
# origin  https://github.com/sourceman-labs/sourceman-labs.github.io.git (push)
```

**Note:** Don't push yet! First verify everything works locally.

## Running Locally

### Start the Development Server

```bash
npm run dev
```

**Expected output:**

```
[11ty] Writing _site/index.html from ./index.njk
[11ty] Writing _site/posts/hello-world/index.html from ./index.njk (via blogPost)
[11ty] Wrote 2 files in 0.15 seconds (v3.1.0)
[11ty] Watching…
[11ty] Server at http://localhost:8080/
```

### View Your Blog

Open your browser and navigate to:

```
http://localhost:8080
```

You should see your blog homepage with your "Hello World" post!

### Development Mode Features

When running `npm run dev`:

- **Uses Contentful Preview API** - You can see draft content that isn't published yet
- **Hot Reload** - Changes to files automatically rebuild and refresh the browser
- **Watch Mode** - Eleventy watches for file changes in:
  - Template files (`.njk`, `.md`, `.html`)
  - CSS files (`static/css/`)
  - JavaScript files (`static/js/`)
  - Data files (`_data/`)

### Stopping the Server

Press `Ctrl+C` in your terminal to stop the development server.

## Development Workflow

### Making Template Changes

1. Edit files in `_includes/layouts/` or root `.njk` files
2. Save the file
3. Browser automatically refreshes with your changes

**Example:** Update the site title in `_includes/layouts/base.njk`

### Styling Changes

1. Edit `static/css/main.css` or `static/css/syntax.css`
2. Save the file
3. Changes apply immediately (hot reload)

**Tip:** Use browser DevTools to experiment with CSS, then copy working styles to your file.

### Adding New Posts in Contentful

1. Go to Contentful dashboard
2. Create a new Blog Post entry
3. Save as **Draft** (to test preview) or **Publish** (to see in production mode)
4. Refresh your local dev server - new post should appear

**Note:** In dev mode, both draft and published posts show up!

### Testing Production Build

To test what the production build will look like:

```bash
# Build the production site
npm run build

# Preview the production build
npm run preview
```

This uses the **Content Delivery API** (only published content), just like GitHub Pages will.

### Iterating on Design

Common design iteration workflow:

1. Start dev server: `npm run dev`
2. Open browser DevTools (`F12` or `Cmd+Option+I`)
3. Experiment with CSS in DevTools
4. Copy working CSS to `static/css/main.css`
5. Save and verify changes persist after refresh

## Available Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Start development server with hot reload | Daily development work |
| `npm run build` | Build production site to `_site/` | Before deploying or testing production build |
| `npm run preview` | Preview production build locally | After running `npm run build` to test output |
| `npm run clean` | Remove build artifacts (`_site/`, `.cache/`) | When having build issues or starting fresh |
| `npm run type-check` | Check TypeScript types without building | Verify type safety before committing |
| `npm run webhook-test` | Show webhook testing instructions | When setting up Contentful webhooks |

### Command Details

#### `npm run dev`

```bash
NODE_ENV=development tsx ./node_modules/.bin/eleventy --serve
```

- Sets environment to `development`
- Uses TypeScript executor (`tsx`)
- Runs Eleventy with built-in dev server
- Watches for file changes
- Uses Contentful Preview API

#### `npm run build`

```bash
NODE_ENV=production tsx ./node_modules/.bin/eleventy
```

- Sets environment to `production`
- Builds static files to `_site/` directory
- Uses Contentful Delivery API (published content only)
- No dev server

#### `npm run preview`

```bash
eleventy --serve --input=_site
```

- Serves the already-built `_site/` directory
- Does NOT rebuild on changes
- Useful for testing the final production output

#### `npm run clean`

```bash
rm -rf _site .cache
```

- Removes the `_site/` output directory
- Removes Eleventy's `.cache/` directory
- Use when troubleshooting build issues

## Project Structure

```
site-generator/
├── .github/workflows/       # CI/CD workflows
│   └── deploy.yml          # GitHub Actions deployment
├── _data/                  # Eleventy data files
│   └── posts.ts            # Fetches posts from Contentful
├── _includes/              # Reusable templates
│   └── layouts/
│       ├── base.njk        # Base HTML layout (logo, nav, footer)
│       └── post.njk        # Individual blog post layout
├── docs/                   # Documentation
│   ├── DEVELOPMENT.md      # This file
│   └── CLOUDFLARE.md       # Cloudflare domain setup
├── scripts/                # Build/utility scripts
│   └── webhook-tunnel.js   # Webhook testing helper
├── src/utils/              # TypeScript utilities
│   └── secrets.ts          # Environment variable loader
├── static/                 # Static assets (copied to _site/)
│   ├── css/
│   │   ├── main.css        # Main stylesheet (Catppuccin theme)
│   │   └── syntax.css      # Code syntax highlighting
│   ├── js/
│   │   └── theme-toggle.js # Dark/light mode toggle
│   └── fonts/
│       └── jetbrains-mono.woff2  # Font file (add manually)
├── types/                  # TypeScript type definitions
│   └── contentful.d.ts     # Contentful schema types
├── .env                    # Environment variables (gitignored)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── CNAME                   # Custom domain for GitHub Pages
├── eleventy.config.ts      # Eleventy configuration
├── index.njk               # Homepage template
├── 404.njk                 # 404 error page
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── README.md               # Project overview
└── SECURITY.md             # Security guidelines
```

### Key Files Explained

**Templates:**
- `index.njk` - Homepage template (lists all posts)
- `404.njk` - Custom 404 error page
- `_includes/layouts/base.njk` - Wraps all pages with header/footer
- `_includes/layouts/post.njk` - Blog post layout

**Data:**
- `_data/posts.ts` - Fetches blog posts from Contentful API
  - Runs at build time
  - Returns array of post objects
  - Available in templates as `posts` collection

**Styles:**
- `static/css/main.css` - Main styles (Catppuccin Mocha theme)
- `static/css/syntax.css` - Code block syntax highlighting

**Configuration:**
- `eleventy.config.ts` - Eleventy setup, plugins, filters, collections
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies, scripts, Node.js version

**Build Output:**
- `_site/` - Generated static site (gitignored)
- This is what gets deployed to GitHub Pages

## Troubleshooting

### "Missing required environment variable" Error

**Problem:**
```
Error: Missing required environment variable: CONTENTFUL_SPACE_ID
```

**Solution:**
1. Verify `.env` file exists in the project root
2. Check that variable names match exactly (case-sensitive)
3. Ensure no extra spaces or quotes around values
4. Restart the dev server after editing `.env`

**Correct format:**
```env
CONTENTFUL_SPACE_ID=abc123xyz
```

**Incorrect format:**
```env
CONTENTFUL_SPACE_ID = "abc123xyz"  # Extra spaces and quotes
```

### Node.js Version Too Old

**Problem:**
```
Error: The engine "node" is incompatible with this module
```

**Solution:**
Update to Node.js 22 or higher:
```bash
# Check current version
node --version

# If using nvm:
nvm install 22
nvm use 22

# Or download from nodejs.org
```

### Contentful Posts Not Showing

**Problem:** Homepage is empty or shows "No posts found"

**Solutions:**

1. **Check environment variables:**
   ```bash
   # In your terminal (Unix/macOS):
   echo $NODE_ENV  # Should output: development

   # Or check in .env file
   cat .env
   ```

2. **Verify posts are published in Contentful:**
   - Go to Contentful dashboard
   - Check that posts have "Published" status
   - In dev mode, drafts should also show

3. **Check content type ID:**
   - Open `_data/posts.ts`
   - Verify line 18: `content_type: 'blogPost'`
   - Ensure this matches your Contentful content type API identifier

4. **Check API tokens:**
   - Go to Contentful Settings > API keys
   - Verify the tokens in your `.env` match
   - Try regenerating tokens if needed

5. **Check console for errors:**
   ```bash
   # Run dev server and look for error messages
   npm run dev
   ```

### Port 8080 Already in Use

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solutions:**

**Option 1:** Stop the process using port 8080:
```bash
# macOS/Linux:
lsof -ti:8080 | xargs kill -9

# Or find and kill manually:
lsof -i:8080
kill -9 <PID>
```

**Option 2:** Use a different port:
```bash
# Edit package.json script temporarily:
"dev": "NODE_ENV=development tsx ./node_modules/.bin/eleventy --serve --port=8081"
```

### Build Fails with TypeScript Errors

**Problem:**
```
error TS2307: Cannot find module 'contentful'
```

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

### Fonts Not Loading

**Problem:** Blog doesn't use JetBrains Mono font

**Solutions:**

1. **Verify font file exists:**
   ```bash
   ls -lh static/fonts/
   # Should show: jetbrains-mono.woff2
   ```

2. **Check font file size:**
   - Should be around 60-100KB
   - If it's 0 bytes or missing, re-download

3. **Check browser console:**
   - Press `F12` to open DevTools
   - Go to Console tab
   - Look for 404 errors for font files

4. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

### Changes Not Reflecting

**Problem:** Saved changes don't appear in the browser

**Solutions:**

1. **Check terminal for errors:**
   - Look for build errors in the dev server output

2. **Hard refresh browser:**
   - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

3. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev  # Start again
   ```

4. **Clean build and restart:**
   ```bash
   npm run clean
   npm run dev
   ```

### Git Push Rejected

**Problem:**
```
error: failed to push some refs to 'https://github.com/sourceman-labs/sourceman-labs.github.io.git'
```

**Solution:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

## Tips and Best Practices

### Development Tips

1. **Keep the dev server running** - It auto-rebuilds on changes, no need to restart
2. **Use browser DevTools** - Experiment with CSS live before editing files
3. **Test in production mode** - Run `npm run build && npm run preview` before deploying
4. **Check both themes** - Toggle dark/light mode to ensure styles work in both
5. **Test on mobile** - Use DevTools responsive mode or real device

### Content Tips

1. **Use descriptive slugs** - Instead of "post-1", use "getting-started-with-typescript"
2. **Write good excerpts** - These show on the homepage listings
3. **Add cover images** - Makes the blog more visually appealing
4. **Use tags** - Helps organize content (even if not displayed yet)
5. **Preview before publishing** - Use dev mode to see drafts

### Performance Tips

1. **Optimize images** - Compress before uploading to Contentful
2. **Keep pages under 14KB** - Check with browser DevTools Network tab
3. **Minimize JavaScript** - Only add if absolutely necessary
4. **Use code splitting** - If adding more JS, load only what's needed

### Git Workflow

1. **Create feature branches:**
   ```bash
   git checkout -b feature/new-layout
   # Make changes
   git add .
   git commit -m "Update homepage layout"
   git push origin feature/new-layout
   # Create pull request on GitHub
   ```

2. **Write clear commit messages:**
   ```bash
   # Good:
   git commit -m "Add dark mode toggle button"

   # Bad:
   git commit -m "changes"
   ```

3. **Don't commit secrets:**
   - Never commit `.env` file
   - Check `.gitignore` includes sensitive files
   - Review changes before committing: `git diff`

### TypeScript Tips

1. **Use type checking:**
   ```bash
   npm run type-check
   ```

2. **Update types when changing content model:**
   - Edit `types/contentful.d.ts`
   - Run type check to verify

3. **IDE integration:**
   - Use VS Code or WebStorm for TypeScript autocomplete
   - Install Eleventy extension for `.njk` syntax highlighting

## Next Steps

Once you have local development working:

1. **Customize the design** - Edit `static/css/main.css` to match your vision
2. **Add more posts** - Create content in Contentful
3. **Test production build** - Run `npm run build && npm run preview`
4. **Setup GitHub Pages** - Follow the README for deployment instructions
5. **Configure custom domains** - See [CLOUDFLARE.md](CLOUDFLARE.md) for dual-domain setup
6. **Setup webhooks** - Auto-deploy when content changes in Contentful

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Contentful Docs**: [contentful.com/developers/docs](https://www.contentful.com/developers/docs/)
- **Eleventy Docs**: [11ty.dev/docs](https://www.11ty.dev/docs/)
- **Node.js Help**: [nodejs.org/en/docs](https://nodejs.org/en/docs/)

## Additional Resources

- [Main README](../README.md) - Project overview and deployment
- [CLOUDFLARE.md](CLOUDFLARE.md) - Dual-domain configuration
- [SECURITY.md](../SECURITY.md) - Security best practices
- [Eleventy Starter Guide](https://www.11ty.dev/docs/getting-started/)
- [Contentful Getting Started](https://www.contentful.com/developers/docs/tutorials/general/get-started/)
