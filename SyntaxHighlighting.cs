using System.Net;
using System.Text;
using Markdig.Parsers;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Syntax;
using TextMateSharp.Grammars;
using TextMateSharp.Registry;

namespace Sourceman.Web;

public class SyntaxHighlightingCodeBlockRenderer(CodeBlockRenderer? underlyingRenderer = null)
    : HtmlObjectRenderer<CodeBlock>
{
    private static readonly Registry Registry = new(new RegistryOptions(ThemeName.DarkPlus));

    private static readonly Dictionary<string, string> MonikerToScope =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["csharp"] = "source.cs",
            ["cs"] = "source.cs",
            ["c#"] = "source.cs",
            ["javascript"] = "source.js",
            ["js"] = "source.js",
            ["typescript"] = "source.ts",
            ["ts"] = "source.ts",
            ["json"] = "source.json",
            ["xml"] = "text.xml",
            ["html"] = "text.html.basic",
            ["powershell"] = "source.powershell",
            ["ps"] = "source.powershell",
            ["css"] = "source.css",
            ["sql"] = "source.sql",
            ["java"] = "source.java",
            ["python"] = "source.python",
            ["py"] = "source.python",
            ["cpp"] = "source.cpp",
            ["c++"] = "source.cpp",
            ["fsharp"] = "source.fsharp",
            ["f#"] = "source.fsharp",
            ["php"] = "source.php",
            ["markdown"] = "text.html.markdown",
            ["md"] = "text.html.markdown",
            ["bash"] = "source.shell",
            ["sh"] = "source.shell",
        };

    // Priority-ordered: first matching prefix wins (most-specific entries first)
    private static readonly (string Prefix, string CssClass)[] ScopeMap =
    [
        ("keyword.control",                     "controlKeyword"),
        ("keyword",                             "keyword"),
        ("storage.type",                        "keyword"),
        ("storage.modifier",                    "keyword"),
        ("variable.language",                   "keyword"),
        ("constant.numeric",                    "number"),
        ("constant.language",                   "builtinValue"),
        ("constant.character.escape",           "stringEscape"),
        ("string",                              "string"),
        ("comment.line.double-slash.doc",       "xmlDocComment"),
        ("comment.block.doc",                   "xmlDocComment"),
        ("comment",                             "comment"),
        ("entity.name.type",                    "className"),
        ("entity.name.class",                   "className"),
        ("entity.other.inherited-class",        "className"),
        ("support.class",                       "className"),
        ("support.type",                        "type"),
        ("entity.name.function",                "method"),
        ("support.function",                    "method"),
        ("entity.name.namespace",               "namespace"),
        ("entity.name.tag",                     "htmlElementName"),
        ("punctuation.definition.tag",          "htmlTagDelimiter"),
        ("entity.other.attribute-name",         "htmlAttributeName"),
        ("markup.heading",                      "markdownHeader"),
        ("markup.inline.raw",                   "markdownCode"),
        ("markup.list",                         "markdownListItem"),
        ("punctuation",                         "delimiter"),
    ];

    protected override void Write(HtmlRenderer renderer, CodeBlock obj)
    {
        if (obj is not FencedCodeBlock fencedCodeBlock ||
            obj.Parser is not FencedCodeBlockParser ||
            string.IsNullOrEmpty(fencedCodeBlock.Info))
        {
            FallbackWrite(renderer, obj);
            return;
        }

        var moniker = fencedCodeBlock.Info;
        if (!MonikerToScope.TryGetValue(moniker, out var scopeName))
        {
            FallbackWrite(renderer, obj);
            return;
        }

        var grammar = Registry.LoadGrammar(scopeName);
        if (grammar is null)
        {
            FallbackWrite(renderer, obj);
            return;
        }

        var code = GetCodeContent(obj);
        var highlighted = Highlight(grammar, code);

        renderer.Write("<pre><code class=\"language-");
        renderer.Write(WebUtility.HtmlEncode(moniker));
        renderer.Write("\">");
        renderer.Write(highlighted);
        renderer.Write("</code></pre>");
        renderer.EnsureLine();
    }

    private static string Highlight(IGrammar grammar, string code)
    {
        var lines = code.Split('\n');
        var sb = new StringBuilder();
        IStateStack? ruleStack = null;

        for (var i = 0; i < lines.Length; i++)
        {
            if (i > 0)
                sb.Append('\n');

            var line = lines[i];
            var result = grammar.TokenizeLine(line, ruleStack, TimeSpan.MaxValue);
            ruleStack = result.RuleStack;

            foreach (var token in result.Tokens)
            {
                var text = line[token.StartIndex..Math.Min(token.EndIndex, line.Length)];
                if (text.Length == 0)
                    continue;

                var cssClass = ResolveCssClass(token.Scopes);
                var encoded = WebUtility.HtmlEncode(text);

                if (cssClass is not null)
                {
                    sb.Append("<span class=\"");
                    sb.Append(cssClass);
                    sb.Append("\">");
                    sb.Append(encoded);
                    sb.Append("</span>");
                }
                else
                {
                    sb.Append(encoded);
                }
            }
        }

        return sb.ToString();
    }

    private static string? ResolveCssClass(IEnumerable<string> scopes)
    {
        // Iterate scopes from most-specific (last) to least-specific (first)
        foreach (var scope in scopes.Reverse())
        {
            foreach (var (prefix, cssClass) in ScopeMap)
            {
                if (scope.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    return cssClass;
            }
        }

        return null;
    }

    private void FallbackWrite(HtmlRenderer renderer, CodeBlock obj)
    {
        var fallback = underlyingRenderer ?? new CodeBlockRenderer();
        fallback.Write(renderer, obj);
    }

    private static string GetCodeContent(LeafBlock obj)
    {
        var code = new StringBuilder();
        var lines = obj.Lines.Lines;
        for (var i = 0; i < obj.Lines.Count; i++)
        {
            var slice = lines[i].Slice;
            if (slice.Text == null)
                continue;

            if (i > 0)
                code.AppendLine();
            code.Append(slice.Text, slice.Start, slice.Length);
        }

        return code.ToString();
    }
}
