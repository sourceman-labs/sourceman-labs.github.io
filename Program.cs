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
