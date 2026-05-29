---
title: sourceman.se
summary: Static site generator built with .NET Razor SSG, Markdig. Powers sourceman.se.
url: https://github.com/sourceman-labs/sourceman-labs.github.io
tags: [dotnet, ssg, razor]
order: 1
---

# sourceman.se

Here is the _mandatory_ "how this site was built post". A static site generator that powers [sourceman.se](https://www.sourceman.se), built with .NET Razor SSG and Markdig.

It's not a coincidence this website is fast. The website is statically rendered and served via a CDN and quite importantly I have intentionally made the payloads small, fitting the page load within the [14kb rule](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/). The only part of this page that is large is the font, but come on, JetBrains Mono is worth. The internet would be a nicer place if more people cared to remove complexity and improve performance.

## Features

- **Razor SSG** — pre-renders Razor Pages to static HTML at build time
- **Markdown content** — blog posts and project pages authored in markdown with YAML frontmatter
- **Terminal aesthetic** — monospace typography, code-inspired UI elements
- **Syntax highlighting** — server-side highlighted at build time using ColorCode

## Stack

- .NET 10 with Razor Pages
- ServiceStack Razor SSG for static generation
- Markdig for markdown processing
- ColorCode for syntax highlighting
- Custom CSS with CSS custom properties
- GitHub Pages for hosting
