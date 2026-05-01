---
title: "Node-Sass build failure in Azure DevOps"
slug: "node-sass-build-failure-in-azure-devops"
publishedDate: "2019-11-11"
excerpt: "How to make sure your build pipeline runs on a specific version of node.js in Azure DevOps."
author: "Magnus Kallman"
tags: ["azure", "devops"]
---

The error message we started getting during the weekend.

```
d:\a\1\s\node_modules\node-sass\src\create_string.cpp(17): error C2664: 'v8::String::Utf8Value::Utf8Value(const v8::String::Utf8Value &)': cannot convert argument 1 from 'v8::Local<v8::Value>' to 'const v8::String::Utf8Value &' [D:\a\1\s\node_modules\node-sass\build\binding.vcxproj]
```

Turns out our DevOps agents got an updated node version, and the node-sass package we use doesn't work with node version 12.

Thankfully, Microsoft has a built in task for Azure DevOps called "Node.js tool installer" where you can specifially set which node.js version you want your pipline to use.

![node-js-tool-installer](/img/blog/inline-node-js-tool-installer.PNG)

🖖
