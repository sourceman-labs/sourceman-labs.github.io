---
title: "Reflections on the past year with AI"
slug: "reflections-on-the-past-year-with-ai"
publishedDate: "2026-10-26"
excerpt: "Thoughts on the past year with AI."
author: "Magnus Källman"
tags: ["AI", "Reflections"]
---
A few weeks back I clicked a song in my playlist and a different one starts. I click again and again, same thing. I figure out my version of Spotify starts the next track instead of my selection.

A small bug for sure, but it breaks the most basic promise a music player makes: you pick a track to play, it plays. Earlier this year the same company boasted that their best developers hadn’t written a line of code in the past months.<sup class="cite"><a href="https://techcrunch.com/2026/02/12/spotify-says-its-best-developers-havent-written-a-line-of-code-since-december-thanks-to-ai/" target="_blank" rel="noopener noreferrer">[1]</a><span class="glossary-tip cite-tip" role="tooltip"><strong>Spotify says its best developers haven't written a line of code since December, thanks to AI</strong><span class="cite-url">https://techcrunch.com/2026/02/12/spotify-says-its-best-developers-havent-written-a-line-of-code-since-december-thanks-to-ai/</span></span></sup>

Of course I can’t tell if my specific bug encounter can be attributed to AI, but the internet is swarming with stories similar to this, how software has just gotten exponentially worse since AI has become a big part of software development in general. The software development lifecycle has undeniably by and large changed <sup class="cite"><a href="https://survey.stackoverflow.co/2025/" target="_blank" rel="noopener noreferrer">[2]</a><span class="glossary-tip cite-tip" role="tooltip"><strong>Stack Overflow Developer Survey 2025</strong><span class="cite-url">https://survey.stackoverflow.co/2025/</span></span></sup><sup class="cite"><a href="https://survey.stackoverflow.co/2026/ai" target="_blank" rel="noopener noreferrer">[3]</a><span class="glossary-tip cite-tip" role="tooltip"><strong>AI 2026 | Stack Overflow Developer Survey</strong><span class="cite-url">https://survey.stackoverflow.co/2026/ai</span></span></sup> and we have not stopped to ask ourselves if it’s all worth it.

## A year of "not writing code"
We are coming up on the one year anniversary of the release of Opus 4.5, and the tipping point where generative AI actually became useful for a wide variety of software engineering tasks. (Yes, the people who claim it was before this are lying).

I’ve used AI everyday since December 2025, and I can without a doubt say that I’m more productive, and while I still use Neovim everyday, it’s more so for browsing than writing code.

If you care about the quality of the software you ship, you need to babysit the agents to succeed. In my opinion, they are nowhere near as smart as their creators or marketers claim.
That being said not all parts of software engineering are alike. For instance, sometimes you prototype, or take on deliberate technical debt in order to reach some goal quicker, when that is true, this is when you reach those <span class="glossary-term" tabindex="0">TMBB<span class="glossary-tip" role="tooltip"><strong>TMBB</strong> (Trust Me Bro Benchmarks): a slang term for an artificial intelligence (AI) evaluation or leaderboard score published by a tech company that cannot be independently verified.</span></span>'s force multipliers.
When you ship code that you want or need to work, you realise that agents are almost pathologically unable to ship without sprinkling in at least some slop, codebase entropy keep increasing. 
Slop that will come back to haunt you if the project is long lived, unless you are diligent.

I can say without a doubt, that i have become more productive with the help of AI, but learning and having fun on the job takes a lot more effort now. 

It's funny how lots of companies started boasting about the amount of lines of code shipped, and deployment frequency, as if these were accepted metrics of software quality or proof of value added. 
However from my experience, shipping smaller pull requests is a requirement to get higher quality out of AI driven code review. As well as creating an ironclad test suite is needed to increase the confidence in what is shipping. Both of these features of AI driven software engineering will increase the total lines of code per month and the amount of pull requests, none of them prove value or even the right thing was shipped. 
Before AI, we usually usually didn't prioritize this work, and sometimes we could also omit it because knowledge sharing or letting it be inferred by the programmer was cheap. 


As long as I'm focusing on problem solving, using AI feels kind of good. The vast majority of my token spend of the past year has been on personal tooling, learning and trying to figure out how to work smarter with these models.


## The human side
Whenever AI has been discussed as this force multiplier that will skyrocket productivity, everyone just appears to take some measurement and apply it without adjusting for human psychology. 

Many studies have shown that workers whom are complacent at work are in majority.<sup class="cite"><a href="https://www.gallup.com/workplace/645758/state-of-the-global-workplace-2024-press-release.aspx" target="_blank" rel="noopener noreferrer">[4]</a><span class="glossary-tip cite-tip" role="tooltip"><strong>Twenty Percent Of The World's Employees Experience Loneliness While Global Employee Engagement Stagnated And Employee Wellbeing Declined</strong><span class="cite-url">https://www.gallup.com/workplace/645758/state-of-the-global-workplace-2024-press-release.aspx</span></span></sup> What happens when leaders are shoving down these tools to their workers? Will they keep the productivity gains for themselves, making it possible for them to work less for the same output, giving them more time for leisure when their employer is not watching? 

What happens when the users of AI don't get the same amount of endorphins from solving problems and learning on the job, will they become depressed and thus also less productive?
People also appear to risk burnout at a higher rate, because of how the current AI tools are consumed.

Maybe we can engineer these tools in the future to feel really great to use, give us learnings, make us remember to take breaks and reach a higher level of well being.

From what i hear many companies still struggle to get any value out AI, instead ending up with increased costs as the key result.<sup class="cite"><a href="https://www.entrepreneur.com/business-news/survey-of-30903-professionals-shows-they-are-adopting-ai-despite-the-drawbacks" target="_blank" rel="noopener noreferrer">[5]</a><span class="glossary-tip cite-tip" role="tooltip"><strong>Survey of 30,903 professionals shows they are adopting AI despite the drawbacks</strong><span class="cite-url">https://www.entrepreneur.com/business-news/survey-of-30903-professionals-shows-they-are-adopting-ai-despite-the-drawbacks</span></span></sup>

## What now
The field of software engineering appears to have expanded exponentially, by making code much more accessible and approachable.

For now, AI has really just expanded the problem space that needs or can benefit from programmed solutions.

It will be interesting to see if peoples skill atrophy from AI use, and loss of domain knowledge will be worth it in the long term, one would have to make a bet that smarter models will fix it, but I'd argue we are unable to correctly assess the outcome of smarter AI models.

We just have to wait and see where this will take us, the coming years will likely get messy.


## References

1. [Spotify says its best developers haven't written a line of code since December, thanks to AI](https://techcrunch.com/2026/02/12/spotify-says-its-best-developers-havent-written-a-line-of-code-since-december-thanks-to-ai/). TechCrunch, 12 February 2026.
2. [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/). Stack Overflow.
3. [AI 2026 | Stack Overflow Developer Survey](https://survey.stackoverflow.co/2026/ai). Stack Overflow.
4. [Twenty Percent Of The World's Employees Experience Loneliness While Global Employee Engagement Stagnated And Employee Wellbeing Declined](https://www.gallup.com/workplace/645758/state-of-the-global-workplace-2024-press-release.aspx). Gallup, 11 June 2024.
5. [Survey of 30,903 professionals shows they are adopting AI despite the drawbacks](https://www.entrepreneur.com/business-news/survey-of-30903-professionals-shows-they-are-adopting-ai-despite-the-drawbacks). Entrepreneur.
