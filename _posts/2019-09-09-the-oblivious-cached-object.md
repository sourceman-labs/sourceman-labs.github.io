---
title: "The oblivious cached object"
slug: "the-oblivious-cached-object"
publishedDate: "2019-09-09"
excerpt: "Phil Karlton once said “There are only two hard things in Computer Science: cache invalidation and naming things.” The perhaps most famous programming quote, is painfully often correct, but Episerver developers far too often tend to make it so by overlooking a simple call to an interface."
author: "Magnus Kallman"
tags: ["episerver", "caching"]
---

During my travels in the world of code, I've found that quote proven to be true so many times, even though it didn't have to be so. Hence, this blog post will be about the perhaps most overlooked interface by all Episerver developers.

Setting up cache dependencies to content in Episerver is so widely disregarded, that the if we could avoid some of the collective time spent by people waiting for cache to be invalidated, we would probably boost our GDP by a noticeable amount.

No matter if you're using any of Episervers cache implementations or straight up HttpRuntime.Cache, when you have a dependency to content. 
All you need is to call IContentCacheKeyCreator to get the dependency for that content.

### 📓 The interface definition
The interface contains basically all you need to be able to set up cache dependencies to content in Episerver with minimum effort.

[⚓ Official documentation of IContentCacheKeyCreator](https://world.episerver.com/documentation/Class-library/?documentId=cms/11/468FDFF7 "Episerver documentation of IContentCacheKeyCreator")

```csharp
namespace EPiServer.Core
{
    public interface IContentCacheKeyCreator
    {
        string RootKeyName { get; }
        
        string VersionKey { get; }
        
        int RemoteCacheUpdateLimit { get; }

        string CreateChildrenCacheKey(ContentReference contentLink, string languageID);

        string CreateCommonCacheKey(ContentReference contentLink);

        string CreateLanguageCacheKey(ContentReference contentLink, string languageBranch);
        
        string CreateMasterLanguageCacheKey(ContentReference contentLink);

        string CreateSegmentCacheKey(ContentReference parentLink, string urlSegment);

        string CreateVersionCacheKey(ContentReference contentLink);
        
        string CreateVersionCommonCacheKey(ContentReference contentLink);

        string ResolveCacheKey(string cacheKey, out int contentLinkID);
    }
}
```

### ⌨️ Example usage

Lets take a look at two examples on how you could implement this. 
*In this example i refer to the Episerver cache interface ISynchronizedObjectInstanceCache for brevity.
Of course, you can use your own HttpRuntime.Cache implementation and pass in the dependent cache keys in e.g. in [System.Web.Caching.CacheDependency.](https://docs.microsoft.com/en-us/dotnet/api/system.web.caching.cachedependency "System.Web.Caching.CacheDependency")*


```csharp
using EPiServer.Core;

public class CacheWithDependencies
{
    private readonly IContentCacheKeyCreator _contentCacheKeyCreator;
    private readonly ISynchronizedObjectInstanceCache _cache;

    public CacheWithDependencies(
        IContentCacheKeyCreator contentCacheKeyCreator,
        ISynchronizedObjectInstanceCache cache)
    {
        _contentCacheKeyCreator = contentCacheKeyCreator;
        _cache = cache;
    }

    public void CacheSomething(IContent contentDependency)
    {
        var awesomeObject = new { };
        string dependencyKey = "";

        // One of two most common usages
        // Creates the cache key used to cache a specific version of a content.
        dependencyKey = _contentCacheKeyCreator.CreateVersionCacheKey(contentDependency.ContentLink); 
        
        // Or if you like, creates the common cache key used to clear all cached versions for a given content item.
        dependencyKey = _contentCacheKeyCreator.CreateVersionCommonCacheKey(contentDependency.ContentLink); 

        var cacheEvectionPolicy = new CacheEvictionPolicy(
          TimeSpan.FromMinutes(30), 
          CacheTimeoutType.Absolute, 
          new[] { commonCacheKey });

        _cache.Insert("TheKeyToTheCity", awesomeObject, cacheEvectionPolicy);
        
        // Now, when the cached object "TheKeyToTheCity" will be invalidated when the content changes in Episerver, or in 30 minutes. 
    }
}
```

As you can see, it's very straight forward. So next time your're caching something don't forget to think about how it's should be invalidated. It might be easier than you originally thought.

✌️ Peace out
