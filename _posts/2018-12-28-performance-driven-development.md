---
title: "Performance driven development"
slug: "performance-driven-development"
publishedDate: "2018-12-28"
excerpt: "In this blog post we will dive into the realm of web performance, mostly from a .NET server perspective. I will demonstrate a performance first oriented approach to web development."
author: "Magnus Kallman"
tags: ["performance", "caching"]
---

Back in 2015 when i first read [Why perceived performance matters](https://www.smashingmagazine.com/2015/09/why-performance-matters-the-perception-of-time/ "Why perceived performance matters, Part 1"), it really got me thinking about performance and how to do it well both when it comes to backend and frontend. This blog post is going to be focusing on the backend.

Performance matters, it's about retaining users, keeping them happy, optimizing conversion rates and KPIs. Furthermore, having a performance oriented site is a great way to stand out from your comptetitors.

## ⚡ A neglected part of UX
When people talk about UX today, they oftentimes implicitly mean design and how users should interact with said design. What is often overlooked is the performance of the website, and what strategy should be in place to ensure the users don't have to spend an eternity in limbo, waiting to interact with the content.

You could have most brilliantly designed web site, but if your pages load too slowly, your users will abandon their session before they even started using you site.

Over the past years, the use of performance tools in production environments have become increasingly popular, like New Relic, Application Insights or Stackify Retrace. But, analyzing the developer machine is often forgotten.

In order to get ahead of the situation, you should start by always running a profiling tool while developing. That means that you can make sure you're not even going to commit code that is underperforming.

## ⏲️ Measure performance with Stackify Prefix
My favorite tool to use for local development is Stackify Prefix, it's easy to use and unobtrusive.
It gives you a detailed report of how many external and database calls was made, and the time it took to render all parts of a page.

It's essential to profile your site to be able to get a full picture of what is happening, a load time between 0 and 100ms is percieved by the user as being instant.

My personal goal is that every page should have load time faster than 50ms on my local machine, in order to make sure that the user experice is still at a high level and leave some leeway for server load, latency and frontend processing.

#### Stackify Prefix for .NET Framework
Stackify is integrated with the .NET CLR and will integrate with your local IIS for monitoring. [You can download Prefix here.](https://stackify.com/prefix/ "Stackify Prefix download") 

1. Install Prefix
2. Enable via the Tray icon
3. Restart Visual Studio (sometimes I've had to restart the computer)
4. Browse http://127.0.0.1:2012 to view the traces

#### Stackify Prefix for .NET Core
To get started with Stackify prefix for .NET Core, running with IIS Express, you need to install the Nuget package called [StackifyMiddleware](https://www.nuget.org/packages/StackifyMiddleware/ "StackifyMiddleware") then add the following code to your *Startup.cs*

```csharp
using StackifyMiddleware;

public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    app.UseMiddleware<RequestTracerMiddleware>();
}
```
 Now that you're up and running. Making a few requests to the classic Episerver Alloy Demo site would look like this, indicating how long each request took and how many database calls was made.
 
 ![StackifyAlloyStartpage](/img/blog/inline-stackifyalloystartpage.png)

## 🔬 Taking a closer look
Now that you're ready to start profiling your code, you need to try to make sense of it all.
The best place to start is to make sure you pass the hygiene checklist:

1. No unhandled exceptions
2. No unnecessary non cached database calls
3. No unnecessary non cached external webservice calls

#### Splitting html rendering into parts
The next part is to optimize your html rendering, and a good place to start is to make sure your site has split the rendering of header, main content and footer into separate functions, preferably using the ChildAction-attribute in a controller for your header and footer.

Child actions are easily traceable with Stackify prefix and will appear as named function calls by the name of the child action, so you can see exactly how long it takes to perform each call.

The header and footer is probably easy to cache, since they are often identitical on the whole website, perhaps apart from a current page indication in navigation menus. This means they can be cached at the most with a varying cache key based on page url and if the user is authenticated or not.
Not caching html that is shared by multiple pages is a waste of CPU and will in the long run cause your site to be able to handle fewer simultaneous users.

Sometimes you might not need to cache the rendered html, just the logic to build the view models.
If you do need to cache the rendered html, there are a couple of good patterns to take a look at called "Donut cache" and "Russian doll cache", that can really help you structure your html cache and manage dependency keys.

### Now what?
When your're done optimizing the server response times, why stop there? Go further and cache your responses in a CDN to really ensure your site performs as good as possible to all users.
Back in october, i blogged about caching 100% of the request in a CDN, [Caching on the edge of town.](https://www.magnuskallman.se/blog/caching-on-the-edge-of-town "Caching on the edge of town")

## 🌡️ Don't punish your users by servering cold content
When your'e done developing a new feature, and your commited code is being churned through your CI-pipeline. You should make sure that your deployments where setup with a zero downtime philosophy. There are many ways to do this, perhaps the most common is "blue green deployment", but that is a separate topic.

A part that is often overlooked or bypassed by using scripts to warm up the site can easily be streamlined by utilizing the web.config applicationInitialization element.

I usually point this config to a Controller, where i traverse the most important, if not all pages on the site, and make web requests with HttpClient, i can make sure all database queries, caching and output caching is warmed up before my users reach the new version of the site.

## 🤔 Where to focus?
Do you not know which pages are in most need of optimization in an existing project? Try to make a list of the most requested pages e.g. using Google Analytics or a similar tool that you're probably already using.

## 💡 Let's not forget the frontend
This blog post focused on the server side of performance, but chances are that there is even more work to be done on the frontend of your application. It probably has the biggest impact on the user experience for your site.

With new frameworks and tools, it's very easy to get started and adding libraries to help you achieve a certain functionality, it might seem like all you need is to run a *npm command* to solve all your problems. 
Add to that, e.g. google tag manager, where there might be a multitude of scripts injected into the site, without the knowledge of the original developer.

What many people forget is that every added byte to the website will affect the user negatively, depending on device processing power and network speed, they might be neglibable, but oftentimes they aren't.

This means that every added byte should be more or less added with a reason, and a thought as to how it will affect the users. There is a budget to HTTP requests, that should be carefully taken into consideration when trying serve your users with a great experience.

But this is something we will have to dig deeper into in a later blogpost.

✌️
Peace out
