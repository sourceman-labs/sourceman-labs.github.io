---
title: "HttpClient and compression in dotnet"
slug: "httpclient-and-compression-in-dotnet"
publishedDate: "2023-04-23"
excerpt: "At the time of writing, we've come a long way in dotnet. Currently on version 7. Configuring and using of the important HttpClient has been much improved ove..."
author: "Magnus Kallman"
tags: ["dotnet", "performance"]
---

At the time of writing, we've come a long way in dotnet. Currently on version 7. Configuring and using of the important `HttpClient` has been much improved over the years, fixing a lot of easy pitfalls (like using with dispose).

One thing that i've seen usually happening though, is forgetting to configure `AutomaticDecompression` on the HttpClient. Failing to apply this configuration will leave you with the default (none), meaning that the HttpClient will not send the http header `Accept-Encoding: gzip, defalate, br` to the called endpoint.
That means the receiving server won't know that you can handle compression, and will return with the response uncompressed.

Fret not! thee's an easy fix for this. Whenever you're registering your HttpClient with the IoC container, Microsoft exposes an extension method that allows to specify which decompression methods to use, `None, Gzip, Deflate, Brotli, All`. 
Here's how to set it up when registering a typed HttpClient in your `IServiceCollection`

```csharp
services.
  .AddHttpClient<ITypedClient, TypeClient>()
  .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
  {
    AutomaticDecompression = DecompressionMethods.All
  });
```

Now, depending on the endpoint, this will have varying effect, ofcourse. But in general, and in large scale, it can have great performance impact even with json responses.

🖖
