---
title: "Testable separation of concerns in a Episerver IInitializableModule"
slug: "testable-separation-of-concerns-in-a-episerver-iinitializablemodule"
publishedDate: "2018-10-09"
excerpt: "Have you forgotten to test your Episerver IInitializableModule? Have you separated your concerns and moved the actual logic from the event handlers in your IInitializableModule? Lets have a look how to do all of this with MediatR and xUnit."
author: "Magnus Kallman"
tags: ["episerver", "unit-testing"]
---

I've been getting into Jimmy Bogard's MediatR library, and a while back i found this [blog post](http://marisks.net/2017/02/12/better-event-handling-in-episerver/ "better-event-handling-in-episerver") about using MediatR to handle events in Episerver.

MediatR does force you into the realm of async/await, and if you don't tread carefully you could end up in a world of trouble.

Since you aren't allowed to use async event handlers here, you have to have an implemention of the AsyncUtility from [this stackoverflow answer.](https://stackoverflow.com/questions/9343594/how-to-call-asynchronous-method-from-synchronous-method-in-c/25097498#25097498 "Synchronous Asynchronous code"). 

However, implementing it straight off the bat will make it virtually impossible to verify in a unit test. Lets have a look at how we can do all of this in a testable manner.
<br>

## 📑 The code
Lets dig into the code, there is alot going on here, and I will try to go through it step by step.
<br>
### Registering with StructureMap
Scan your assemblies to find all your request and notification handlers, and setup your IMediator and ServiceFactory.
```csharp
using MediatR;
using StructureMap;

public class WebRegistry : Registry
{
      public WebBootstrapper()
      {
            Scan(scanner => 
            {
                scanner.TheCallingAssembly();
                scanner.WithDefaultConventions();
                scanner.AssemblyContainingType<IMediator>();
                scanner.ConnectImplementationsToTypesClosing(typeof(IRequestHandler<,>));
                scanner.ConnectImplementationsToTypesClosing(typeof(INotificationHandler<>));
            });

            For<IMediator>().Use<Mediator>();
            For<ServiceFactory>().Use<ServiceFactory>(ctx => ctx.GetInstance);
      }
}
```

### PublishedContentEvent
Example implementation of MediatR INotification. You probably want to at least pass along the data from the Episerver ContentEventArgs in this case.
```csharp
using EPiServer.Core;
using MediatR;

public class PublishedContentEvent : INotification
{
	public PublishedContentEvent(ContentReference contentLink, IContent content)
	{
		ContentLink = contentLink;
		Content = content;
	}

	public ContentReference ContentLink { get; set; }

	public IContent Content { get; set; }
}
```

### NotificationsHandler
This is an example implementation of a MediatR INotificationHandler. Do what ever you need here, and use a new implementation for each type of task you have to do, to keep your concerns separated.
```csharp
using MediatR;
using System.Threading;
using System.Threading.Tasks;

public class DoStuffOnPublishedContent : INotificationHandler<PublishedContentEvent>
{
	public async Task Handle(PublishedContentEvent notification, CancellationToken cancellationToken)
	{
		// Do some awesome stuff
	}
}
```

### TaskRunner
This is where the [stackoverflow answer](https://stackoverflow.com/questions/9343594/how-to-call-asynchronous-method-from-synchronous-method-in-c/25097498#25097498 "Synchronous Asynchronous code") comes into play. But instead of using a static class, we make a mockable/injectable version.
I have chosen to make this into an Expression instead of just running with Func&lt;Task&gt;, this is a critical change to make this more easily testable. 

The reason for this, is that Func&lt;T&gt; is really just a [MulticastDelegate](https://docs.microsoft.com/en-us/dotnet/api/system.multicastdelegate?view=netframework-4.7.2 "MulticastDelegate") and is inherently very hard to check for parameter/delegate equality in a unit test, turning it into an Expression gives us the ability to compile the delegate and comapre the body arguments.
```csharp
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

public interface ITaskRunner
{
    void RunExpressionSync(Expression<Func<Task>> funcExpression);
}

public class TaskRunner : ITaskRunner
{
    private static readonly TaskFactory _myTaskFactory = new TaskFactory(
        CancellationToken.None,
        TaskCreationOptions.None,
        TaskContinuationOptions.None,
        TaskScheduler.Default);

    public void RunExpressionSync(Expression<Func<Task>> funcExpression)
    {
        Func<Task> func = funcExpression.Compile();

        _myTaskFactory
			.StartNew(func)
			.Unwrap()
			.GetAwaiter()
			.GetResult();
    }
}
```

### EPiServerEventsInitializer
This is an Episerver IInitializableModule, and it's the designated class to handle the subscriptions of our Episerver content events.
```csharp
using EPiServer;
using EPiServer.Core;
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using MediatR;
using System;
using System.Threading.Tasks;
	
// WebInitializer is a class of this project that registers our main EPiServer.ServiceLocation.IConfigurableModule
// that registers our StructureMap registries and webapi config etc.
[ModuleDependency(typeof(WebInitializer))]
public class EventsInitializer : IInitializableModule
{
	private static bool _hasInitialized;

	public void Initialize(InitializationEngine context)
	{
		if (_hasInitialized)
		{
			return;
		}

		if (_contentEvents == null)
		{
			_contentEvents = ServiceLocator.Current.GetInstance<IContentEvents>();
		}
		
		_contentEvents.PublishedContent += ContentEvents_PublishedContent;

		_hasInitialized = true;
	}

	public void Uninitialize(InitializationEngine context)
	{
		if (_contentEvents == null)
		{
			_contentEvents = ServiceLocator.Current.GetInstance<IContentEvents>();
		}

		_contentEvents.PublishedContent -= ContentEvents_PublishedContent;
	}

	private void ContentEvents_PublishedContent(object sender, ContentEventArgs e)
	{
        IMediator mediator = ServiceLocator.Current.GetInstance<IMediator>();
        var mediatorEvent = new PublishedContentEvent(e.ContentLink, e.Content);
        var taskRunner = ServiceLocator.Current.GetInstance<ITaskRunner>();
		taskRunner.RunExpressionSync(() => mediator.Publish(mediatorEvent));
	}
}
```
<br>

## ⚗️ Don't forget to test your code
Now that we have written clean cut separation of concerns event handling in Episerver, we are not yet done. Since we all want to sleep well at night, we have to write some tests to verify our code works.

Unit testing your Episerver InitializableModule is alot easier than you might think, here i will demonstrate how to do it with the Moq library. 
The harder part comes into play when we want to verify our invocation on the mediator publish method, when it's a delegate wrapped in the RunExpressionSync method, fortunately with this solution we are able to verify that the mediator invocation gets passed the expected parameters.

Without further ado, here a way to test the InitializableModule, i guess you can figure out how to test your NotificationsHandler by yourself 🙂

```csharp
using EPiServer;
using EPiServer.Core;
using EPiServer.Events.Clients;
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using MediatR;
using Moq;
using System;
using System.Linq;
using System.Threading;
using Xunit;
using static TestUtility;
	
// Use a constant for this collection name, xUnit tests run in parallel which can cause tests
// that is using Episervers ServiceLocator to behave in the wrong way
[Collection("ServiceLocator dependent")]
public class EpiserverEventsInitializerTests : IDisposable
{
	private readonly Mock<IMediator> _mediatorMock;
	private readonly Mock<IContentEvents> _contentEventsMock;
	private readonly Mock<ITaskRunner> _taskRunnerMock;

	public EpiserverEventsInitializerTests()
	{
		_mediatorMock = new Mock<IMediator>();
		_contentEventsMock = new Mock<IContentEvents>();
		_taskRunnerMock = new Mock<ITaskRunner>();

		SuspendServiceLocator();
    
		MockService(_mediatorMock);
		MockService(_contentEventsMock);
		MockService(_taskRunnerMock);
	}

	public void Dispose()
	{
		ResumeServiceLocator();
	}

	// While we are at it, why not just make sure this type is correct
	[Fact]
	public void Should_be_initializable_module()
	{
		Assert.True(typeof(IInitializableModule).IsAssignableFrom(typeof(EventsInitializer)));
	}

	// ... and lets make sure our dependent module is wired up correctly
	[Fact]
	public void Should_have_correct_module_dependency()
	{
		var attribute = typeof(EventsInitializer)
			.GetCustomAttributes(typeof(ModuleDependencyAttribute), true)
			.GetValue(0) as ModuleDependencyAttribute;
		
		var dependency = attribute.Dependencies.FirstOrDefault();

		Assert.Equal(typeof(WebInitializer), dependency);
	}

	[Fact]
	public void Should_properly_handle_published_events()
	{
		var initializer = new EPiServerEventsInitializer();
		
		// Should publish mediator notifications when PublishedContent fires
		initializer.Initialize(new Mock<InitializationEngine>().Object);
		var contentMock = new Mock<IContent>();
		contentMock
			.SetupGet(content => content.ContentLink)
			.Returns(new ContentReference(1815));
			
		_contentEventsMock.Raise(contentEvents => 
			contentEvents.PublishedContent += null, 
			new ContentEventArgs(contentMock.Object.ContentLink, contentMock.Object));

		var expectedEvent = new PublishedContentEvent(contentMock.Object.ContentLink, contentMock.Object);

		_taskRunnerMock.Verify(runner => runner.RunExpressionSync(
			It.Is<Expression<Func<Task>>>(expression => MatchExpression(expression, expectedEvent))),
			Times.Once);

		// Should unbind the eventhandler when Uninitialize is called
		initializer.Uninitialize(new Mock<InitializationEngine>().Object);
		var contentMock2 = new Mock<IContent>();
		contentMock
			.SetupGet(content => content.ContentLink)
			.Returns(new ContentReference(1709));
			
		_contentEventsMock.Raise(contentEvents => 
			contentEvents.PublishedContent += null, 
			new ContentEventArgs(contentMock2.Object.ContentLink, contentMock2.Object));
		var unexpectedEvent = new PublishedContentEvent(contentMock2.Object.ContentLink, contentMock2.Object);

		_taskRunnerMock.Verify(runner => runner.RunExpressionSync(
			It.Is<Expression<Func<Task>>>(expression => MatchExpression(expression, unexpectedEvent))),
			Times.Never);
	}
  
	// Compare objects with whatever logic you want,
	// this example is with KellermanSoftware.CompareNetObjects.CompareLogic
	private bool MatchExpression(Expression<Func<Task>> calledExpression, PublishedContentEvent mediatorEvent)
	{
		var argument1 = GetMethodArgumentValue<PublishedContentEvent>((MethodCallExpression)calledExpression.Body, 0);
		var argument2 = GetMethodArgumentValue<CancellationToken>((MethodCallExpression)calledExpression.Body, 1);

		var compareLogic = new KellermanSoftware.CompareNetObjects.CompareLogic();

		var argument1Comparison = compareLogic.Compare(argument1, mediatorEvent);
		var argument2Comparison = compareLogic.Compare(argument2, default(CancellationToken));

		return argument1Comparison.AreEqual && argument2Comparison.AreEqual;
	}

	// Example of method to peek into expression for argument value
	private TValue GetMethodArgumentValue<TValue>(MethodCallExpression methodCallExpression, int index)
	{
		LambdaExpression lambda = Expression.Lambda(methodCallExpression.Arguments[index]);
		var compiledLambda = lambda.Compile();
		var value = compiledLambda.DynamicInvoke();

		if (value == null)
		{
			return default(TValue);
		}

		return (TValue)value;
	}
}

// Utilities for unit testing with ServiceLocator
internal static class TestUtility 
{
	private static IServiceLocator _defaultServiceLocator;
	private static Mock<IServiceLocator> _serviceLocatorMock;
	
	public static void SuspendServiceLocator()
	{
		_defaultServiceLocator = ServiceLocator.Current;
		_serviceLocatorMock = new Mock<IServiceLocator>();
		ServiceLocator.SetLocator(_serviceLocatorMock.Object);
	}
	
	public static void ResumeServiceLocator()
	{
		ServiceLocator.SetLocator(_defaultServiceLocator);
	}
	
    public static void MockService<T>(Mock<T> mock) where T : class
	{
		MockService(mock.Object);
	}
  
	public static void MockService<T>(T instance)
	{
		_serviceLocatorMock.Setup(locator => locator.GetInstance<T>()).Returns(instance);
		_serviceLocatorMock.Setup(locator => locator.GetInstance(typeof(T))).Returns(instance);
		ServiceLocator.SetLocator(_serviceLocatorMock.Object);
	}
}
```

## Conclusion
We have written tests for our IInitializableModule, so that we can sleep well at night, refactor and deploy our code without the burning sensation of uncertainty that we might have broken something. 

We have verified that our events are bound and unbound correctly, and we also know that our mediator published the events with the expected data.

Furthermore, we subscribe to Episerver content events in a manner of separation of concerns, that is reliable and can conform to the rest of your solutions architecture without the need to bloat your initalization modules. That truly makes our code base alot more solid.

As always, you need to be careful when working with async code in this manner, but done right, gives you the best of both worlds when your hand is forced.

Some people might think of the solution, especially the tests verification to be a little esoteric, but I would argue the gains are tremendous with the testability and reliability you get from doing this.

Just embrace it 🖖
