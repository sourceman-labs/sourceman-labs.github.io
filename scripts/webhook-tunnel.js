#!/usr/bin/env node

/**
 * Webhook Testing Script
 *
 * This script provides instructions for setting up webhook testing with ngrok.
 * For automatic webhook setup, you can use the contentful-webhook-tunnel package.
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║       Contentful Webhook Testing Setup                       ║
╔══════════════════════════════════════════════════════════════╗

To test Contentful webhooks locally, you need to expose your local
development server to the internet. Here's how:

📦 STEP 1: Install ngrok (if not already installed)

   Download from: https://ngrok.com/download
   Or use package manager:

   macOS:    brew install ngrok
   Linux:    snap install ngrok
   Windows:  choco install ngrok

📦 STEP 2: Start your Eleventy dev server

   npm run dev

   This will start the server on http://localhost:8080

📦 STEP 3: Start ngrok tunnel (in a new terminal)

   ngrok http 8080

   Copy the "Forwarding" URL (e.g., https://abc123.ngrok.io)

📦 STEP 4: Configure Contentful webhook

   1. Go to: https://app.contentful.com/spaces/YOUR_SPACE_ID/settings/webhooks
   2. Click "Add Webhook"
   3. Name: "Local Development"
   4. URL: [Your ngrok URL]/webhook (e.g., https://abc123.ngrok.io/webhook)
   5. Triggers: Select "Entry.publish", "Entry.unpublish", "Asset.publish"
   6. Save

📦 STEP 5: Test the webhook

   Publish or update an entry in Contentful.
   Watch your Eleventy dev server rebuild automatically!

⚠️  IMPORTANT: Remember to delete the webhook when done testing!

═══════════════════════════════════════════════════════════════

🚀 PRODUCTION WEBHOOK SETUP

For production, configure Contentful to trigger GitHub Actions:

1. Create a GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Scope: "repo" or "public_repo"
   - Copy the token

2. Add webhook in Contentful:
   - Name: "GitHub Pages Deployment"
   - URL: https://api.github.com/repos/sourceman-labs/site-generator/dispatches
   - Method: POST
   - Headers:
     * Authorization: Bearer YOUR_GITHUB_TOKEN
     * Accept: application/vnd.github.v3+json
   - Payload:
     {
       "event_type": "contentful_update"
     }
   - Triggers: Entry.publish, Entry.unpublish, Asset.publish

3. The GitHub Actions workflow will automatically trigger and deploy!

═══════════════════════════════════════════════════════════════
`);

process.exit(0);
