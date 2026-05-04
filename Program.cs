using NUglify;
using ServiceStack.IO;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddServiceStack(typeof(Sourceman.Web.AppHost).Assembly);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

var appHost = new Sourceman.Web.AppHost();
app.UseServiceStack(appHost);

app.MapRazorPages();

// Check for AppTasks=prerender and execute directly
if (args.Length > 0 && args[0] == "--AppTasks=prerender")
{
    Console.WriteLine("Running prerender task...");

    var contentRoot = app.Environment.ContentRootPath;
    var distDir = Path.Combine(contentRoot, "dist");

    // Delete existing dist directory
    if (Directory.Exists(distDir))
    {
        Console.WriteLine($"Deleting existing dist directory: {distDir}");
        Directory.Delete(distDir, true);
    }

    // Copy wwwroot to dist
    var wwwrootDir = Path.Combine(contentRoot, "wwwroot");
    Console.WriteLine($"Copying {wwwrootDir} to {distDir}");
    FileSystemVirtualFiles.CopyAll(new DirectoryInfo(wwwrootDir), new DirectoryInfo(distDir));

    // Prerender Razor pages
    var razorFiles = appHost.VirtualFiles.GetAllMatchingFiles("*.cshtml");
    Console.WriteLine($"Prerendering {razorFiles.Count()} Razor files...");
    await RazorSsg.PrerenderAsync(appHost, razorFiles, distDir);

    // Clean up route template artifacts left by RazorSsg
    foreach (var file in Directory.GetFiles(distDir, "*.html", SearchOption.AllDirectories))
    {
        if (Path.GetFileName(file).Contains('{'))
            File.Delete(file);
    }

    // GitHub Pages serves /slug/ from slug/index.html, not slug.html.
    // Restructure every non-index .html to slug/index.html so trailing-slash URLs resolve.
    foreach (var file in Directory.GetFiles(distDir, "*.html", SearchOption.AllDirectories).ToList())
    {
        if (Path.GetFileName(file) == "index.html") continue;

        var slug = Path.GetFileNameWithoutExtension(file);
        var parentDir = Path.GetDirectoryName(file)!;
        var targetDir = Path.Combine(parentDir, slug);
        Directory.CreateDirectory(targetDir);
        File.Move(file, Path.Combine(targetDir, "index.html"));
    }

    // Generate sitemap.xml
    var blog = appHost.Resolve<Sourceman.Web.MarkdownBlog>();
    var projects = appHost.Resolve<Sourceman.Web.MarkdownProjects>();
    var allPosts = blog.GetPosts();
    var allProjects = projects.GetProjects();
    var baseUrl = "https://www.sourceman.se";
    var sitemapUrls = new List<(string Loc, string? LastMod, string Priority)>
    {
        ($"{baseUrl}/", null, "1.0"),
        ($"{baseUrl}/blog/", null, "0.9"),
        ($"{baseUrl}/projects/", null, "0.9"),
        ($"{baseUrl}/about/", null, "0.8"),
    };
    foreach (var post in allPosts)
        sitemapUrls.Add(($"{baseUrl}{blog.GetPostLink(post)}", post.Date?.ToString("yyyy-MM-dd"), "0.7"));
    foreach (var project in allProjects)
        sitemapUrls.Add(($"{baseUrl}{projects.GetProjectLink(project)}", null, "0.7"));
    var allTags = allPosts.SelectMany(p => p.Tags)
        .Concat(allProjects.SelectMany(p => p.Tags))
        .Distinct();
    foreach (var tag in allTags)
        sitemapUrls.Add(($"{baseUrl}/tags/{tag.GenerateSlug()}/", null, "0.5"));

    var sitemapXml = new System.Text.StringBuilder();
    sitemapXml.AppendLine("""<?xml version="1.0" encoding="UTF-8"?>""");
    sitemapXml.AppendLine("""<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">""");
    foreach (var (loc, lastMod, priority) in sitemapUrls)
    {
        sitemapXml.AppendLine("  <url>");
        sitemapXml.AppendLine($"    <loc>{loc}</loc>");
        if (lastMod != null) sitemapXml.AppendLine($"    <lastmod>{lastMod}</lastmod>");
        sitemapXml.AppendLine($"    <priority>{priority}</priority>");
        sitemapXml.AppendLine("  </url>");
    }
    sitemapXml.AppendLine("</urlset>");
    File.WriteAllText(Path.Combine(distDir, "sitemap.xml"), sitemapXml.ToString());
    Console.WriteLine($"Generated sitemap.xml with {sitemapUrls.Count} URLs");

    // Minify CSS and JS files in dist
    foreach (var cssFile in Directory.GetFiles(distDir, "*.css", SearchOption.AllDirectories))
    {
        var source = File.ReadAllText(cssFile);
        var result = Uglify.Css(source);
        if (result.HasErrors)
        {
            Console.WriteLine($"Warning: CSS minification errors in {cssFile}:");
            foreach (var error in result.Errors)
                Console.WriteLine($"  {error}");
        }
        else
        {
            File.WriteAllText(cssFile, result.Code);
            Console.WriteLine($"Minified {Path.GetRelativePath(distDir, cssFile)} ({source.Length} -> {result.Code.Length} bytes)");
        }
    }

    foreach (var jsFile in Directory.GetFiles(distDir, "*.js", SearchOption.AllDirectories))
    {
        var source = File.ReadAllText(jsFile);
        var result = Uglify.Js(source);
        if (result.HasErrors)
        {
            Console.WriteLine($"Warning: JS minification errors in {jsFile}:");
            foreach (var error in result.Errors)
                Console.WriteLine($"  {error}");
        }
        else
        {
            File.WriteAllText(jsFile, result.Code);
            Console.WriteLine($"Minified {Path.GetRelativePath(distDir, jsFile)} ({source.Length} -> {result.Code.Length} bytes)");
        }
    }

    Console.WriteLine("Prerender complete!");
    return;
}

app.Run();
