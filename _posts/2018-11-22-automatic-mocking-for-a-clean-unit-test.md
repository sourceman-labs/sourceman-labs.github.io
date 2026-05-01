---
title: "Automatic mocking for a clean unit test"
slug: "automatic-mocking-for-a-clean-unit-test"
publishedDate: "2018-11-22"
excerpt: "I've been wanting to have a reason to dig deeper into the land of Reflection and Expression for a while. Thus i figured, a good place to start would be to build my own automatic mocker, for cleaner and simpler unit tests."
author: "Magnus Kallman"
tags: ["unit-testing", "dotnet"]
---

Writing unit tests, will undoubtedly, sooner or later force you to mock things.

A clean unit test, without redundant mocks is more readable and maintanable, and what do we want in life, if not maintainable tests.

For a while, i've been wanting to have a reason to dig deeper into the C# Reflection API. 
Spending more time thinking about tests, made me zero in on auto mocking as a suitable project.

*I know there are quite a few sdks for auto mocking out there. What better way to learn more about it than building it yourself, given enough time and reflection.*😉

## 🎬 A place to start
I was looking for a simple way to start, where i could basically optimize unit tests in my current project, in 90% of the test cases remove multiple lines of code.

The need for them to be easily read, as in, spending no more than the blink of an eye to figure out what they do, and how they do it.

## 🤖 Enter AutoMock
An obvious key pain point with mocking is the setup. Noise that is required for your test case to run, but not required to test that specific case.

The source code is available at GitHub [autonomous-mocker.](https://github.com/magkal/autonomous-mocker "autonomous-mocker")

#### Before AutoMock
Writing a unit test could look something like this.

```csharp
[Fact]
public void Should_do_stuff_with_concrete_implementation()
{
    var dependency1Mock = new Mock<IDependency1>();
    var dependency2Mock = new Mock<IDependency2>();
    var concreteType = new ConcreteType();
    var myClass = new AwesomeClass(dependency1.Object, dependency2.Object, concreteType);

    var result = myClass.DoStuff();

    dependency1Mock.Verify(dependency1 => dependency1.CallIt(), Times.Once);
}

[Fact]
public void Should_do_stuff()
{
    var dependency1Mock = new Mock<IDependency1>();
    var dependency2Mock = new Mock<IDependency2>();
    var dependency3Mock = new Mock<IDependency3>();

    var myClass = new AwesomeClass(dependency1.Object, dependency2.Object, dependency2.Object);

    var result = myClass.DoStuff();

    Assert.Equals("Awesome", result);
}
```

#### With AutoMock
Using AutoMock, the same two tests would look something like this.

```csharp
[Fact]
public void Should_do_stuff_with_concrete_implementation()
{
    var subject = AutoMock.Create<AwesomeClass>(config =>
    {
        config.For<ConcreteType>(new ConcreteType());
    });
    
    var dependency1Mock = subject.GetMock<IDependency1>();

    var result = myClass.DoStuff();

    dependency1Mock.Verify(dependency1 => dependency1.CallIt(), Times.Once);
}

[Fact]
public void Should_do_stuff()
{
    var subject = AutoMock.Create<AwesomeClass>();

    var result = subject.Instance.DoStuff();

    Assert.Equals("Awesome", result);
}
```

#### 🔧 Configuration
If you would like to configure your AutoMock test subject, you can pass in a ConfigurationExpression, that is basically a Action delegate with syntax inspired by StructureMap, to declare exactly how a specific type should behave.

#### 📚 A sidenote on readability
Readability, is also why i prefer to use xUnits DisplayName property on Facts and Theories, to make the purpose of the test more humanly readable, instead of relying on method naming with snake_case or PascalCase (Omitted here for brevity).

Lets face it. If snake case was easier to read than a normal sentence, underscore would be the primary word separating character, everywhere.
<br>

## 🚂 How it works
Using C# Reflection to read the ConstructorInfo from a given type, then we can just loop through the arguments and create a Mock of them, [at line 19.](https://github.com/magkal/autonomous-mocker/blob/master/src/Autonomous.Mock/AutoMock.cs#19 "Source code") There is almost surprisingly little going on here.

```csharp
public class AutoMock
{
    public static ISubject<TClass> Create<TClass>()
        where TClass : class
    {
        Type type = typeof(TClass);
        ConstructorInfo[] constructors = type.GetConstructors();
        ConstructorInfo constructor = constructors.FirstOrDefault();

        // Loop through the reflected arguments
        // Use MakeGeneric to create generic types with Activator
        var mockedArguments = GetMockedArguments(constructor);

        var concreteArguments = mockedArguments.Select(mock => ((Mock)mock).Object).ToArray();

        // Invoke the instance with our mocked arguments
        var instance = constructor.Invoke(concreteArguments) as TClass;

        return new Subject<TClass>(instance, mockedArguments);
    }

    private static IEnumerable<object> GetMockedArguments(ConstructorInfo constructor, IMockContext mockContext = null)
    {
        List<object> arguments = new List<object>();

        foreach (ParameterInfo argument in constructor.GetParameters())
        {
            if (mockContext != null && mockContext.TypeMap.Any(map => map.Key == argument.ParameterType))
            {
                arguments.Add(mockContext.TypeMap.FirstOrDefault(map => map.Key == argument.ParameterType).Value);
                continue;
            }

            Type mockType = typeof(Mock<>).MakeGenericType(argument.ParameterType);
            arguments.Add(Activator.CreateInstance(mockType));
        }

        return arguments;
    }
}
```

The just slightly more complex version, is the overload with the ConfigurationExpression, calls the passed in expression the context of the AutoMock.Create method, to be able to save a reference to the type based configuration,[ at line 41.](https://github.com/magkal/autonomous-mocker/blob/master/src/Autonomous.Mock/AutoMock.cs#L41 "Source code") The issue here was pretty much figuring out what would be a nice syntax to call the method with a configuration, and then capture it.

```csharp
// Run the expression we passed in
// The idea of the MockContext was to extend it with further configurable settings
mockContext = new MockContext();
var expression = new ConfigurationExpression(mockContext.TypeMap);
configurationExpression(expression);

var mockedArguments = GetMockedArguments(constructor, mockContext);

// Now our concrete arguments might not be mocks
// So if they aren't, we should return the concrete implementation
var concreteArguments = mockedArguments.Select(implementation =>
{
    if (!(implementation is Mock))
    {
        return implementation;
    }

    return ((Mock)implementation).Object;
})
.ToArray();
```


Check out the full source code at GitHub [autonomous-mocker.](https://github.com/magkal/autonomous-mocker "autonomous-mocker")

Peace out ✌️
