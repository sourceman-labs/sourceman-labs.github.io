# sourceman Blog

A static blog generator for [www.sourceman.se](https://www.sourceman.se) built with .NET Razor SSG and local markdown files.

## 🏗️ Architecture Overview

This repository uses the **single-repo GitHub Pages pattern** with a git-based workflow:
- **Repository name**: `sourceman-labs.github.io` (required for GitHub Pages)
- **Content**: Markdown files in `_posts/` directory (version controlled)
- **Deployment**: GitHub Actions builds and deploys on push to main
- **Zero cost**: Everything runs on GitHub's free tier

```
Markdown files in _posts/ directory
    ↓ commit & push
GitHub Actions workflow (triggered on push)
    ↓ builds with .NET Razor SSG
Static HTML/CSS/JS
    ↓ deploys
GitHub Pages → www.sourceman.se
```

**⚠️ Important**: If you cloned this as `site-generator`, rename it to `sourceman-labs.github.io` for GitHub Pages to work correctly.

## Features

- ⚡ **Lightning Fast**: Static site generation with .NET Razor SSG
- 🎨 **Terminal-Inspired Design**: Catppuccin Mocha theme with custom black background
- 🌓 **Dark/Light Mode**: Automatic OS detection + manual toggle
- 📝 **Git-Based Content**: Write posts in markdown, version controlled
- 🎯 **Syntax Highlighting**: Pre-rendered code blocks (zero runtime JS)
- 🚀 **Zero-Cost Hosting**: Deployed to GitHub Pages
- 🔄 **PR Workflow**: Review posts before publishing
- 🔒 **Type Safety**: C# compile-time checking for all code
- ♿ **Lightweight**: <14KB per page (excluding first-load fonts)
- 📦 **No npm Dependencies**: Uses .NET native tooling

## Prerequisites

- **.NET SDK 10.0+** (LTS, released November 2025, supported until November 2028)
  - Download from https://dotnet.microsoft.com/download
- **Git** (for version control)
- **GitHub account** (for GitHub Pages deployment)
- **(Optional) dotnet-serve** - For previewing prerendered static sites
  ```bash
  dotnet tool install --global dotnet-serve
  ```

## Quick Start

### 1. Install .NET SDK

Download and install .NET SDK 10.0 or later:
```bash
# Verify installation
dotnet --version
# Should output: 10.0.x or higher
```

### 2. Clone Repository

```bash
git clone https://github.com/sourceman-labs/sourceman-labs.github.io.git
cd sourceman-labs.github.io
```

### 3. Restore Dependencies

```bash
dotnet restore
```

### 4. Run Development Server

```bash
dotnet run
```

Visit `http://localhost:5000` to see your blog!

The dev server will:
- Watch for changes to markdown posts in `_posts/`
- Hot reload on file changes
- Automatically rebuild when posts are added or edited

## Creating Blog Posts

The blog uses a **git-based workflow** - write posts in markdown, commit to a branch, preview, then merge to publish. No CMS, no external dependencies.

### Quick Workflow

1. **Create date-prefixed markdown file** in `/_posts` directory
2. **Add frontmatter** (YAML metadata) and content
3. **Preview locally** with `dotnet run`
4. **Create PR** to main branch
5. **Merge PR** → auto-deploys to GitHub Pages!

---

### Detailed Workflow

#### 1. Create a New Post Branch

```bash
git checkout -b post/my-awesome-article
```

#### 2. Create Markdown File

**Important**: Use date-prefix format: `YYYY-MM-DD-slug.md`

```bash
touch _posts/2025-12-27-my-awesome-article.md
```

**Why date prefix?**
- Ensures chronological sorting
- Makes filenames unique
- Follows Jekyll/Razor SSG convention

#### 3. Write Post with Frontmatter

Open the file and add frontmatter (YAML metadata) followed by markdown content:

```markdown
---
title: "My Awesome Article: A Deep Dive"
publishedDate: "2025-12-27"
excerpt: "Exploring awesome things in depth. Learn how to build amazing stuff with .NET and C#."
author: "Magnus Källman"
tags: ["dotnet", "csharp", "tutorial"]
---

# Introduction

Start writing your post here...

## Section 1

More content...

\`\`\`csharp
// Code examples with syntax highlighting
public class Example
{
    public void DoSomething() => Console.WriteLine("Hello!");
}
\`\`\`

## Conclusion

Wrap up your thoughts...
```

#### 4. Frontmatter Fields Reference

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | ✅ Yes | string | Post title (displayed in header, meta tags) |
| `publishedDate` | ✅ Yes | string | Publication date (YYYY-MM-DD or ISO 8601) |
| `excerpt` | Recommended | string | Short summary (shown on home page, SEO) |
| `author` | No | string | Author name (defaults to "Magnus Källman") |
| `tags` | No | array | List of tags: `["tag1", "tag2"]` |
| `readingTime` | No | number | Minutes to read (auto-calculated if omitted) |
| `draft` | No | boolean | Set `true` to hide in production builds |
| `updatedDate` | No | string | Last update date (shows "Updated" notice) |

**Example frontmatter:**

```yaml
---
title: "Building a Static Blog with Razor SSG"
publishedDate: "2025-12-27"
updatedDate: "2025-12-28"  # Optional: shows update notice
excerpt: "Learn how to create a fast, type-safe blog using .NET and Razor Pages"
author: "Magnus Källman"
tags: ["dotnet", "razor", "ssg", "blogging"]
draft: false  # Set to true to hide from production
readingTime: 8  # Optional: override auto-calculation
---
```

#### 5. Preview Locally

**Option A: Development server (live reload)**

```bash
dotnet run
# Visit http://localhost:5000
# Changes to markdown files auto-reload
```

**Option B: Static preview (production-like)**

```bash
# Prerender to /dist folder
dotnet run --AppTasks=prerender

# Serve static files
dotnet serve -d dist -p 8080
# Visit http://localhost:8080
```

#### 6. Commit and Push

```bash
# Add your new post
git add _posts/2025-12-27-my-awesome-article.md

# Commit with descriptive message
git commit -m "Add post: My Awesome Article"

# Push to GitHub
git push origin post/my-awesome-article
```

#### 7. Create Pull Request

1. Go to **GitHub repository**: https://github.com/sourceman-labs/sourceman-labs.github.io
2. Click **"Compare & pull request"** (appears after push)
3. **Review changes**:
   - Check markdown renders correctly
   - Verify frontmatter
   - Review diff
4. Click **"Create pull request"**
5. Add description (optional)

#### 8. Merge and Deploy

1. **Review the PR** (optional: ask for feedback)
2. Click **"Merge pull request"**
3. **GitHub Actions automatically**:
   - Installs .NET 10
   - Runs `dotnet restore`
   - Executes `dotnet run --AppTasks=prerender`
   - Deploys `/dist` to GitHub Pages
4. **Live in 1-2 minutes** at https://www.sourceman.se

---

### Post Creation Tips

**File Naming:**
- ✅ Good: `2025-12-27-understanding-async-await.md`
- ❌ Bad: `understanding-async-await.md` (missing date)
- ❌ Bad: `2025-1-27-post.md` (use two-digit months: `01`, not `1`)

**Slug Extraction:**
- Filename: `2025-12-27-my-awesome-post.md`
- Slug becomes: `my-awesome-post`
- URL: `https://www.sourceman.se/blog/my-awesome-post/`

**Draft Posts:**
```yaml
---
title: "Work in Progress"
draft: true  # Hidden in production, visible in development
---
```

**Future Posts:**
```yaml
---
title: "Scheduled for Tomorrow"
publishedDate: "2025-12-28"  # Won't show until this date
---
```

**Updated Posts:**
```yaml
---
title: "Updated Article"
publishedDate: "2025-12-15"
updatedDate: "2025-12-27"  # Shows "Updated on..." notice
---
```

**Code Blocks:**
- Use triple backticks with language: \`\`\`csharp
- Syntax highlighting auto-applied
- Supported: csharp, javascript, bash, yaml, json, etc.

**Images:**
```markdown
![Alt text](/images/my-image.png)
```
Place images in `/wwwroot/images/` and reference as `/images/filename.png`

---

### Editing Existing Posts

```bash
# Create branch
git checkout -b edit/fix-typo-in-awesome-article

# Edit post
vim _posts/2025-12-27-my-awesome-article.md

# Update frontmatter with updatedDate
# (shows "Updated on..." notice to readers)

# Commit, push, PR, merge (same as above)
```

---

### Deleting Posts

```bash
# Create branch
git checkout -b delete/old-post

# Delete post file
git rm _posts/2024-01-01-old-post.md

# Commit and push
git commit -m "Remove outdated post"
git push origin delete/old-post

# Create PR and merge
```

## Available Commands

| Command | Description |
|---------|-------------|
| `dotnet run` | Start development server (live reload at http://localhost:5000) |
| `dotnet run --AppTasks=prerender` | Prerender static site to `/dist` directory |
| `dotnet serve -d dist -p 8080` | Serve static `/dist` folder (after prerender) |
| `dotnet clean` | Remove build artifacts and `/dist` folder |
| `dotnet restore` | Restore NuGet package dependencies |
| `dotnet build` | Compile the project |

## Browser Automation with Playwright MCP

This project is configured with the [Microsoft Playwright MCP server](https://github.com/microsoft/playwright-mcp) for AI-driven browser automation via Claude Code. It uses the browser's accessibility tree (not screenshots) for token-efficient, structured page inspection.

### Setup

The Playwright MCP server is registered in the local Claude Code config. To verify:

```bash
claude mcp list
# Should show: playwright (stdio) npx -y @playwright/mcp
```

If missing, add it:

```bash
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp
```

No project dependencies are added — the MCP server runs out-of-process via `npx` and downloads its own Chromium on first use.

### Usage

Start the site locally, then use Claude Code to drive the browser:

**Option A: Dev server (simplest)**

```bash
dotnet run
# Site available at http://localhost:5000
```

**Option B: Static preview (production-like)**

```bash
# Prerender to static files (this is a build command, not a server)
dotnet run --AppTasks=prerender

# Serve the static output
dotnet serve -d dist -p 8080
# Site available at http://localhost:8080
```

Option A is the quickest way to get started. Option B tests the exact static output that gets deployed to GitHub Pages.

In Claude Code, ask things like:

- "Navigate to localhost:5000 and describe what you see"
- "Check all pages for broken links"
- "Audit the accessibility of the homepage"
- "Toggle dark mode and verify both themes render correctly"
- "Measure the page weight of the blog listing page"

### What You Can Do

| Task | How It Works |
|------|-------------|
| **Link validation** | Crawl all pages in `/dist/`, follow internal links, report 404s |
| **Accessibility auditing** | Inspect heading hierarchy, ARIA labels, alt text via the a11y tree |
| **Content verification** | After adding posts/projects, verify they appear on listing pages |
| **Dark/light mode testing** | Execute JS to toggle theme, then snapshot both modes |
| **Page weight checking** | Use `browser_execute_javascript` to measure DOM size and transfer bytes |
| **Layout verification** | Check navigation, footer, and responsive structure after CSS changes |

### Available Playwright MCP Tools

Once connected, Claude Code has access to these tools:

- `browser_navigate` — go to a URL
- `browser_snapshot` — get an accessibility tree snapshot of the current page
- `browser_click` — click an element
- `browser_fill` — fill a form field
- `browser_execute_javascript` — run JS in the page context
- `browser_screenshot` — capture a screenshot

### Notes

- The MCP server downloads Chromium on first use, so the initial run takes a moment
- No `Microsoft.Playwright` NuGet package is needed — this is not a C# test framework setup
- No test project or xUnit infrastructure is required — the MCP approach is interactive
- For CI-based automated testing, a separate test harness would be needed

## Project Structure

```
site-generator/
├── .github/workflows/       # GitHub Actions CI/CD
│   └── build.yml           # Deployment workflow (.NET 10)
├── _posts/                 # 📝 Blog posts (markdown with date prefix)
│   ├── 2024-12-15-welcome.md
│   └── 2025-12-27-example.md
├── Pages/                  # Razor Pages templates
│   ├── Shared/
│   │   └── _Layout.cshtml  # Base layout
│   ├── Index.cshtml        # Home page
│   ├── Blog.cshtml         # All posts listing
│   └── BlogPost.cshtml     # Individual post renderer
├── wwwroot/                # Static assets (copied to /dist)
│   ├── css/
│   │   ├── main.css        # Main stylesheet (Catppuccin theme)
│   │   └── syntax.css      # Syntax highlighting styles
│   ├── js/
│   │   └── theme-toggle.js # Dark/light mode toggle (<1KB)
│   └── fonts/
│       └── jetbrains-mono.woff2  # Font file
├── dist/                   # 📦 Generated output (deployed to GitHub Pages)
├── Configure.Ssg.cs        # Razor SSG configuration
├── Markdown.Blog.cs        # Blog post loader service
├── MarkdownPagesBase.cs    # Base markdown functionality
├── Program.cs              # ASP.NET Core bootstrapper
├── CNAME                   # Custom domain configuration
├── CNAME                   # Custom domain (www.sourceman.se)
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
- Install .NET 10 SDK
- Run `dotnet restore`
- Execute `dotnet run --AppTasks=prerender`
- Deploy `/dist` folder to GitHub Pages

**Note:** No secrets needed! Posts are in the repository, no external API calls.

### Custom Domain Setup

**CNAME File** (already configured):
The repository includes a `CNAME` file in `/wwwroot` with `www.sourceman.se` as the custom domain.

**DNS Configuration**:
- **www.sourceman.se** (primary) — CNAME record pointing to `sourceman-labs.github.io`
- **sourceman.se** (apex) — redirects to `www.sourceman.se` (configured via Cloudflare)
- Apex domain kept free for future subdomains (e.g. `api.sourceman.se`)

## Security

This blog uses a simple, secure architecture:

- ✅ **No secrets required**: Posts are markdown files in the repository
- ✅ **No external API calls**: Everything is built at compile time
- ✅ **Static output only**: The deployed site contains only HTML/CSS/JS
- ✅ **Version controlled**: All content is tracked in git
- ✅ **Type safety**: C# compile-time checking prevents runtime errors

**Security Flow:**
```
Markdown files in repository
    ↓ (committed to git)
GitHub Actions builds site
    ↓ (converts markdown to HTML using .NET)
Static HTML/CSS/JS deployed
    ↓ (no secrets, no API calls)
Public website (www.sourceman.se)
```

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## 📋 Quick Reference

### Repository Setup Checklist
- [ ] Repository named: `sourceman-labs.github.io`
- [ ] .NET SDK 10.0+ installed
- [ ] GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
- [ ] CNAME file created in `wwwroot/` with custom domain
- [ ] DNS configured for custom domain
- [ ] Example post created in `_posts/` directory

### Common Commands
```bash
dotnet run                       # Local development with hot reload
dotnet run --AppTasks=prerender  # Production build to /dist
dotnet clean                     # Clean build artifacts
dotnet restore                   # Restore dependencies
```

### URLs to Know
- **GitHub Pages**: https://sourceman-labs.github.io
- **Custom Domain**: https://www.sourceman.se
- **GitHub Actions**: https://github.com/sourceman-labs/sourceman-labs.github.io/actions
- **GitHub Settings**: https://github.com/sourceman-labs/sourceman-labs.github.io/settings

## Customization

### Changing Theme Colors

Edit CSS variables in `wwwroot/css/main.css`:

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

1. Update the `BlogPost` class in `Configure.Ssg.cs`
2. Update templates in `Pages/` to display the new fields

### Adding Pages

Create new `.cshtml` files in the `Pages/` directory:

```cshtml
@page "/about"
@{
    ViewData["Title"] = "About";
    Layout = "_Layout";
}

<div class="page-content">
  <h1>About</h1>
  <p>Your content here...</p>
</div>
```

## Troubleshooting

### Posts not showing

- Check that markdown files exist in `_posts/` directory with date prefix format
- Verify frontmatter is valid YAML
- Ensure posts are not marked as `draft: true` (in production)
- Check console output for parsing errors
- Run `dotnet run` and check logs

### Build fails in GitHub Actions

- Review Actions logs for specific errors
- Verify all `.cs` files compile locally with `dotnet build`
- Check that markdown syntax is valid
- Ensure all dependencies are in `.csproj` file

### Prerender fails

- Check that `/wwwroot` directory exists
- Verify layout files exist in `Pages/Shared/_Layout.cshtml`
- Run `dotnet build` first to check for compilation errors
- Check logs for specific error messages

### Fonts not loading

- Ensure `jetbrains-mono.woff2` exists in `wwwroot/fonts/`
- Check browser console for 404 errors
- Verify font path in CSS matches file location
- Ensure fonts are copied to `/dist` during prerender

## Performance

- **First Load**: ~25-35KB (HTML + CSS + fonts)
- **Subsequent Pages**: <14KB (HTML + CSS only, fonts cached)
- **Build Time**: ~2-5 seconds for small blogs (<50 posts)
- **Lighthouse Score**: 95-100 (Performance, Accessibility, Best Practices, SEO)

## Tech Stack

- **.NET 10** - LTS framework (supported until November 2028)
- **Razor Pages** - Templating engine
- **ServiceStack Razor SSG** - Static site generation
- **Markdig** - Markdown processing with CommonMark and GFM support
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting

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
- Website: [www.sourceman.se](https://www.sourceman.se)
