import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

export default function (eleventyConfig: any) {
  // Add syntax highlighting plugin (pre-rendered, zero runtime JS)
  eleventyConfig.addPlugin(syntaxHighlight, {
    preAttributes: {
      // Add language class to pre tag for additional styling
      class: ({ language }: { language: string }) => `language-${language}`,
    },
  });

  // Copy static assets to output
  eleventyConfig.addPassthroughCopy('static/css');
  eleventyConfig.addPassthroughCopy('static/js');
  eleventyConfig.addPassthroughCopy('static/fonts');
  eleventyConfig.addPassthroughCopy('CNAME');

  // Add date filters for templates
  eleventyConfig.addFilter('readableDate', (dateObj: Date | string) => {
    const date = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  eleventyConfig.addFilter('isoDate', (dateObj: Date | string) => {
    const date = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    return date.toISOString();
  });

  // Add filter to limit array length (for pagination previews)
  eleventyConfig.addFilter('limit', (array: any[], limit: number) => {
    return array.slice(0, limit);
  });

  // Add collection for blog posts (sorted by date, newest first)
  eleventyConfig.addCollection('posts', (collectionApi: any) => {
    return collectionApi
      .getAll()
      .filter((item: any) => item.data.layout === 'post')
      .sort((a: any, b: any) => {
        const dateA = new Date(a.data.publishedDate || a.date).getTime();
        const dateB = new Date(b.data.publishedDate || b.date).getTime();
        return dateB - dateA; // Newest first
      });
  });

  // Watch CSS files for changes during development
  eleventyConfig.addWatchTarget('static/css/');
  eleventyConfig.addWatchTarget('static/js/');
  eleventyConfig.addWatchTarget('posts/');

  // Set default template engine
  eleventyConfig.setTemplateFormats([
    'md',
    'njk',
    'html',
    'liquid',
  ]);

  // Configuration options
  return {
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
  };
}
