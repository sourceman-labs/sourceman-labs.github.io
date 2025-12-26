# Fonts Directory

## JetBrains Mono Font Setup

This project uses **JetBrains Mono** font for the terminal-inspired design.

### Option 1: Self-Host (Recommended for Performance)

1. Download JetBrains Mono from: https://www.jetbrains.com/lp/mono/
2. Extract the font files
3. Copy `JetBrainsMono-Regular.woff2` to this directory
4. Rename it to `jetbrains-mono.woff2`

### Option 2: Use CDN (Easier but adds external dependency)

If you prefer to use a CDN instead, update `_includes/layouts/base.njk`:

Replace the font preload line with:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

And remove the `@font-face` declaration from `static/css/main.css`.

### Font Subsetting (Optional, for even better performance)

To reduce font file size, you can create a subset with only the characters you need:

```bash
pip install fonttools brotli
pyftsubset JetBrainsMono-Regular.ttf \
  --output-file=jetbrains-mono.woff2 \
  --flavor=woff2 \
  --layout-features=* \
  --unicodes="U+0020-007F,U+00A0-00FF"
```

This creates a ~15-20KB font file instead of ~100KB.
