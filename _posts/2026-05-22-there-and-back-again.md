---
title: "There and back again... a developer's tale"
slug: "there-and-back-again"
publishedDate: "2026-05-22"
excerpt: "A tale of exploring different programming languages and coming back to dotnet."
author: "Magnus Källman"
tags: ["dotnet", "rust", "go"]
---
It's been a long time since I wrote a blog post (the radio silence correlates strongly with the age of my children). It's time to get back into it, and dust off the dozen half-baked posts that are still relevant.

I came in contact with programming my first time in the 90s, spending time with Klik & Play and simple HTML. I wrote my first real program in 2004 when I studied Java in school.
I started working as a professional developer within the dotnet space in 2012 and ended up using C# as my daily driver, with HTML, CSS and SQL chugging along.
For a very long time I was content, Microsoft kept developing C# and dotnet in a good direction and with the dotnet core project and later dotnet 5 releases, language and performance improvements _really_ have been great.

However, having traversed through the whole stack of C# I didn’t really feel quite so satisfied. Learning a new language had felt like such a huge undertaking because I was framing it as needing to reach the same depth I'd built up in C#, which was completely the wrong way to think about it.

## Go
So I decided to learn Go. It felt like an obvious choice, being a comparatively simple language to get started with. It has few keywords and was built to be fast to compile and simplify software creation at Google. With the major difference to C# that Go is procedural and not object oriented. After having read the docs on [go.dev](https://go.dev) I turned to [learn go with tests](https://quii.gitbook.io/learn-go-with-tests) for some more practical examples. Then moving on to building some simple json based web services and web apps using TEMPL and HTMX.

It turns out that learning Go put the finger on a few annoyances I have with C# and the plumbing you need to do to create a simple http based API. Albeit it has become a lot simpler with minimal hosting and minimal APIs since dotnet version 6.

- The standard library is good, very feature rich and mature
- Great performance even though it's garbage collected
- Simplicity albeit at the cost of verbosity
- Errors as values is great, sadly the go community has been unable to extend this via something like Rust style error propagation.
- Highly idiomatic language and community
- Automatic formatting and testing built is great

What turned me away from go was really it being a bit too cumbersome and verbose to write trivial things. I started to really miss LINQ and the functional concepts that have been added to C# over the years. And writing print statements without string interpolation is not something I enjoy.

## Rust to the hyped up Rescue
So I turned to Rust. A language I had been reluctant to try for a while, strictly because of the hype around the language.
Little did  I know, that learning Rust, at first via the [Rust Book](https://doc.rust-lang.org/book/) was a blast, following along in all the samples and doing old advent of code challenges was the most fun I had coding in a very long time.
It’s nice to see a language that has attempted to both be attractive for low level code, while offering the higher order abstractions to make it viable for other programs too. Here are some of the findings that come to mind when talking about Rust.

- Ecosystem, with cargo and a very small standard library is both a blessing and a curse.
- Zero cost abstraction philosophy is a pretty great
- Functional heavy hybrid language
- Type system, and algebraic data types 
- Exhaustive pattern matching
- Higher level programming syntax, with lower level performance.
- Compilation error feedback is world class
- Cargo dependencies, Albeit often not as transitively deep as npm, (phew)
- Compile times aren't great

While memory safety is often the first thing people mention with Rust. It’s the type system and zero cost abstractions that I really like. 
Furthermore, memory safety surely is important, it appears most people overstate and even conflate the memory safety and type safety in Rust, and somehow seem to think Rust is impervious to bugs, and if you are using `unsafe` in Rust, you are on thin ice.
As a side note this is a great episode on memory safety [How Fil-C Works - Wookash Podcast](https://www.youtube.com/watch?v=6Maoe-GMynM).

The macro system is rightfully criticized for almost its own language and authoring macros are hard. Using macros is often a delight, and in comparison of source generators in C# being attribute bound, feels so restrictive and is such a bummer.
And while the RAII pattern of rust memory is a strong pattern to enforce memory safety, it’s by no means the most optimal way to enforce memory safety in all programs, and certain programs can gain a lot better performance from other memory allocation strategies.

My guess _or_ hope regarding cargo is that it would not have been implemented the way it is, if Rust was created in 2026 and any future programming language should take measures to prevent the supply chain attacks of 2025 or even the left-pad incident of npm to be an issue we have live with every day as developers or users of software. Perhaps now since Rust is steadily gaining popularity beyond hobby projects, and more and more companies do run Rust in production, I would not be surprised if we start seeing supply chain attacks in the Cargo ecosystem too.

## Circling back to dotnet

Even though I’ve written many thousand lines of JavaScript, over the years, it was weird how at first when stepping out of C# after all these years, to not think about all code scoped in classes, but to turn to thinking about code by modules. That framing, now makes it weird to think about C#, that everything in C# is wrapped in a class and how you are inclined to model inherently procedural flows in an object oriented way.

It's painfully obvious that C# lacks an idiomatic formatter — one that runs fast as a CLI tool and integrates with every IDE. Thankfully there is the community project called [Csharpier](https://csharpier.com/) that does this, and you should really check it out if you are programming in C#.

Microsoft keeps investing in performance and language features, and the trajectory has been good for years now. The developer tooling is in a class of its own, largely thanks to [Roslyn](https://github.com/dotnet/roslyn) exposing the compiler as a queryable platform that IDEs, analyzers, and refactoring tools can build on.
One thing that surprised me coming back from other ecosystems: how many developers debug primarily with print statements. In dotnet, debugging with Rider or Visual Studio is genuinely fast and pleasant — edit-and-continue, moving the instruction pointer mid-execution, and inspecting or mutating state through the debugger REPL all just work. Once you've internalized that workflow, going back to println feels like coding with one hand tied behind your back.

### No programming language is perfect
It boils down to personal preference and the underlying goal and which reason each programming language was created and the problems they attempted to solve.
- I used to accept exceptions in dotnet and make the best of it. Now, I really dislike the Exceptions as control flow that is riddled across the ecosystem.
- The plumbing you have to perform, because of the object oriented nature in C#, is more than annoying. The quote by Joe Armstrong “you ask for a banana, get the gorilla holding the banana and the whole jungle” strikes very true. 
- C# tries to manage object coupling via dependency injection. Since dotnet core this is built in, and while it does the job, it makes over-engineering easier.We've swung from one extreme to the other: in the .NET Framework days, codebases were often too tightly coupled and you had to pull in third-party containers to wire things up. Now that DI is built in, everyone reaches for an interface with a single implementation.
- Over-engineering is a practice the dotnet community has refined — see onion architecture and "clean architecture." Many developers reach for abstractions before writing a line of logic. That's hardly the language's intent, but it's a side effect the community has codified as best practice.
- It's clear when using LLM coding agents with little to no custom instructions with C#. They are trained on what the community has passed off as best practices, giving you premature abstraction, often many levels of (unnecessary) indirection as the default solution to any problem.

The platform is in a much better place now. But some of the friction is structural — built into an object-oriented foundation, then amplified by what the community has codified on top of it.
To paraphrase Casey Muratori: _ending up with something that looks like an object is fine — it's designing for it that's the issue._ That distinction has stuck with me. Most applications I've worked on have substantial parts that aren't objects by nature: I/O at the edges, data being massaged in the middle, a pipeline of transformations. C# entices you to model your whole application as objects via its inherent object oriented design.
The result is predictable. You invent abstractions to make procedural code feel object oriented, then more abstractions to manage the first ones, and before long the codebase is a semantic soup of `Service`s, `Manager`s, `Handler`s and `Provider`s — exactly the failure mode Jeff Atwood named in [I Shall Call It... SomethingManager](https://blog.codinghorror.com/i-shall-call-it-somethingmanager/) almost twenty years ago. We haven't really moved on from it.
Learning Go and Rust didn't make me want to leave C# yet. It made me notice the shape of the code I was writing — and where the language pushes us to add ceremony that doesn't earn its keep. Question the defaults.
