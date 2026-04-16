using System.Globalization;
using Markdig;
using ServiceStack.IO;

namespace SourcemanBlog;

public class MarkdownBlog(ILogger<MarkdownBlog> log, IWebHostEnvironment env, IVirtualFiles fs)
    : MarkdownPagesBase<BlogPost>(log, env, fs)
{
    public override string Id => "blog";
    List<BlogPost> Posts { get; set; } = [];

    public List<BlogPost> VisiblePosts => Posts.Where(IsVisible).ToList();

    public List<BlogPost> GetPosts(string? tag = null, int? year = null)
    {
        IEnumerable<BlogPost> latestPosts = Posts.Where(IsVisible);
        if (tag != null)
            latestPosts = latestPosts.Where(x => x.Tags.Contains(tag));
        if (year != null)
            latestPosts = latestPosts.Where(x => x.Date.GetValueOrDefault().Year == year);
        return latestPosts.OrderByDescending(x => x.Date).ToList();
    }

    public string GetPostLink(BlogPost post) => $"/blog/{post.Slug}/";
    public string GetTagLink(string tag) => $"/blog/tagged/{tag.GenerateSlug()}/";
    public string GetDateLabel(DateTime? date) => X.Map(date ?? DateTime.UtcNow, d => d.ToString("MMMM d, yyyy"))!;

    public BlogPost? FindPostBySlug(string slug) => Fresh(VisiblePosts.FirstOrDefault(x => x.Slug == slug));

    public override BlogPost? Load(string path, MarkdownPipeline? pipeline = null)
    {
        var file = VirtualFiles.GetFile(path)
            ?? throw new FileNotFoundException(path.LastRightPart('/'));
        var content = file.ReadAllText();

        var writer = new StringWriter();
        var doc = CreateMarkdownFile(path, content, writer, pipeline);
        if (doc.Title == null)
        {
            log.LogWarning("No frontmatter found for {VirtualPath}, ignoring...", file.VirtualPath);
            return null;
        }

        doc.Path = file.VirtualPath;
        doc.FileName = file.Name;

        // Extract slug from filename: 2024-12-15-welcome.md -> welcome
        var nameWithoutExt = file.Name.LastLeftPart('.');
        var datePrefixPattern = @"^\d{4}-\d{2}-\d{2}-";
        if (System.Text.RegularExpressions.Regex.IsMatch(nameWithoutExt, datePrefixPattern))
        {
            doc.Slug = System.Text.RegularExpressions.Regex.Replace(nameWithoutExt, datePrefixPattern, "");
        }
        else
        {
            doc.Slug = nameWithoutExt.GenerateSlug();
        }

        // Parse date from filename: 2024-12-15-welcome.md
        var datePart = file.Name.Substring(0, 10); // YYYY-MM-DD
        if (DateTime.TryParseExact(datePart, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.AdjustToUniversal, out var date))
        {
            doc.Date ??= date;
        }
        else
        {
            log.LogWarning("Could not parse date from filename '{FileName}', using file modified date", file.Name);
            doc.Date ??= file.LastModified;
        }

        doc.WordCount = WordCount(content);
        doc.LineCount = LineCount(content);
        doc.ReadingTime = MinutesToRead(doc.WordCount);

        writer.Flush();
        doc.Preview = writer.ToString();

        return doc;
    }

    public void LoadFrom(string fromDirectory)
    {
        Posts.Clear();
        var files = VirtualFiles.GetDirectory(fromDirectory)?.GetAllFiles().ToList() ?? [];
        log.LogInformation("Found {Count} markdown files in {Directory}", files.Count, fromDirectory);

        var pipeline = CreatePipeline(string.Empty);

        foreach (var file in files)
        {
            if (file.Extension == "md" && file.Name != "README.md")
            {
                try
                {
                    var doc = Load(file.VirtualPath, pipeline);
                    if (doc != null)
                    {
                        Posts.Add(doc);
                    }
                }
                catch (Exception e)
                {
                    log.LogError(e, "Couldn't load {VirtualPath}: {Message}", file.VirtualPath, e.Message);
                }
            }
        }

        log.LogInformation("Loaded {Count} blog posts", Posts.Count);
    }

    public override List<MarkdownFileBase> GetAll() =>
        VisiblePosts.Map(doc => ToMetaDoc(doc, x => x.Url ??= $"/blog/{x.Slug}/"));
}
