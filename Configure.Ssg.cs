[assembly: HostingStartup(typeof(SourcemanBlog.ConfigureSsg))]

namespace SourcemanBlog;

public class ConfigureSsg : IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices(services =>
        {
            services.AddSingleton<RazorPagesEngine>();
            services.AddSingleton<MarkdownBlog>();
            services.AddSingleton<MarkdownProjects>();
        })
        .ConfigureAppHost(
            appHost => appHost.Plugins.Add(new CleanUrlsFeature()),
            afterPluginsLoaded: appHost =>
            {
                MarkdigConfig.Set(new MarkdigConfig
                {
                    ConfigurePipeline = pipeline =>
                    {
                        // Extend Markdig Pipeline if needed
                    },
                    ConfigureContainers = config =>
                    {
                        config.AddBuiltInContainers();
                    }
                });

                var blogPosts = appHost.Resolve<MarkdownBlog>();
                blogPosts.LoadFrom("_posts");

                var projects = appHost.Resolve<MarkdownProjects>();
                projects.LoadFrom("_projects");
            },
            afterAppHostInit: appHost => { });
}

// Generic markdown file info
public class MarkdownFileInfo : MarkdownFileBase
{
}

// Blog post frontmatter model
public class BlogPost : MarkdownFileBase
{
    public int ReadingTime { get; set; }
}

// Project frontmatter model
public class Project : MarkdownFileBase
{
}
