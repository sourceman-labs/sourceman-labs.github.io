using Microsoft.AspNetCore.Mvc.Rendering;
using ServiceStack.IO;

[assembly: HostingStartup(typeof(Sourceman.Web.AppHost))]

namespace Sourceman.Web;

public class AppHost() : AppHostBase("Sourceman.Web"), IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices((context, services) =>
        {
            context.Configuration.GetSection(nameof(AppConfig)).Bind(AppConfig.Instance);
            services.AddSingleton(AppConfig.Instance);
        });
}

public class AppConfig
{
    public static AppConfig Instance { get; } = new();
    public string Title { get; set; } = "sourceman";
    public string LocalBaseUrl { get; set; } = "http://localhost:5000";
    public string PublicBaseUrl { get; set; } = "https://www.sourceman.se";

    public void Init(IVirtualDirectory contentDir)
    {
        // Configuration initialization if needed
    }
}

public static class HtmlHelpers
{
    private static string ToAbsoluteContentUrl(string? relativePath) => HostContext.DebugMode
        ? AppConfig.Instance.LocalBaseUrl.CombineWith(relativePath)
        : AppConfig.Instance.PublicBaseUrl.CombineWith(relativePath);

    private static string ToAbsoluteApiUrl(string? relativePath) => HostContext.DebugMode
        ? AppConfig.Instance.LocalBaseUrl.CombineWith(relativePath)
        : AppConfig.Instance.PublicBaseUrl.CombineWith(relativePath);

    public static string ContentUrl(this IHtmlHelper html, string? relativePath) => ToAbsoluteContentUrl(relativePath);
    public static string ApiUrl(this IHtmlHelper html, string? relativePath) => ToAbsoluteApiUrl(relativePath);
}
