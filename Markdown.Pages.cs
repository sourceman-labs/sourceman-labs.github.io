using ServiceStack.IO;

namespace Sourceman.Web;

// Stub implementation for markdown pages (not currently used but required by MarkdownTagHelper)
public class MarkdownPages(ILogger<MarkdownPages> log, IWebHostEnvironment env, IVirtualFiles fs)
    : MarkdownPagesBase<MarkdownFileInfo>(log, env, fs)
{
    public override string Id => "pages";

    List<MarkdownFileInfo> Pages { get; set; } = new();

    public List<MarkdownFileInfo> GetVisiblePages(string? prefix = null, bool allDirectories = false) =>
        Pages.Where(IsVisible).ToList();

    public MarkdownFileInfo? GetBySlug(string slug) =>
        Fresh(Pages.FirstOrDefault(x => IsVisible(x) && x.Slug == slug));

    public void LoadFrom(string fromDirectory)
    {
        Pages.Clear();
        var files = VirtualFiles.GetDirectory(fromDirectory)?.GetAllFiles().ToList() ?? [];
        var pipeline = CreatePipeline(string.Empty);

        foreach (var file in files)
        {
            if (file.Extension == "md")
            {
                var doc = Load(file.VirtualPath, pipeline);
                if (doc != null) Pages.Add(doc);
            }
        }
    }
}

// Note: MarkdownIncludes is already defined in MarkdownPagesBase.cs
