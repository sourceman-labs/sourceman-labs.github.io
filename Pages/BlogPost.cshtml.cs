using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Sourceman.Web.Pages;

public class BlogPostModel : PageModel
{
    [FromRoute]
    public string? Slug { get; set; }
}
