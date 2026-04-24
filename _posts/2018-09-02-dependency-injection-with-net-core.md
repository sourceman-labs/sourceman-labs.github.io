---
title: "Dependency injection with .NET Core"
slug: "dependency-injection-with-net-core"
publishedDate: "2018-09-02"
excerpt: "While i salute Microsoft for making it easier to get started with dependency injection in dotnet core, there is a rather big elephant in the room that quite quickly can transform into a code smelling elephant."
author: "Magnus Kallman"
tags: ["dotnet", "dependency-injection"]
---

Now that my favorite IoC library has been sunsetted, i decided to have a look at Jeremy D. Miller's successor to StructureMap in dotnet core, [Lamar](https://jasperfx.github.io/lamar/ "Lamar").

Every project needs conventions, and Lamar brings the best tools from StructureMap in a more intuitive way for dotnet core than StructureMap could manage.

Using these tools are very important to help keeping your IoC container sane, and unbloated. Part of the problem with the standard dotnet core IoC is that it requires you to explicitly add your implementations to the service container, while this works in a "Hello world"-setting, it's not really practical in the real world. Setup all your IoC definition with a few lines of code instead of hundreds, when you're running a real world project.

Let's say you have just implemented the repository pattern in your project, you probably settled for something like this:

```csharp
public interface IUserRepository { }
public class UserRepository : IUserRepository { }

public interface IOrderRepository { }
public class OrderRepository : IOrderRepository { }

// And you end up register your classes something like this
public IServiceProvider ConfigureServices(IServiceCollection services)
{
    services.AddTransient<IUserRepository, UserRepository>();
    services.AddTransient<IOrderRepository, OrderRepository>();
}
```

There is a clear convention to the repository classes you created, just as it should be. But registering your implementations manually when there is a clear convention is just going to bloat your application, as well as being error-prone, and make it harder for new developers start working in your project. Furthermore, if you continue expand your application like this, your IoC registration is amongst other things, really hard to read.

Let's take a look how we can fix this.

## Getting started with Lamar in ASP .NET Core
Good news everyone, It's very easy to setup Lamar, and if your'e used to StructureMap you will recognize the API that Lamar leverages.

Register your conventions and get started immediatly with dependency injection.

You'll need the following two nuget packages to get started with Lamar in ASP .NET Core.
<br>
__Lamar__ 
<br>
__Lamar.Microsoft.DependencyInjection__

## Program.cs
Getting started with Lamar, is really easy just add .UseLamar() to your WebHostBuilder to replace the built in service container in ASP .Net Core.
```csharp
using Lamar.Microsoft.DependencyInjection;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

public class Program
{
    public static void Main(string[] args)
    {
        CreateWebHostBuilder(args).Build().Run();
    }

    public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            // Register the Lamar service container
            .UseLamar()
            // Your normal webhost config
            .UseKestrel(c => c.AddServerHeader = false)
            .UseIISIntegration()
            .UseStartup<Startup>()
            .CaptureStartupErrors(true);
}
```

<br>

## Startup.cs
Now you get to option to futher configure your container with the method ConfigureContainer. Here we can add pretty much all the good stuff from StructureMap, like assembly scanning, registries and decorations.

```csharp
using Lamar;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Warren.Web.Application;

public class Startup
{
    public void ConfigureContainer(ServiceRegistry services)
    {
        // Add your ASP.Net Core services as usual
        services.AddMvc();
        services.AddLogging();

        // Also exposes Lamar specific registrations
        // and functionality
        services.Scan(scanner =>
        {
            // Here you can add various assembly scans
            // to ensure Lamar finds all your classes
            // and registers your project conventions.
            scanner.TheCallingAssembly();
            scanner.WithDefaultConventions();
            scanner.SingleImplementationsOfInterface();
            
            // Add all implementations of an interface
            scanner.AddAllTypesOf(typeof(ICommandHandler<>));
        });
        
        // You can create your own registries like with StructurMap
        // and use expressions to configure types
        services.For<IAbstraction>().Use(new ConcreteImplementation());
        
        // Power up your architechture with the decorator pattern
        services
            .For(typeof(ICommandHandler<>))
            .DecorateAllWith(typeof(ValidationCommandHandlerDecorator));
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        app.Run(async (context) =>
        {
            await context.Response.WriteAsync("Hello World!");
        });
    }
}
```

<br>

## Rounding up
As expected, there is a very powerful API to utilize Lamar to it's fullest potential. One of my favorite features is the ability to decorate implementations, and it works really well with a Command–query separation style architecture.

There are plenty of IoC containers around, and i strongly suggest you atleast use an IoC container that provides assembly scanning for single implementations (but why stop there eh?).

Lamar also offers dynamic code weaving that looks really interesting, a powerful way to get into aspect oriented programming. But that's a blog post for another time.
