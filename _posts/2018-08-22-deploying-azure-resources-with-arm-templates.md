---
title: "Deploying Azure Resources with ARM Templates"
slug: "deploying-azure-resources-with-arm-templates"
publishedDate: "2018-08-22"
excerpt: "Automated deployments for web applications is pretty much the standard now, but the infrastructure part that is often overlooked. When working with Microsoft Azure, you can use ARM templates, to release or validate your infrastructure in your ci/cd pipeline."
author: "Magnus Kallman"
tags: ["azure", "devops"]
---

Now you might think *"Why should I bother with this, I just set up my resource groups once and let them be"*.

At the very least deploying with ARM-templates helps you validate that your resource groups still have what they need to run your applications the way you expect.

However, utilizing the full power of ARM templates will help you keep your connectionstrings and secrets safe, and you will be able to scale out to new environments and regions without performing the manual setup again. And it will keep your environments configured and behave in a expected way.

The ARM templates come with a set of helper function that you can call in your json-files, to query resources for settings, fetching keys and connectionstrings. You can read a detailed description of them [here.](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions "ARM template functions")

We could for example in a project i was recently involved in, setup a Resource Group with ARM templates to deploy with:

- .NET Core WebApp
- Azure Cosmos Db
- Azure Functions App
- Azure EventGrid
- ApplicationInsights

All fully configured, after the dev environment was setup we could release stage and production from scratch with zero configuration time, other than adding the variables to our VSTS release process.

## Visual Studio project template
Assuming you have a solution in Visual Studio with your web project, add a new project based on the Cloud template called "Azure Resource Group". Now you will have a new project with three files, azuredeploy.json, azuredeploy.parameters.json and DeployAzureResourceGroup.ps1. 


__azuredeploy.json__

This file contains the actual definition of what the resource group should look like.

__azuredeploy.parameters.json__

This file is used to parameterize variables that are environment specific, so you can transdform them in your CI/CD pipeline based on which environment youre deploying to.

__DeployAzureResourceGroup.ps1.__

This file just a deploy script that you shouldn't need to touch.


### Usage
You can choose to use your ARM-template deployment for Validation, Incremental release or Complete. Depending on how confindent your are, i'd advise you to atleast run with Incremental, that way you can be sure to have all the resources you need. 

We chose to treat our resource groups to contain things that live and die together, hence a single ARM templatefor us would contain all the resources that functionality/microservice in our eco-system, requires to run.

Except some of the sites that share app service plan, to do some penny pinching. and that is easily configured in the ARM-template.

### Tips
Probably the most time efficient way to get started the first time around, is to use the tools in Visual Studio. Here you can validate or one-click deploy directly from Visual Studio. 
When you are satisfied with the result, add your parameter values for each environment from __azuredeploy.parameters.json__ to your release step for your ARM-template in your CI/CD tool.

If you already have resources groups that you created manually, you can access your current __azuredeploy.json__ in the Azure Portal, if you navigate to your Resource Group -> Settings -> Automation script. But be aware that it most likely contains alot of noise from previous releases, and probably best serves as a reference to glance at while setting up your new file in Visual Studio.

### Example
Heres and example config for __azuredeploy.json__ for a resource group we are using. Containing a WebApp, Application Insights for WebApp and a Console app, EventGrid, Cosmos Db, Functions App and Storage. All this fully configuers the apps with appsettings and connectionstrings to get it up and running smoothly.

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "appServicePlan": {
            "type": "string"
        },
        "siteName": {
            "type": "string"
        },
        "storageAccount": {
            "type": "string"
        },
        "cosmosAccountKey": {
            "type": "string"
        },
        "cosmosUri": {
            "type": "string"
        }
    },
    "variables": {
        "appInsightsNameWeb": "[parameters('siteName')]",
        "appInsightsNameSyncApp": "[concat('sync-application-', parameters('siteName'))]",
        "appInsightsNameFunctions": "[concat(parameters('siteName'), '-functions')]",
        "serverFarmId": "[concat('/subscriptions/', subscription().subscriptionId,'/resourceGroups/', parameters('appServicePlan'), '/providers/Microsoft.Web/serverfarms/', parameters('appServicePlan'))]",
        "appFunctionsName": "[concat(parameters('siteName'), '-functions')]",
        "eventGridProductsTopicName": "[concat(parameters('siteName'), '-eg-topic')]",
        "cosmosDbName": "[concat(parameters('siteName'), '-cosmos')]"
    },
    "resources": [
        {
            "type": "Microsoft.DocumentDB/databaseAccounts",
            "kind": "GlobalDocumentDB",
            "name": "[variables('cosmosDbName')]",
            "apiVersion": "2015-04-08",
            "location": "North Europe",
            "tags": {
                "defaultExperience": "DocumentDB"
            },
            "scale": null,
            "properties": {
                "databaseAccountOfferType": "Standard",
                "consistencyPolicy": {
                    "defaultConsistencyLevel": "Session"
                },
                "name": "[variables('cosmosDbName')]"
            },
            "dependsOn": []
        },
        {
            "comments": "DemoEventGrid Topic",
            "type": "Microsoft.EventGrid/topics",
            "name": "[variables('eventGridProductsTopicName')]",
            "apiVersion": "2018-01-01",
            "location": "northeurope",
            "scale": null,
            "dependsOn": []
        },
        {
            "comments": "AppInsights for DemoWebApp",
            "type": "Microsoft.Insights/components",
            "kind": "web",
            "name": "[variables('appInsightsNameWeb')]",
            "apiVersion": "2015-05-01",
            "location": "northeurope",
            "tags": {
                "[concat('hidden-link:', resourceGroup().id, '/providers/Microsoft.Web/sites/', parameters('siteName'))]": "Resource"
            },
            "scale": null,
            "properties": {
                "Application_Type": "web",
                "Flow_Type": "Bluefield",
                "Request_Source": "rest",
                "applicationId": "[variables('appInsightsNameWeb')]"
            },
            "dependsOn": []
        },
        {
            "comments": "AppInsights for Data Sync Console Application",
            "type": "Microsoft.Insights/components",
            "kind": "web",
            "name": "[variables('appInsightsNameSyncApp')]",
            "apiVersion": "2015-05-01",
            "location": "northeurope",
            "tags": {},
            "scale": null,
            "properties": {
                "Application_Type": "web",
                "Flow_Type": "Bluefield",
                "Request_Source": "rest"
            },
            "dependsOn": []
        },
        {
            "comments": "Storage account for Functions App",
            "type": "Microsoft.Storage/storageAccounts",
            "sku": {
                "name": "Standard_LRS",
                "tier": "Standard"
            },
            "kind": "Storage",
            "name": "[parameters('storageAccount')]",
            "apiVersion": "2017-10-01",
            "location": "northeurope",
            "tags": {},
            "scale": null,
            "properties": {
                "networkAcls": {
                    "bypass": "AzureServices",
                    "virtualNetworkRules": [],
                    "ipRules": [],
                    "defaultAction": "Allow"
                },
                "supportsHttpsTrafficOnly": false,
                "encryption": {
                    "services": {
                        "file": {
                            "enabled": true
                        },
                        "blob": {
                            "enabled": true
                        }
                    },
                    "keySource": "Microsoft.Storage"
                }
            },
            "dependsOn": []
        },
        {
            "comments": "AppInsights for DemoAzure Functions WebApp",
            "type": "Microsoft.Insights/components",
            "kind": "web",
            "name": "[variables('appInsightsNameFunctions')]",
            "apiVersion": "2015-05-01",
            "location": "northeurope",
            "tags": {},
            "scale": null,
            "properties": {
                "Application_Type": "web",
                "Flow_Type": "Bluefield",
                "Request_Source": "rest"
            },
            "dependsOn": []
        },
        {
            "comments": "DemoAzure Functions WebApp",
            "type": "Microsoft.Web/sites",
            "kind": "functionapp",
            "name": "[variables('appFunctionsName')]",
            "apiVersion": "2016-08-01",
            "location": "North Europe",
            "scale": null,
            "properties": {
                "enabled": true,
                "serverFarmId": "[variables('serverFarmId')]",
                "clientAffinityEnabled": false,
                "siteConfig": {
                    "appSettings": [
                        {
                            "name": "AzureWebJobsDashboard",
                            "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', parameters('storageAccount'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccount')), providers('Microsoft.Storage', 'storageAccounts').apiVersions[0]).keys[0].value)]"
                        },
                        {
                            "name": "AzureWebJobsStorage",
                            "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', parameters('storageAccount'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccount')), providers('Microsoft.Storage', 'storageAccounts').apiVersions[0]).keys[0].value)]"
                        },
                        {
                            "name": "Cosmos_Products_ConnectionString",
                            "value": "[concat('AccountEndpoint=', parameters('cosmosUri'),';AccountKey=', parameters('cosmosAccountKey'), ';')]"
                        },
                        {
                            "name": "APPINSIGHTS_INSTRUMENTATIONKEY",
                            "value": "[reference(concat('microsoft.insights/components/', variables('appInsightsNameFunctions'))).InstrumentationKey]"
                        },
                        {
                            "name": "App_EventGrid_Topic_Endpoint",
                            "value": "[reference(concat('Microsoft.EventGrid/topics/', variables('eventGridProductsTopicName'))).Endpoint]"
                        },
                        {
                            "name": "App_EventGrid_Sas_Key",
                            "value": "[listKeys(variables('eventGridProductsTopicName'), '2018-01-01').key1]"
                        }
                    ]
                }
            },
            "dependsOn": [
                "[resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccount'))]"
            ]
        },
        {
            "comments": "DemoAPI Web",
            "type": "Microsoft.Web/sites",
            "kind": "app",
            "name": "[parameters('siteName')]",
            "apiVersion": "2015-08-01",
            "location": "North Europe",
            "tags": {
                "[concat('hidden-related:', variables('serverFarmId'))]": "empty"
            },
            "scale": null,
            "properties": {
                "enabled": true,
                "serverFarmId": "[variables('serverFarmId')]",
                "clientAffinityEnabled": true
            },
            "resources": [
                {
                    "apiVersion": "2015-08-01",
                    "name": "web",
                    "type": "config",
                    "dependsOn": [
                        "[resourceId('Microsoft.Web/Sites', parameters('siteName'))]"
                    ],
                    "properties": {
                        "alwaysOn": true
                    }
                },
                {
                    "apiVersion": "2015-08-01",
                    "name": "appsettings",
                    "type": "config",
                    "dependsOn": [
                        "[resourceId('Microsoft.Web/Sites', parameters('siteName'))]"
                    ],
                    "properties": {
                        "MSDEPLOY_RENAME_LOCKED_FILES": "1",
                        "WEBSITE_TIME_ZONE": "W. Europe Standard Time",
                        "APPINSIGHTS_INSTRUMENTATIONKEY": "[reference(concat('microsoft.insights/components/', variables('appInsightsNameWeb'))).InstrumentationKey]"
                    }
                },
                {
                    "apiVersion": "2015-08-01",
                    "name": "staging",
                    "type": "slots",
                    "location": "North Europe",
                    "dependsOn": [
                        "[resourceId('Microsoft.Web/Sites', parameters('siteName'))]"
                    ],
                    "properties": {
                        "clientAffinityEnabled": false
                    },
                    "resources": [
                        {
                            "apiVersion": "2015-08-01",
                            "name": "web",
                            "type": "config",
                            "dependsOn": [
                                "[resourceId('Microsoft.Web/Sites/Slots', parameters('siteName'), 'staging')]"
                            ],
                            "properties": {
                                "autoSwapSlotName": "production",
                                "alwaysOn": true
                            }
                        }
                    ]
                }
            ],
            "dependsOn": [
                "[resourceId('microsoft.insights/components/', variables('appInsightsNameWeb'))]"
            ]
        }
    ]
}

```
<br>

## Conclusion
To fully utilize the Azure platform, this is a very logic and much needed step to make you sleep better at night, while also increase the speed and quality of your development process, and it fits very well into a continuous integration pipeline.
