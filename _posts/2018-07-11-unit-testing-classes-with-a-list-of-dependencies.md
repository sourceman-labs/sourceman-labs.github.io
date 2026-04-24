---
title: "Unit testing classes with a list of dependencies"
slug: "unit-testing-classes-with-a-list-of-dependencies"
publishedDate: "2018-07-11"
excerpt: "I sometimes find myself writing tests for classes that are hard to refactor into smaller pieces, or perhaps not just justifiable to spend time refactor. At times like this, it easy to end up with unit tests that makes your head ache when trying to maintain them because of all repeated mocking to ..."
author: "Magnus Kallman"
tags: ["unit-testing", "dotnet"]
---

When the test subject has multiple dependencies that are not used for each test case, and your class needs new instance of each mock to be able to run different test cases in parallel. You might end up with a copy paste scenario where each test case ends up with a clutter of mocks, like this. And with a class that has more scenarios that can fit on the screen, the tests for the current class easlity becomes hard to read, which means hard to maintain.
<br>

```csharp
[Fact]
public async Task Should_call_my_function_to_be_awesome()
{
    var thing1Mock = new Mock<Thing1>();
    var thing2Mock = new Mock<Thing2>();
    var thing3Mock = new Mock<Thing3>();
    var thing4Mock = new Mock<Thing4>();
    
    ...
    
    thing1Mock.Setup(thing1 => thing1.DoIt()).Returns(new Stuff());
    thing2Mock.Setup(thing2 => thing2.HandleIt()).Returns(new MoreStuff());
    
    MyTestableClass myTestableClass = new MyTestableClass(thing1Mock.Object, thing2Mock.Object, thing3Mock.Object, thing4Mock.Object);

    await myTestableClass.DoHeavyLifting("Hello world");

    class1Mock.Verify(myClass => 
      myClass.MyFunction(It.IsAny<string>()), Times.Once);
}
```

Now, what we really want is readable tests, with a minumum amount of mocking. One nifty way to achieve this, is to utilize some C#7 in a Setup method for each test class.

What i want to achieve here, is to have a minimal amount of lines of code in  each test. To make them more readable and maintainable. This approach is using [C# 7 value tuples](https://blogs.msdn.microsoft.com/mazhou/2017/05/26/c-7-series-part-1-value-tuples/ "C#7 Value Tuples") to make a powerful setup method for each test.

### Digging into the code

This is the end result we're aiming for here.

```csharp
[Fact]
public async Task Should_call_my_function_to_be_awesome()
{
    var (myTestableClass, dependencies) = Setup();
    Mock<Class1> class1Mock = dependencies.GetMock<Class1>();
    
    await myTestableClass.DoHeavyLifting("Hello world");

    class1Mock.Verify(myClass => 
      myClass.MyFunction(It.IsAny<string>()), Times.Once);
}
```

Let's have a look at how we can end up with this clean scenario.
With C# 7 we can write a Setup method for the test class with named Tuple types and deconstruction.
<br>

```csharp
(MyTestableClass myTestableClass, List<object> dependencies) Setup()
{
    var dependencies = new List<object>();
    var class1Mock = new Mock<Class1>();
    var class2Mock = new Mock<Class2>();

    mocks.AddRange(new List<object>()
    {
        class1Mock,
        class2Mock,
    });

    return (
        myTestableClass: new MyTestableClass(
            class1: class1Mock.Object,
            class2: class2Mock.Object,
        dependencies
    );
}
```

Then i add an extension method to my test project in the rootnamespace to get this easily accessible in my tests.
<br>

```csharp
public static Mock<T> GetMock<T>(this List<object> mocks)
    where T : class
{
    if (mocks == null || mocks.Count == 0)
    {
        return null;
    }

    return mocks.FirstOrDefault(item => item is Mock<T>) as Mock<T>;
}
```
