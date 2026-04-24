---
title: "The misbehaving application pool"
slug: "the-misbehaving-application-pool"
publishedDate: "2018-08-21"
excerpt: "6 months into the project, our application pool in stage and production started to, what seemed like random, recycle the application pool. And we hadn't really changed any code that could cause it."
author: "Magnus Kallman"
tags: ["iis", "debugging"]
---

When our application pool started to recycle mulitple times per day, rendering our "Always on" setting outmaneuvered. To get some insights of the error, i went to the *Windows Event Viewer* and found a treoublesome description of memory heap corruption in w3wp.exe. 

### Windows Event Viewer log
```powershell
    Faulting application name: w3wp.exe, version: 10.0.14393.0, time stamp: 0x57899b8a
    Faulting module name: ntdll.dll, version: 10.0.14393.2214, time stamp: 0x5ac2f612
    Exception code: 0xc0000374
    Fault offset: 0x00000000000f8353
    Faulting process id: 0xf2c
    Faulting application start time: 0x01d4348880effaf8
    Faulting application path: c:\windows\system32\inetsrv\w3wp.exe
    Faulting module path: C:\Windows\SYSTEM32\ntdll.dll
    Report Id: b1a7c92a-a3d2-4924-a2b9-cfc15d588910
    Faulting package full name: 
    Faulting package-relative application ID:
```

<br>

## Looking for heap corruption on the internet

Looking for help how to fix heap corruption in w3wp.exe on the internet doesn't really give you any hits, since the underlying cause could be pretty much anything.

The most important step to take here, is to catch your application pool misbehaving. And that was easier than expected, because DebugDiag2 has a tool called *DebugDiag2 Collection*. 

You can read more in detail over [here](https://blogs.msdn.microsoft.com/parvez/2016/08/06/iis-application-pool-crash-and-debug-diag/ "iis app pool crash debug"), how to set that up.


### DebugDiag info

```powershell
    Thread 5 - System ID 4600
    
    Entry point   ntdll!TppWorkerThread 
    Create time   2018-08-15 14:12:56 
    Time spent in user mode   0 Days 00:00:22.828 
    Time spent in kernel mode   0 Days 00:00:02.281 
    
    Call Stack
    
    ntdll!RtlReportCriticalFailure+97 
    ntdll!RtlpHeapHandleError+12 
    ntdll!RtlpLogHeapFailure+96 
    ntdll!RtlFreeHeap+125 
    cachhttp!RESPONSE_ENTRY::~RESPONSE_ENTRY+e5 
    cachhttp!RESPONSE_ENTRY::DereferenceResponseEntry+20 
    cachhttp!OUTPUT_ENTRY::ClearIdentityResponseEntry+26 
    cachhttp!OUTPUT_ENTRY::`scalar deleting destructor'+e 
    cachhttp!OUTPUT_ENTRY::DereferenceOutputEntry+1a 
    cachhttp!CTypedHashTable<OUTPUT_CACHE,OUTPUT_ENTRY,OUTPUT_KEY * __ptr64,CLKRHashTable>::_AddRefRecord+1b 
    iisutil!CLKRLinearHashTable::_DeleteNode+42 
    iisutil!CLKRLinearHashTable::_DeleteIf+15b 
    iisutil!CLKRHashTable::DeleteIf+60 
    cachhttp!CTypedHashTable<OUTPUT_CACHE,OUTPUT_ENTRY,OUTPUT_KEY * __ptr64,CLKRHashTable>::DeleteIf+2f 
    cachhttp!CTypedHashTable<UL_RESPONSE_CACHE,UL_RESPONSE_CACHE_ENTRY,UL_RESPONSE_CACHE_KEY * __ptr64,CLKRHashTable>::_ExtractKey+f56 
    ntdll!RtlpTpTimerCallback+6d 
    ntdll!TppTimerpExecuteCallback+b9 
    ntdll!TppWorkerThread+48f 
    kernel32!BaseThreadInitThunk+14 
    ntdll!RtlUserThreadStart+21
```

Now the debug diag was kind of a bust, i was unable to get any dumps while running with PageHeap Flags, because it just made the site unresponsive. And even without outputcache disabled, the errors kept comming.
<br>

## A solution dawns
Combining a search for both the heap corruption error and the DebugDiag logs, [gave me a new set of results on Google.](https://blogs.msdn.microsoft.com/asiatech/2010/10/18/heap-corruption-in-httpcachemodule-while-you-try-to-remove-http-headers-in-your-custom-http-module/ "Heap corruption in HttpCacheModule")

We are removing our server headers in the http responses, to properly obfuscate what kind of server we are running on. But the "Server"-header was begin removed in the asp.net lifecycle event __PreSendRequestHeaders__. 

That was a terrible choice, that should have for example have been put in __PostReleaseRequestState__.

Copying that piece of code from a blog years ago really manifested in a couple of hours of pain and sweat. I guess one should be a bit careful before taking other peoples advice 😅.
