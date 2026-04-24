using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Sourceman.Web.Pages;

public class TagModel : PageModel
{
    [FromRoute]
    public string? Tag { get; set; }
}
