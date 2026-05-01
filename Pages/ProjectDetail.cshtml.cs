using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Sourceman.Web.Pages;

public class ProjectDetailModel : PageModel
{
    [FromRoute]
    public string? Slug { get; set; }
}
