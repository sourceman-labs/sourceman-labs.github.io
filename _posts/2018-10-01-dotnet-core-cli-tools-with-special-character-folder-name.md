---
title: "Dotnet core cli tools with special character folder name"
slug: "dotnet-core-cli-tools-with-special-character-folder-name"
publishedDate: "2018-10-01"
excerpt: "Being blessed with one of the special swedish characters in your name, and being lucky enough that your windows account was created with your full name as your username. That is a recipe for excellent quirks."
author: "Magnus Kallman"
tags: ["dotnet"]
---

I recently started checking out dotnet core cli global tools, and when i tried to install the octopus global tool, the install failed because of the path was unable to resolve correctly with my windows user being named "Magnus Källman". It was during my spare time and it just made me sad, hence i gave up on it for that time being.

However i later i had to setup Azure Functions for local debugging/development, and was met with this errror.

```powershell
module.js:471
    throw err;
    ^

Error: Cannot find module 'C:\Users\Magnus K�llman\AppData\Local\AzureFunctionsTools\Releases\1.4.0\cli\edge\double_edge.js'
    at Function.Module._resolveFilename (module.js:469:15)
    at Function.Module._load (module.js:417:25)
    at Module.runMain (module.js:604:10)
    at run (bootstrap_node.js:389:7)
    at startup (bootstrap_node.js:149:9)
    at bootstrap_node.js:504:3
```

So now, this was something that really had to be fixed, and I felt way too lazy to setup a new user in Windows. But fortunately i remembered that you can make links in Windows. The MKLINK command to the rescue.


```powershell

# Copy the faulting folder path into the first parameter
# Add the correct folder name as second parameter
C:\Users> MKLINK /J "Wrong folder name" "Correct folder name" 

# What i had to write
C:\Users> MKLINK /J "Magnus K�llman" "Magnus Källman"

```

After the link is created, everything works as expected.

🖖
