I'm in the process in re-creating an old programming blob. Make a plan to help me according to this spec. Ask questions if things need to be clarified.
- i want zero cost hosting like github pages if requirements are applicable
- i already own two custom domains that i intend to both send to the blog
- i want a static site generator to generate the pages, whatever static site generator is the easiest to integrate and manage for github pages together with contentful cms. It will be reactive, booting up only by command or webhooks from my cms.
- i currently have my blog in the free tier of contentful cms which has a headless api
- I intend my blog to be very simple but with elegant best practices design. Little to No javascript for optimal performance and simplicity. I'd prefer each page load to be maximm. 14kb for most optimal page load speed.
- Is it possible to have some kind of navigation for my blog to paginate or browse historical pages without a backend server?
- i want best practice text properties and layout for article reading like font size, column width etc. 
- i want to both dark and light mode if this is possible with css queries to let the user's os settings decide on dark vs light. And then also have a simple button where the user can switch between dark and light mode if they like.
- I would prefer to have the blog in cattpuccin mocha theme but with some custom blackish colors. this is my ghostty theme for reference
ghostty-theme
background = 1e1e1e
foreground = cdd6f4
cursor-color = f5e0dc
cursor-text = 1e1e2e
selection-background = 353749
selection-foreground = cdd6f4

- I like the simple design of https://opencode.ai/ which is terminal inspired but still web-ish
- i intend to have a logo drawn in html/css like inspired by this ascii art, symbolizing a terminal prompt saying "sourceman" with an open source mono space font like jetbrains mono:
-------------------
|  >_ sourceman   |
|                 |
|                 |
-------------------

- There will be one primary domain, and the other domain will just redirect with a permanent redirect.
- I have no alternative as of yet, are there better options that zola or if i need to decide between various libs, make suggestions.
- Very small js is tolerable if the total payload for an article is generally below 14kb.
- I like jetbrains mono, but i'm open for alternatives that are also open source
- I have an azure subscription in acr and azure container apps environment setup already. But i'm tinking of moving my container images to a private github packages repo to save costs.

One thing that is not to be omitted, is that the static site generator needs to generate code syntax highlighting as this is a coding blog. And the historical common use case is to use runtime javascript to highlight <pre> tags with code. But i want the syntax highlight to be pre-rendred during static site generation, so no javascript is needed to syntax highlight at runtime.
