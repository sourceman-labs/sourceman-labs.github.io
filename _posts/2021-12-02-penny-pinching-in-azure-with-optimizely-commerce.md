---
title: "Penny pinching in Azure with Optimizely Commerce"
slug: "penny-pinching-in-azure-with-optimizely-commerce"
publishedDate: "2021-12-02"
excerpt: "Little did we know that the Dynamic Data Store was used when programatically deleting content from Optimizely Commerce."
author: "Magnus Kallman"
tags: ["azure", "optimizely"]
---

We recently moved from DXP (Episerver/Optimizelys cloud hosting solution) to our own Azure subscription. And with that followed a need to lower the cost of the databases.
We had a big issue with our CMS database getting daily spikes in ~90-100% CPU usage so we couldn't just straight up decrease the scale of the databases.

We are running and event driven product flow with real time updates of the product catalog, using the batch api in the Commerce SDK. 
Whenever we are receiving entities that have reached an invalid state we remove them with a call to `IContentRepository.Delete(...)`.

After doing some digging, with the help of Optimizely Support to localize the source of our most expensive SQL queries, we could isolate it to the part of the product import that deletes invalid entities.

After some decompilation we could see that Optimizely is always calling the Dynamic Data Store whenever `IContentRepository.Delete(...)` is called 😱. From what i gather this is done to enable to feature of restoring deleted content from the trash bin, however since our product import is fully automated we are not at all interested in that feature for commerce content.

This resulted in a custom implementation of `DefaultParentRestoreRepository` to be able to bypass the Dynamic Data Store for commerce entity deletes. 
By doing this we could reduce the scale of the Azure SQL Elastic Pool by 8 vCores saving about a whopping 18k USD on annual basis.

```csharp
public class CustomCommerceParentRestoreRepository : DefaultParentRestoreRepository, IParentRestoreRepository
{
	public override ContentReference DeleteParentLink(ContentReference sourceLink)
	{
        // Keep default functionality for cms content
		if (sourceLink?.ProviderName != ReferenceConverter.CatalogProviderKey)
		{
			return base.DeleteParentLink(sourceLink);
		}

		// Bypass DDS feature for commerce content
		return ContentReference.EmptyReference;
	}
}
```

\* *Episerver is now Optimizely, since Episerver purchased Optimizely and switched name earlier this year*
