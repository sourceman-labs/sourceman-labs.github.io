#!/usr/bin/env node

import { createClient } from "contentful";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { writeFile, mkdir, access } from "node:fs/promises";
import { join, extname } from "node:path";

// ── CLI args ────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    space: { type: "string" },
    token: { type: "string" },
    "content-type": { type: "string" },
    environment: { type: "string", default: "master" },
    "dry-run": { type: "boolean", default: false },
    overwrite: { type: "boolean", default: false },
  },
  strict: true,
});

const ROOT = join(import.meta.dirname, "..", "..");
const POSTS_DIR = join(ROOT, "_posts");
const IMAGES_DIR = join(ROOT, "wwwroot", "img", "blog");

// ── Helpers ─────────────────────────────────────────────────────────────────

function log(level, msg) {
  const prefix = { info: "[INFO] ", warn: "[WARN] ", error: "[ERROR]" };
  console.log(`${prefix[level] ?? ""} ${msg}`);
}

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeYaml(str) {
  if (!str) return '""';
  return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ── Content type discovery ──────────────────────────────────────────────────

const BLOG_FIELD_HINTS = {
  title: { names: ["title", "name", "headline", "heading"], types: ["Symbol", "Text"] },
  body: {
    names: ["body", "content", "text", "post", "article", "richText"],
    types: ["RichText", "Text"],
  },
  slug: { names: ["slug", "url", "permalink", "urlSlug"], types: ["Symbol"] },
  date: {
    names: [
      "date",
      "publishedDate",
      "publishDate",
      "createdDate",
      "publishedAt",
      "published",
    ],
    types: ["Date"],
  },
  excerpt: {
    names: ["excerpt", "summary", "description", "intro", "preamble", "subtitle", "subheading"],
    types: ["Symbol", "Text"],
  },
  tags: { names: ["tags", "categories", "labels", "topics"], types: ["Array"] },
  author: { names: ["author", "writer", "byline"], types: ["Symbol", "Link"] },
  image: {
    names: [
      "image",
      "heroImage",
      "featuredImage",
      "thumbnail",
      "coverImage",
      "hero",
    ],
    types: ["Link"],
  },
};

function scoreContentType(contentType) {
  let score = 0;
  const fieldMap = {};

  for (const [role, hints] of Object.entries(BLOG_FIELD_HINTS)) {
    let bestMatch = null;
    let bestStrength = 0;

    for (const field of contentType.fields) {
      const nameMatch = hints.names.some(
        (n) => field.id.toLowerCase() === n.toLowerCase()
      );
      const typeMatch = hints.types.includes(field.type);

      let strength = 0;
      if (nameMatch && typeMatch) {
        strength = 3;
        // For excerpt, prefer Text over Symbol (longer fields make better excerpts)
        if (role === "excerpt" && field.type === "Text") strength = 4;
      } else if (nameMatch) {
        strength = 1;
      } else if (typeMatch && role === "body" && field.type === "RichText") {
        strength = 1;
      }

      if (strength > bestStrength) {
        bestStrength = strength;
        bestMatch = field.id;
      }
    }

    if (bestMatch) {
      fieldMap[role] = bestMatch;
      score += bestStrength >= 3 ? 2 : 1;
    }
  }

  return { score, fieldMap, contentType };
}

async function discoverContentType(client) {
  const { items } = await client.getContentTypes();
  log("info", `Found ${items.length} content type(s)`);

  const scored = items.map(scoreContentType).sort((a, b) => b.score - a.score);

  for (const { score, fieldMap, contentType } of scored.slice(0, 3)) {
    log(
      "info",
      `  ${contentType.sys.id} "${contentType.name}" — score ${score}, mapped: ${Object.keys(fieldMap).join(", ")}`
    );
  }

  const best = scored[0];
  if (!best || best.score === 0) {
    log("error", "Could not find a blog-like content type. Use --content-type to specify one manually.");
    process.exit(1);
  }

  // Show all fields so unmapped ones are visible
  log("info", `\n  All fields in "${best.contentType.name}":`);
  for (const field of best.contentType.fields) {
    const mapped = Object.entries(best.fieldMap).find(([, v]) => v === field.id);
    const tag = mapped ? ` ← mapped as "${mapped[0]}"` : " (unmapped)";
    log("info", `    ${field.id} (${field.type})${tag}`);
  }

  const answer = await prompt(
    `\nUse content type "${best.contentType.sys.id}" (${best.contentType.name})? [Y/n] `
  );
  if (answer && answer.toLowerCase() !== "y") {
    const id = await prompt("Enter content type ID: ");
    const match = scored.find((s) => s.contentType.sys.id === id);
    if (!match) {
      log("error", `Content type "${id}" not found`);
      process.exit(1);
    }
    return match;
  }

  return best;
}

// ── Rich Text → Markdown ────────────────────────────────────────────────────

const imageDownloads = new Map(); // url → local path

function richTextToMarkdown(node, context = {}) {
  if (!node) return "";

  if (node.nodeType === "text") {
    let text = node.value || "";
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case "bold":
            text = `**${text}**`;
            break;
          case "italic":
            text = `*${text}*`;
            break;
          case "code":
            text = `\`${text}\``;
            break;
          case "underline":
            text = `<u>${text}</u>`;
            break;
        }
      }
    }
    return text;
  }

  const children = (node.content || [])
    .map((child) => richTextToMarkdown(child, context))
    .join("");

  switch (node.nodeType) {
    case "document":
      return children;

    case "heading-1":
      return `# ${children}\n\n`;
    case "heading-2":
      return `## ${children}\n\n`;
    case "heading-3":
      return `### ${children}\n\n`;
    case "heading-4":
      return `#### ${children}\n\n`;
    case "heading-5":
      return `##### ${children}\n\n`;
    case "heading-6":
      return `###### ${children}\n\n`;

    case "paragraph":
      return children ? `${children}\n\n` : "\n";

    case "hyperlink": {
      const uri = node.data?.uri || "";
      return `[${children}](${uri})`;
    }

    case "unordered-list":
      return (
        (node.content || [])
          .map(
            (item) =>
              `- ${richTextToMarkdown(item, { ...context, listItem: true })}`
          )
          .join("\n") + "\n\n"
      );

    case "ordered-list":
      return (
        (node.content || [])
          .map(
            (item, i) =>
              `${i + 1}. ${richTextToMarkdown(item, { ...context, listItem: true })}`
          )
          .join("\n") + "\n\n"
      );

    case "list-item":
      // Strip trailing double newlines from nested paragraphs in list items
      return children.replace(/\n\n$/, "\n").replace(/\n\n/g, "\n");

    case "blockquote":
      return (
        children
          .trim()
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n") + "\n\n"
      );

    case "hr":
      return "---\n\n";

    case "embedded-asset-block": {
      const asset = node.data?.target;
      if (asset?.fields?.file) {
        const file = asset.fields.file;
        const url = file.url.startsWith("//")
          ? `https:${file.url}`
          : file.url;
        const assetId = asset.sys?.id || "unknown";
        const originalName = file.fileName || "image";
        const ext = extname(originalName) || ".jpg";
        const localName = `${assetId}-${slugify(originalName.replace(ext, ""))}${ext}`;
        const localPath = `/img/blog/${localName}`;

        imageDownloads.set(url, { localName, localPath });

        const alt = asset.fields.title || asset.fields.description || "";
        return `![${alt}](${localPath})\n\n`;
      }
      return `<!-- embedded asset: ${asset?.sys?.id || "unknown"} -->\n\n`;
    }

    case "embedded-entry-block":
    case "embedded-entry-inline": {
      const entryId = node.data?.target?.sys?.id || "unknown";
      const contentType =
        node.data?.target?.sys?.contentType?.sys?.id || "unknown";
      log(
        "warn",
        `  Embedded entry reference: ${entryId} (${contentType}) — added TODO placeholder`
      );
      return `<!-- TODO: embedded entry ${entryId} (${contentType}) -->\n\n`;
    }

    default:
      return children;
  }
}

// ── Image downloading ───────────────────────────────────────────────────────

function findContentfulImageUrls(markdown) {
  const urls = [];
  const pattern = /(?:!\[.*?\]\()(\/\/images\.ctfassets\.net\/[^)]+|https:\/\/images\.ctfassets\.net\/[^)]+)\)?/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function downloadImage(url, destPath) {
  const fullUrl = url.startsWith("//") ? `https:${url}` : url;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${fullUrl}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destPath, buffer);
  return buffer.length;
}

async function downloadAllImages(dryRun) {
  if (imageDownloads.size === 0) return;

  if (!dryRun) {
    await mkdir(IMAGES_DIR, { recursive: true });
  }

  let downloaded = 0;
  let skipped = 0;

  for (const [url, { localName }] of imageDownloads) {
    const destPath = join(IMAGES_DIR, localName);

    if (await fileExists(destPath)) {
      skipped++;
      continue;
    }

    if (dryRun) {
      log("info", `  [dry-run] Would download: ${localName}`);
      downloaded++;
      continue;
    }

    try {
      const bytes = await downloadImage(url, destPath);
      log("info", `  Downloaded: ${localName} (${(bytes / 1024).toFixed(1)} KB)`);
      downloaded++;
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      log("error", `  Failed to download ${localName}: ${e.message}`);
    }
  }

  log("info", `Images: ${downloaded} downloaded, ${skipped} already existed`);
}

// ── Hero image extraction ───────────────────────────────────────────────────

function extractHeroImage(entry, fieldMap) {
  const imageFieldId = fieldMap.image;
  if (!imageFieldId) return null;

  const asset = entry.fields[imageFieldId];
  if (!asset?.fields?.file) return null;

  const file = asset.fields.file;
  const url = file.url.startsWith("//") ? `https:${file.url}` : file.url;
  const assetId = asset.sys?.id || "unknown";
  const originalName = file.fileName || "image";
  const ext = extname(originalName) || ".jpg";
  const localName = `${assetId}-${slugify(originalName.replace(ext, ""))}${ext}`;
  const localPath = `/img/blog/${localName}`;

  imageDownloads.set(url, { localName, localPath });
  return localPath;
}

// ── Entry processing ────────────────────────────────────────────────────────

function processEntry(entry, fieldMap) {
  const fields = entry.fields;

  // Title
  const title = fields[fieldMap.title] || "Untitled";

  // Slug
  let slug = fields[fieldMap.slug] || slugify(title);

  // Date
  let date;
  if (fieldMap.date && fields[fieldMap.date]) {
    date = formatDate(fields[fieldMap.date]);
  } else {
    date = formatDate(entry.sys.createdAt);
    log("warn", `  "${title}" has no date field, using sys.createdAt`);
  }

  // Excerpt
  let excerpt = "";
  if (fieldMap.excerpt && fields[fieldMap.excerpt]) {
    excerpt = fields[fieldMap.excerpt];
  }

  // Author
  let author = "Magnus Kallman";
  if (fieldMap.author && fields[fieldMap.author]) {
    const authorField = fields[fieldMap.author];
    if (typeof authorField === "string") {
      author = authorField;
    } else if (authorField?.fields?.name) {
      author = authorField.fields.name;
    }
  }

  // Tags
  let tags = [];
  if (fieldMap.tags && fields[fieldMap.tags]) {
    const tagVal = fields[fieldMap.tags];
    if (Array.isArray(tagVal)) {
      tags = tagVal.map((t) => (typeof t === "string" ? t : t?.fields?.name || String(t)));
    }
  }

  // Body
  let body = "";
  if (fieldMap.body && fields[fieldMap.body]) {
    const bodyField = fields[fieldMap.body];
    if (typeof bodyField === "string") {
      // Plain markdown or text
      body = bodyField;
    } else if (bodyField.nodeType === "document") {
      // Rich Text
      body = richTextToMarkdown(bodyField);
    } else {
      log("warn", `  "${title}" has unexpected body type, attempting string conversion`);
      body = String(bodyField);
    }
  } else {
    log("error", `  "${title}" has no body content, skipping`);
    return null;
  }

  // Hero image
  const heroImage = extractHeroImage(entry, fieldMap);

  // Scan body for remaining Contentful image URLs not already handled
  const remainingUrls = findContentfulImageUrls(body);
  for (const url of remainingUrls) {
    if (!imageDownloads.has(url)) {
      const fullUrl = url.startsWith("//") ? `https:${url}` : url;
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1] || "image.jpg";
      const ext = extname(filename) || ".jpg";
      const localName = `inline-${slugify(filename.replace(ext, ""))}${ext}`;
      const localPath = `/img/blog/${localName}`;
      imageDownloads.set(fullUrl, { localName, localPath });
      body = body.replace(url, localPath);
    }
  }

  // Truncate excerpt if too long
  if (excerpt.length > 300) {
    excerpt = excerpt.slice(0, 297) + "...";
  }

  // If no excerpt, take first ~160 chars from body
  if (!excerpt && body) {
    const plainText = body.replace(/[#*_`>\[\]()!-]/g, "").trim();
    excerpt =
      plainText.length > 160
        ? plainText.slice(0, 157) + "..."
        : plainText;
    // Take only first line/paragraph
    const firstPara = excerpt.split("\n\n")[0].split("\n")[0];
    if (firstPara.length > 20) {
      excerpt = firstPara;
    }
  }

  return { title, slug, date, excerpt, author, tags, body, heroImage };
}

// ── File writing ────────────────────────────────────────────────────────────

function buildFrontmatter({ title, slug, date, excerpt, author, tags, heroImage }) {
  const lines = [
    "---",
    `title: ${escapeYaml(title)}`,
    `slug: ${escapeYaml(slug)}`,
    `publishedDate: ${escapeYaml(date)}`,
    `excerpt: ${escapeYaml(excerpt)}`,
    `author: ${escapeYaml(author)}`,
    `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`,
  ];
  if (heroImage) {
    lines.push(`image: ${escapeYaml(heroImage)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

async function writePost(post, dryRun, overwrite) {
  const filename = `${post.date}-${post.slug}.md`;
  const filepath = join(POSTS_DIR, filename);

  if (!overwrite && (await fileExists(filepath))) {
    log("warn", `  ${filename} already exists, skipping (use --overwrite to replace)`);
    return false;
  }

  const content = `${buildFrontmatter(post)}\n\n${post.body.trim()}\n`;

  if (dryRun) {
    log("info", `  [dry-run] Would write: ${filename}`);
    return true;
  }

  await writeFile(filepath, content, "utf-8");
  log("info", `  Written: ${filename}`);
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log("info", "Contentful → Markdown migration\n");

  // Get credentials
  let spaceId = args.space || (await prompt("Contentful Space ID: "));
  let accessToken = args.token || (await prompt("Content Delivery API token: "));

  if (!spaceId || !accessToken) {
    log("error", "Space ID and access token are required");
    process.exit(1);
  }

  // Create client
  const client = createClient({
    space: spaceId,
    accessToken,
    environment: args.environment,
  });

  // Discover or use specified content type
  let fieldMap, contentType;
  if (args["content-type"]) {
    const { items } = await client.getContentTypes();
    const ct = items.find((t) => t.sys.id === args["content-type"]);
    if (!ct) {
      log("error", `Content type "${args["content-type"]}" not found`);
      process.exit(1);
    }
    const result = scoreContentType(ct);
    fieldMap = result.fieldMap;
    contentType = ct;
    log("info", `Using specified content type: ${ct.sys.id} (${ct.name})`);
    log("info", `  Mapped fields: ${JSON.stringify(fieldMap, null, 2)}`);
  } else {
    const result = await discoverContentType(client);
    fieldMap = result.fieldMap;
    contentType = result.contentType;
    log("info", `\nField mapping: ${JSON.stringify(fieldMap, null, 2)}`);
  }

  if (!fieldMap.body) {
    log("error", "No body/content field found. Check your content type.");
    process.exit(1);
  }

  // Fetch entries
  log("info", "\nFetching published entries...");
  let allEntries = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const response = await client.getEntries({
      content_type: contentType.sys.id,
      limit,
      skip,
      include: 10,
      order: "-sys.createdAt",
    });
    allEntries.push(...response.items);
    if (allEntries.length >= response.total) break;
    skip += limit;
  }

  log("info", `Fetched ${allEntries.length} published entries`);

  // Ensure output directory exists
  if (!args["dry-run"]) {
    await mkdir(POSTS_DIR, { recursive: true });
  }

  // Process entries
  let written = 0;
  let skipped = 0;
  const usedSlugs = new Set();

  for (const entry of allEntries) {
    const post = processEntry(entry, fieldMap);
    if (!post) {
      skipped++;
      continue;
    }

    // Handle duplicate slugs
    let finalSlug = post.slug;
    let suffix = 2;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${post.slug}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(finalSlug);
    post.slug = finalSlug;

    log("info", `\nProcessing: "${post.title}" (${post.date})`);

    if (await writePost(post, args["dry-run"], args.overwrite)) {
      written++;
    } else {
      skipped++;
    }
  }

  // Download images
  if (imageDownloads.size > 0) {
    log("info", `\nDownloading ${imageDownloads.size} image(s)...`);
    await downloadAllImages(args["dry-run"]);
  }

  // Summary
  log("info", "\n─── Migration complete ───");
  log("info", `Posts written: ${written}`);
  log("info", `Posts skipped: ${skipped}`);
  log("info", `Images queued: ${imageDownloads.size}`);

  if (args["dry-run"]) {
    log("info", "\nThis was a dry run. No files were written. Run without --dry-run to execute.");
  }
}

main().catch((e) => {
  log("error", e.message);
  process.exit(1);
});
