using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using ServiceStack;
using ServiceStack.IO;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddServiceStack(typeof(SourcemanBlog.AppHost).Assembly);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

var appHost = new SourcemanBlog.AppHost();
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

    Console.WriteLine("Prerender complete!");
    return;
}

app.Run();
