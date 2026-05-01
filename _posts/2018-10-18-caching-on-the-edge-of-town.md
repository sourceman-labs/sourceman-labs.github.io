---
title: "Caching on the edge of town"
slug: "caching-on-the-edge-of-town"
publishedDate: "2018-10-18"
excerpt: "What does all major digital services like Spotify, Netflix and YouTube have in common? They all utilize Content Delivery Networks to be able to serve content to the user in a matter of milliseconds. By doing so they have helped to push the industry forward and making these services generally avai..."
author: "Magnus Kallman"
tags: ["performance", "caching"]
---

## ⚡ Speed matters
It is no secret that page load time is critical to the user experience. Since began playing online games 20 years ago, latency has been a concern of mine. While I don't play online games that often anymore, latency continuously mocks our connected society.
As a matter of fact, it might even be critical as to how your users will decide if they like your site or your competitors site the best.

This blog post is going to address the gains and possibilities of using a CDN to make your page become as fast as possible. Not even taking into account all the other good stuff you can get from a CDN like DDoS-protection, and better compression.

When we have reached a state of a well performing web application, we just don't simply have to surrender to latency, and hope that most of our users will be close to where we physically host our server and being connected to a fast fiber connection, spoiler alert: they probably won't.

To get ahead of this situation, we take refuge in a CDN (Content Delivery Network). There is a plethora of companies that offer this service today, and you're going to have to choose which one is right for you.

The companies that deliver CDN services have made great effort to give us the possibility to cache whatever content we like, not just images, styles and scripts, at a very affordable price. There's not really any reason at all today, not to use a CDN for some of your traffic. But to truly excel, you should use it for as much content as you can.

## 🖥️ Where to start
Using a CDN should not in any way be intended to fix your poor performing code by adding an extra layer of cache. Used correctly it's a way to offload your server from unnecessary traffic, without the need to buy new hardware or upgrade your cloud stack, while being able to serve content very quickly to users no matter where they are in the world.

There are of course various scenarios to consider, that determines the complexity of your caching strategy. At the very least you want to wrap your site in a CDN to handle requests to static resources, there is no need for any server to handle all that excess load.

### Caching static content
Your CDN-provider will be handling this using a reverse proxy and the CDN will be responsible for serving those requests to your user without the need of a round-trip to your server.
Typically, the first request will populate the cache, and subsequent ones can now get the response directly from your CDN.

### Caching dynamic content
#### Same content for all users
The most basic scenario here, the one that probably most of the web exists of. Somewhat static html, content that is displayed the same for all users.
Sometimes this html will be updated, be it because newly developed functionality or an editor of sorts have rewritten the content. 
Cache html like this in your CDN, and subscribe to content change events to know when to make an API-call to your CDN to invalidate the cache.

#### Content varying by authentication
Let's say you want to serve two versions of a page, one for authenticated users, and another for everyone else. Now it started to get slightly complicated, because you need to figure out a way to validate user authentication at the edge in your CDN PoP (Point of Presence). Luckily over the last years, CDN providers have started to implement JWT-token validation at the very edge of the CDN, so you can configure them to validate the user. This means that can get away with caching only 2 versions of the same page in your CDN and still let your users get the content as fast as possible, without the need need for a roundtrip to the server to figure out which version you're going to get. [Here's a great read by Fastly, how it works.](https://www.fastly.com/blog/patterns-for-authentication-at-the-edge "Patterns for authentication at the edge")

#### Personalized content
Personalization on the web is something that is very popular to talk about these days. How does it fit into a modern edge cached architecture? 
1. Some of the first questions to ask yourself should probably be __"What does our users gain from this personilzation?"__, __"Can we do it without affecting performance, and if not, will the reduced performance result in a negative user experience?"__.
2. Perhaps one of the best solutions is to not serve above the fold personalized content, it will probably have large impact on performance with little gain for the user. Then if you must, load personalization async without the user taking notice.
3. A usual scenario of simple personalization is to display the name of the current logged in user, personally I would avoid to display that without any user interaction, which means you can handle it async. If that is not a satisfiable solution for you, perhaps you can read it from your JWT-token. And if that's not possible, go back to step 1. and ask yourself those questions again.
4. From an e-commerce perspective you might want to display personalized product suggestions that is based on a segmentation of customer behavior, since this content is shared by customers within a certain segment, you should be able to go ahead and cache it, resulting in a cached item per segment, and again, load the personalized content below the fold async.

## 💡 Take this blog as an example
Static html websites are a hot topic now, and when I built this blog I considered making use of a static site generator to build the content I fetch from Contentful. 
However, I saw no reason to use static html as the OutputCache would give me reliable performance with little coding effort. Surely an enterprise solution would be to persist the data somewhere between the content API and the webserver, but static html seemed unnecessary for my use case.

#### The setup
- Asp.net core (hosted in 1 data-center, no geo-redundancy)
- External api call to fetch content (from Contentful)
- OutputCache
- CDN, cache all requests (Cloudflare)

#### Latency
Given requests are output cached on the server, [Application Insights](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-overview "What is Application Insights?") tells me a request to one of my pages can be fully handled, served from the cache on average of 0.2ms, which means that the rest of the 60-100ms of average page load is just latency from the Azure West Europe Data Center to Sweden.

Using the Cloudflare CDN knocks it down to 20-40ms on average, from here. And the big upside is of course that users around the world gets a chance to get very low latency because of the CDNs inherent geo-redundancy.

Let's say you don't care about the geo-redundancy because all your users are domestic. Using a cloud service like Azure, AWS or Google Cloud would of course present chance at good workflow and cloud architecture, but if your market does not host a data center you will punish your users if you don't wrap a CDN around your site.

#### Keeping up to date with the content
When content is updated I recieve a webhook call to the server, so I can invalidate the output cache and the CDN cache, to make sure my users get the latest content.

When I deploy a new version, I utilize asp.net [applicationInitialization](https://docs.microsoft.com/en-us/iis/configuration/system.webserver/applicationinitialization/ "applicationinitialization") to warm up the site and setup the outputcache, then invalidate all the cache in the cdn to make sure my users get the lastest content.
