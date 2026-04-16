---
title: Site Generator
summary: Static site generator built with .NET Razor SSG, Markdig, and Catppuccin theming. Powers sourceman.se.
url: https://github.com/sourceman-labs/site-generator
tags: [dotnet, ssg, razor]
order: 1
---

# Site Generator

A static site generator that powers [sourceman.se](https://sourceman.se), built with .NET Razor SSG and Markdig.

## Features

- **Razor SSG** — pre-renders Razor Pages to static HTML at build time
- **Markdown content** — blog posts and project pages authored in markdown with YAML frontmatter
- **Catppuccin theming** — dark/light mode with the Catppuccin color palette
- **Terminal aesthetic** — monospace typography, code-inspired UI elements
- **Zero-JS content** — pre-rendered syntax highlighting, no client-side rendering

## Stack

- .NET 10 with Razor Pages
- ServiceStack Razor SSG for static generation
- Markdig for markdown processing
- Tailwind-free custom CSS with CSS custom properties
- GitHub Pages for hosting
