---
title: "State of the csharp union"
slug: "state-of-the-csharp-union"
publishedDate: "2026-10-27"
excerpt: "Union types are finally here, what now?"
author: "Magnus Källman"
tags: ["dotnet"]
---
The day is almost upon us, many of us thought it would never come. Albeit, it comes at a time when AI is taking over our industry. 

I'm talking about, of course, the new C# union type. And before you ask, **yes** you _should_ care about this. The union type will not just give us compiler enforced exhaustive pattern matching over type(s) but it improves the semantic meaning of a method declaration by a mile, with the proper language support.

Alas, we are not getting a tag union, or something that is compatible with F#, but we have to celebrate anyway.


## How to use it
```csharp
public sealed record Draft;
public sealed record Paid(PaymentId PaymentId);
public sealed record Shipped(PaymentId PaymentId, TrackingNumber TrackingNumber);
public sealed record Cancelled(string Reason);

public union OrderState(Draft, Paid, Shipped, Cancelled);
```

Now that you have your order state declared, you can pattern match over it.

Because we declared the `OrderState` as a `Union` we no longer need the default arm like `_ => throw new UnreachableException()`, and if we omit one of the states the compiler reports CS8509 (The switch expression does not handle all possible values of its input type (it is not exhaustive)). Make CS8509 an error, as the sample does with `<WarningsAsErrors>`, and the build fails.

This also means that we can more precisely express the intent of a function, and let callers know what state they need to handle.

Your data layer returns the order, for example through a `GetOrder` method:

```csharp
var order = await GetOrder(orderId);

string status = order.State switch
{
    Draft => "draft",
    Paid p => $"paid with {p.PaymentId}",
    Shipped s => $"shipped, tracking {s.TrackingNumber}",
    Cancelled c => $"cancelled: {c.Reason}",
};
```

## But what about performance
The major caveat of the new `Union` is that it allocates when the cases are value types, because they have to be boxed.<sup class="cite"><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing" target="_blank" rel="noopener noreferrer">[1]</a><span class="glossary-tip cite-tip" role="tooltip"><strong>Boxing and Unboxing - C# | Microsoft Learn</strong><span class="cite-url">https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing</span></span></sup> And realistically, speaking for myself at least, I would not want to impose a performance hit like that for such a nice and versatile feature.
Luckily there are ways around this. I had some AI generate a few samples to compare them, here: [blog-sample-state-of-the-csharp-union](https://github.com/sourceman-labs/blog-sample-state-of-the-csharp-union)


The first table shows the mean time and allocations at 10% failures, on an Apple M2 Pro with .NET 11 RC1. The final release can differ.

| Variant | Mean | Allocated |
|---|---:|---:|
| Hand-written non-boxing union | 12.7 ns | 56 B |
| Generated non-boxing union | 12.7 ns | 56 B |
| Try-pattern (`bool` + `out`) | 9.2 ns | 64 B |
| `union` declaration | 17.1 ns | 80 B |
| Exceptions | 104.5 ns | 99 B |

The [sample repo](https://github.com/sourceman-labs/blog-sample-state-of-the-csharp-union/tree/main/BenchmarkDotNet.Artifacts/results) has every variant, at 0%, 10%, and 50% failures.

The second table covers unions of value types (`int` or `ErrorCode`). A `union` declaration boxes each value, so it allocates. The generated struct (`[ValueUnion]`) does not.

| Variant | Mean | Allocated |
|---|---:|---:|
| Hand-written non-boxing union | 4.8 ns | 0 B |
| Generated non-boxing union | 4.5 ns | 0 B |
| `union` declaration | 7.4 ns | 24 B |

_Focusing on the allocation results, as the timings will surely vary between yours and my computer._

## The (right?) way to use it
If `Union` allocates value types by default, how can we get rid of that allocation and still make the most of this new awesome feature?
You have two options: write the union struct by hand, or let a source generator do it for you. The hand-written version is in [`bench/Benchmarks/Pipeline/UnionPipelines.cs`](https://github.com/sourceman-labs/blog-sample-state-of-the-csharp-union/blob/main/bench/Benchmarks/Pipeline/UnionPipelines.cs), and the generated version (an `int` or `ErrorCode` union) is in [`src/UnionGen.Sample/Generated/ParseResult.cs`](https://github.com/sourceman-labs/blog-sample-state-of-the-csharp-union/blob/main/src/UnionGen.Sample/Generated/ParseResult.cs).

Let's say you want to make use of exhaustive pattern matching with result types, attempting to encode the success or error state as the value. This can be achieved the following way with the new union type without extra allocations on the success path.

```csharp
public sealed record ParseFailure(string Reason);

public union ParseResult(int, ParseFailure);

public static ParseResult Parse(string text) =>
    int.TryParse(text, out var n) ? n : new ParseFailure($"'{text}' is not a number");

public static string Describe(ParseResult result) => result switch
{
    int n => $"parsed {n}",
    ParseFailure f => f.Reason,
};
```

The same type, written by hand without boxing:

```csharp
using System.Runtime.CompilerServices;

[Union]
public readonly struct HandWrittenParseResult : IUnion
{
    private readonly int _number;
    private readonly ParseFailure? _failure;
    private readonly byte _tag;

    public HandWrittenParseResult(int number) { _tag = 1; _number = number; }
    public HandWrittenParseResult(ParseFailure failure) { _tag = 2; _failure = failure; }

    public object? Value => _tag switch { 1 => _number, 2 => _failure, _ => null };
    public bool HasValue => _tag != 0;
    public bool TryGetValue(out int number) { number = _number; return _tag == 1; }
    public bool TryGetValue(out ParseFailure failure) { failure = _failure!; return _tag == 2; }
}
```


## Wrapping up
This is the part of functional programming that C# has lacked for years. You (and your agents) should make this a part of your daily C# output.
