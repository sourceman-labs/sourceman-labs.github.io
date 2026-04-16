using Markdig;
using ServiceStack.IO;

namespace SourcemanBlog;

public class MarkdownProjects(ILogger<MarkdownProjects> log, IWebHostEnvironment env, IVirtualFiles fs)
    : MarkdownPagesBase<Project>(log, env, fs)
{
    public override string Id => "projects";
    List<Project> Projects { get; set; } = [];

    public List<Project> VisibleProjects => Projects.Where(IsVisible).ToList();

    public List<Project> GetProjects(string? tag = null)
    {
        IEnumerable<Project> results = Projects.Where(IsVisible);
        if (tag != null)
            results = results.Where(x => x.Tags.Contains(tag));
        return results
            .OrderBy(x => x.Order ?? int.MaxValue)
            .ThenBy(x => x.Title)
            .ToList();
    }

    public string GetProjectLink(Project project) => $"/projects/{project.Slug}/";

    public Project? FindProjectBySlug(string slug) => Fresh(VisibleProjects.FirstOrDefault(x => x.Slug == slug));

    public override Project? Load(string path, MarkdownPipeline? pipeline = null)
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
        doc.Slug = file.Name.LastLeftPart('.').GenerateSlug();
        doc.Date ??= file.LastModified;

        doc.WordCount = WordCount(content);
        doc.LineCount = LineCount(content);

        writer.Flush();
        doc.Preview = writer.ToString();

        return doc;
    }

    public void LoadFrom(string fromDirectory)
    {
        Projects.Clear();
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
                        Projects.Add(doc);
                }
                catch (Exception e)
                {
                    log.LogError(e, "Couldn't load {VirtualPath}: {Message}", file.VirtualPath, e.Message);
                }
            }
        }

        log.LogInformation("Loaded {Count} projects", Projects.Count);
    }

    public override List<MarkdownFileBase> GetAll() =>
        VisibleProjects.Map(doc => ToMetaDoc(doc, x => x.Url ??= $"/projects/{x.Slug}/"));
}
