using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SourcemanBlog.Pages;

public class BlogPostModel : PageModel
{
    [FromRoute]
    public string? Slug { get; set; }
}
