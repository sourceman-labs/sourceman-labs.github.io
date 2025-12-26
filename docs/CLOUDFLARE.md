# Cloudflare Dual-Domain Setup

Complete guide for configuring both sourceman.se and magnuskallman.se with Cloudflare, including the 301 redirect from magnuskallman.se to sourceman.se.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [DNS Configuration](#dns-configuration)
- [Cloudflare Page Rule Setup](#cloudflare-page-rule-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [GitHub Pages Setup](#github-pages-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Architecture Overview

### Traffic Flow Diagram

```
User visits magnuskallman.se
         ↓
GoDaddy DNS → Cloudflare DNS
         ↓
Cloudflare checks Page Rules
         ↓
Matches: magnuskallman.se/*
         ↓
301 Redirect to sourceman.se
         ↓
Cloudflare proxies to GitHub Pages
         ↓
GitHub Pages serves content
         ↓
User sees sourceman.se
```

### Why This Architecture?

**Cloudflare Page Rule Redirect Benefits:**
- ⚡ **Fast** - Redirect happens at edge (Cloudflare's global network)
- 🆓 **Free** - 3 page rules included in free tier
- 🔒 **Secure** - SSL/TLS on both domains
- 🛡️ **Protected** - DDoS protection and WAF
- 📊 **Trackable** - See redirect stats in Cloudflare Analytics
- 🎯 **SEO-Friendly** - 301 permanent redirect preserves search rankings

**Alternative Approaches (Not Used):**
- ❌ Multiple domains in CNAME - Not supported by GitHub Pages
- ❌ Separate redirect repository - More maintenance, slower
- ❌ DNS-only redirect - Requires paid DNS services

## Prerequisites

### Accounts Required

- **GoDaddy Account** - Domain registrar (you already have this)
- **Cloudflare Account** - Free tier is sufficient
  - Sign up at [cloudflare.com](https://dash.cloudflare.com/sign-up)
- **GitHub Account** - For GitHub Pages hosting

### Domains Required

- **sourceman.se** - Primary domain
- **magnuskallman.se** - Secondary domain (redirects to primary)

Both domains should be:
- ✅ Registered with GoDaddy
- ✅ Added to Cloudflare
- ✅ Using Cloudflare nameservers

### Repository Setup

Ensure your GitHub repository:
- ✅ Is named `sourceman-labs.github.io`
- ✅ Has a `CNAME` file containing `sourceman.se`
- ✅ Has GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)

## DNS Configuration

### Step 1: Add Domains to Cloudflare

If you haven't already added your domains to Cloudflare:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Add a Site**
3. Enter **sourceman.se**
4. Select the **Free** plan
5. Click **Continue**
6. Cloudflare will scan existing DNS records
7. Review and click **Continue**
8. Note the Cloudflare nameservers (e.g., `adam.ns.cloudflare.com`)
9. Repeat for **magnuskallman.se**

### Step 2: Update Nameservers in GoDaddy

For each domain (sourceman.se and magnuskallman.se):

1. Log in to [GoDaddy](https://account.godaddy.com/)
2. Go to **My Products** → **Domains**
3. Click on the domain name
4. Scroll to **Nameservers**
5. Click **Change Nameservers**
6. Select **I'll use my own nameservers**
7. Enter the Cloudflare nameservers provided in Step 1
8. Click **Save**

**Wait for propagation:** DNS changes can take 24-48 hours, but usually complete in 1-2 hours.

**Check status:** In Cloudflare dashboard, the domain status will change from "Pending" to "Active" when nameservers are updated.

### Step 3: Configure DNS Records for sourceman.se

In Cloudflare dashboard, select **sourceman.se** → **DNS** → **Records**

Add the following A records:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 185.199.108.153 | Proxied | Auto |
| A | @ | 185.199.109.153 | Proxied | Auto |
| A | @ | 185.199.110.153 | Proxied | Auto |
| A | @ | 185.199.111.153 | Proxied | Auto |

**Optional:** Add www subdomain:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| CNAME | www | sourceman.se | Proxied | Auto |

**Click "Save"** for each record.

**Important Notes:**
- **@** means the root domain (sourceman.se)
- **Proxied** (orange cloud) enables Cloudflare CDN and protection
- These IPs are GitHub Pages servers (official addresses)

### Step 4: Configure DNS Records for magnuskallman.se

In Cloudflare dashboard, select **magnuskallman.se** → **DNS** → **Records**

Add the same A records:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 185.199.108.153 | Proxied | Auto |
| A | @ | 185.199.109.153 | Proxied | Auto |
| A | @ | 185.199.110.153 | Proxied | Auto |
| A | @ | 185.199.111.153 | Proxied | Auto |

**Optional:** Add www subdomain to also redirect:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| CNAME | www | magnuskallman.se | Proxied | Auto |

**Click "Save"** for each record.

**Why point to GitHub Pages?**
- Both domains need to reach GitHub's infrastructure
- The Page Rule will intercept traffic and redirect magnuskallman.se
- This ensures SSL works correctly before the redirect

## Cloudflare Page Rule Setup

Page Rules allow you to redirect traffic before it reaches the origin server (GitHub Pages).

### Step 1: Access Page Rules

1. In Cloudflare dashboard, select **magnuskallman.se**
2. Go to **Rules** → **Page Rules** (in the left sidebar)
3. Click **Create Page Rule**

### Step 2: Configure the Redirect

**URL Match Pattern:**
```
*magnuskallman.se/*
```

This matches:
- `http://magnuskallman.se/`
- `https://magnuskallman.se/`
- `http://www.magnuskallman.se/` (if www CNAME exists)
- `https://www.magnuskallman.se/`
- Any path: `/about`, `/posts/hello-world/`, etc.

**Add Setting:**
1. Click **+ Add a Setting**
2. Select **Forwarding URL**
3. Select status code: **301 - Permanent Redirect**
4. Enter destination URL: `https://sourceman.se/$1`

**Understanding the destination:**
- `$1` preserves the path from the original URL
- Example: `magnuskallman.se/posts/hello-world/` → `sourceman.se/posts/hello-world/`

### Step 3: Save the Page Rule

1. Click **Save and Deploy**
2. The page rule is now active!

**Verify the rule:**
- Go to **Rules** → **Page Rules**
- You should see your rule listed
- Status should be "Active"

### Step 4: Optional - Redirect www Subdomain

If you added a www CNAME record for magnuskallman.se, you'll want to redirect that too.

**Create a second Page Rule:**

**URL Match Pattern:**
```
*www.magnuskallman.se/*
```

**Setting:**
- Forwarding URL
- 301 - Permanent Redirect
- Destination: `https://sourceman.se/$1`

**Save and Deploy**

**Note:** Free Cloudflare accounts include 3 Page Rules. You've used 1-2 so far.

## SSL/TLS Configuration

### Step 1: Configure SSL/TLS Mode

For each domain (sourceman.se and magnuskallman.se):

1. In Cloudflare dashboard, select the domain
2. Go to **SSL/TLS** → **Overview**
3. Select **Full (strict)** encryption mode

**Why Full (strict)?**
- Encrypts traffic between visitor → Cloudflare → GitHub Pages
- Validates GitHub's SSL certificate
- Most secure option for GitHub Pages

**Encryption Modes Explained:**
- **Off** - No HTTPS (not recommended)
- **Flexible** - HTTPS between visitor and Cloudflare only
- **Full** - HTTPS end-to-end, but doesn't validate origin certificate
- **Full (strict)** - HTTPS end-to-end with certificate validation ✅

### Step 2: Enable Always Use HTTPS

1. Go to **SSL/TLS** → **Edge Certificates**
2. Scroll to **Always Use HTTPS**
3. Toggle **On**

This automatically redirects HTTP to HTTPS for all visitors.

### Step 3: Enable HSTS (Optional but Recommended)

HTTP Strict Transport Security tells browsers to always use HTTPS.

1. Go to **SSL/TLS** → **Edge Certificates**
2. Scroll to **HTTP Strict Transport Security (HSTS)**
3. Click **Enable HSTS**
4. Configure settings:
   - **Max Age**: 6 months (15768000 seconds)
   - **Include subdomains**: Yes (if using www)
   - **Preload**: No (unless you're sure)
5. **Acknowledge the risks** and click **Enable**

**Warning:** HSTS can't be easily undone. Only enable if you're confident HTTPS is working.

### Step 4: Wait for SSL Certificate Provisioning

Cloudflare automatically provisions SSL certificates for your domains.

**Check certificate status:**
1. Go to **SSL/TLS** → **Edge Certificates**
2. Look for **Edge Certificates** section
3. Status should be "Active"

**Timeline:**
- Usually takes 5-15 minutes
- Can take up to 24 hours in rare cases

## GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to your repository: `https://github.com/sourceman-labs/sourceman-labs.github.io`
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

### Step 2: Configure GitHub Secrets

Your GitHub Actions workflow needs Contentful credentials:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Name | Value |
|------|-------|
| `CONTENTFUL_SPACE_ID` | Your Contentful space ID |
| `CONTENTFUL_ACCESS_TOKEN` | Your Content Delivery API token |

**Where to find these:**
- Log in to Contentful
- Go to Settings → API keys
- Copy the Space ID and Delivery API token

### Step 3: Verify CNAME File

Your repository should have a `CNAME` file in the root containing:

```
sourceman.se
```

**Important:** Only the primary domain goes in the CNAME file, not both domains.

**Check the file:**
```bash
cat CNAME
# Output: sourceman.se
```

If it's incorrect:
```bash
echo "sourceman.se" > CNAME
git add CNAME
git commit -m "Update CNAME to primary domain"
git push origin main
```

### Step 4: Push and Deploy

```bash
# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Setup dual-domain configuration with Cloudflare"

# Push to trigger deployment
git push origin main
```

**Monitor deployment:**
1. Go to **Actions** tab in your repository
2. You'll see a workflow run in progress
3. Wait for it to complete (green checkmark)

### Step 5: Configure Custom Domain in GitHub

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter `sourceman.se`
3. Click **Save**
4. Wait for DNS check to complete (green checkmark)
5. Check **Enforce HTTPS** (after DNS check passes)

**This step tells GitHub Pages to serve your site at sourceman.se.**

## Testing

### Test 1: Verify Primary Domain (sourceman.se)

Open your browser and visit:

```
https://sourceman.se
```

**Expected result:**
- ✅ Site loads correctly
- ✅ HTTPS padlock is visible
- ✅ URL stays as `sourceman.se`
- ✅ Certificate is valid (click padlock to check)

### Test 2: Verify Secondary Domain Redirect (magnuskallman.se)

Open your browser and visit:

```
https://magnuskallman.se
```

**Expected result:**
- ✅ Immediately redirects to `https://sourceman.se`
- ✅ URL in address bar changes to `sourceman.se`
- ✅ Site content loads correctly

### Test 3: Verify Path Preservation

Visit a specific path on the secondary domain:

```
https://magnuskallman.se/posts/hello-world/
```

**Expected result:**
- ✅ Redirects to `https://sourceman.se/posts/hello-world/`
- ✅ Path is preserved in the redirect
- ✅ Post loads correctly

### Test 4: Verify HTTP to HTTPS Redirect

Visit the non-HTTPS version:

```
http://sourceman.se
```

**Expected result:**
- ✅ Automatically redirects to `https://sourceman.se`
- ✅ HTTPS padlock appears

### Test 5: Check Redirect Type (301)

Use curl to verify it's a permanent redirect:

```bash
curl -I https://magnuskallman.se
```

**Expected output:**
```
HTTP/2 301
location: https://sourceman.se/
```

**Key things to check:**
- Status code is `301` (permanent redirect)
- `location` header points to `https://sourceman.se/`

### Test 6: Verify www Subdomains (if configured)

If you set up www subdomains:

```
https://www.sourceman.se → https://sourceman.se
https://www.magnuskallman.se → https://sourceman.se
```

### Test from Different Locations

Use online tools to test from different geographic locations:

- **DNS Propagation**: [whatsmydns.net](https://www.whatsmydns.net/)
- **HTTP Headers**: [httpstatus.io](https://httpstatus.io/)
- **SSL Checker**: [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)

## Troubleshooting

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN"

**Meaning:** Domain doesn't resolve (can't find DNS records)

**Solutions:**

1. **Check nameservers are updated:**
   ```bash
   dig NS sourceman.se
   # Should show Cloudflare nameservers
   ```

2. **Wait for propagation:**
   - DNS changes take time (up to 48 hours)
   - Check propagation: [whatsmydns.net](https://www.whatsmydns.net/)

3. **Verify DNS records in Cloudflare:**
   - Go to DNS → Records
   - Ensure A records exist and are correct

### Issue: SSL Certificate Invalid or Missing

**Meaning:** HTTPS doesn't work or shows security warning

**Solutions:**

1. **Wait for certificate provisioning:**
   - Can take 5-15 minutes after DNS setup
   - Check status in Cloudflare: SSL/TLS → Edge Certificates

2. **Verify SSL/TLS mode:**
   - Should be set to "Full (strict)"
   - Go to SSL/TLS → Overview

3. **Check GitHub Pages HTTPS:**
   - Go to repository Settings → Pages
   - "Enforce HTTPS" should be checked

4. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`

### Issue: Redirect Loop (ERR_TOO_MANY_REDIRECTS)

**Meaning:** Page keeps redirecting infinitely

**Solutions:**

1. **Check SSL/TLS mode:**
   - Should NOT be "Flexible"
   - Change to "Full (strict)"

2. **Verify Page Rule configuration:**
   - Destination should be `https://sourceman.se/$1` (with https)
   - URL match should be `*magnuskallman.se/*` (no https in pattern)

3. **Disable Always Use HTTPS temporarily:**
   - Test if redirect loop stops
   - If so, conflict between Page Rule and Always Use HTTPS

4. **Check for conflicting redirects:**
   - Only one Page Rule should redirect magnuskallman.se
   - No redirect rules for sourceman.se

### Issue: Redirect Works but Loses Path

**Problem:** `magnuskallman.se/about` → `sourceman.se/` (loses /about)

**Solution:**

1. **Check Page Rule destination includes $1:**
   ```
   https://sourceman.se/$1  ✅ Correct
   https://sourceman.se     ❌ Incorrect
   ```

2. **Verify URL match pattern includes wildcard:**
   ```
   *magnuskallman.se/*      ✅ Correct
   magnuskallman.se         ❌ Incorrect
   ```

### Issue: GitHub Pages Shows 404 for sourceman.se

**Problem:** Site loads at sourceman-labs.github.io but not sourceman.se

**Solutions:**

1. **Check CNAME file:**
   ```bash
   cat CNAME
   # Should output: sourceman.se
   ```

2. **Verify custom domain in GitHub Pages settings:**
   - Settings → Pages → Custom domain
   - Should show `sourceman.se` with green checkmark

3. **Wait for DNS check:**
   - GitHub verifies DNS records
   - Can take 10-30 minutes

4. **Check DNS records point to GitHub:**
   ```bash
   dig A sourceman.se
   # Should show GitHub Pages IPs
   ```

### Issue: magnuskallman.se Shows GitHub 404 Instead of Redirecting

**Problem:** magnuskallman.se reaches GitHub but shows 404 page

**Cause:** Cloudflare Page Rule not active or not configured correctly

**Solutions:**

1. **Verify Page Rule is active:**
   - Cloudflare dashboard → Rules → Page Rules
   - Rule should have green "Active" status

2. **Check Page Rule priority:**
   - Page Rules execute top to bottom
   - Ensure your redirect rule is at the top

3. **Verify proxy status:**
   - DNS records for magnuskallman.se should be "Proxied" (orange cloud)
   - If "DNS Only" (gray cloud), Page Rules won't work

4. **Wait for Page Rule activation:**
   - Can take 1-2 minutes after saving
   - Clear browser cache and try again

### Issue: Mixed Content Warnings

**Problem:** Page loads but some resources show as insecure

**Solutions:**

1. **Enable "Automatic HTTPS Rewrites":**
   - Cloudflare: SSL/TLS → Edge Certificates
   - Toggle "Automatic HTTPS Rewrites" to On

2. **Check your code for http:// URLs:**
   - All resource URLs should use https:// or be protocol-relative (//)

### Issue: Slow DNS Propagation

**Problem:** Changes taking longer than 24 hours

**Solutions:**

1. **Check registrar nameservers:**
   ```bash
   dig NS sourceman.se @8.8.8.8
   # Should show Cloudflare nameservers
   ```

2. **Contact GoDaddy support:**
   - Sometimes manual intervention needed
   - They can expedite nameserver updates

3. **Use different DNS resolver:**
   - Your ISP's DNS might be cached
   - Try Cloudflare DNS (1.1.1.1) or Google DNS (8.8.8.8)

## Advanced Configuration

### Wildcard Subdomains

To redirect ALL subdomains of magnuskallman.se:

**Page Rule URL match:**
```
*magnuskallman.se/*
```

This already covers:
- `blog.magnuskallman.se`
- `www.magnuskallman.se`
- Any other subdomain

### Redirect to Specific Path

To redirect magnuskallman.se to a specific page on sourceman.se:

**Page Rule destination:**
```
https://sourceman.se/about
```

(Remove `$1` to discard the original path)

### Temporary Redirect (302)

For testing or temporary redirects:

**Page Rule setting:**
- Select **302 - Temporary Redirect** instead of 301

**Use cases:**
- Testing before making permanent
- Temporary maintenance redirects

**Note:** For SEO, use 301 permanent redirect for domain changes.

### Analytics and Monitoring

**Cloudflare Analytics:**
1. Go to **Analytics & Logs** → **Traffic**
2. View requests, bandwidth, threats blocked
3. Filter by domain to see magnuskallman.se vs sourceman.se traffic

**Google Analytics:**
- Add GA tracking code to `_includes/layouts/base.njk`
- Set up separate properties for each domain (optional)
- Use filters to combine data

### Performance Optimization

**Enable Cloudflare Performance Features:**

1. **Auto Minify:**
   - Go to **Speed** → **Optimization**
   - Enable minification for HTML, CSS, JavaScript

2. **Brotli Compression:**
   - Go to **Speed** → **Optimization**
   - Enable Brotli (better than gzip)

3. **Rocket Loader™:**
   - Defers JavaScript loading
   - May break some scripts - test thoroughly

4. **Caching:**
   - Go to **Caching** → **Configuration**
   - Set caching level to "Standard"
   - Browser cache TTL: 4 hours (recommended)

## Next Steps

Once your dual-domain setup is complete:

1. **Test thoroughly** - Visit all URLs and paths
2. **Monitor analytics** - Check Cloudflare for traffic insights
3. **Update DNS TTL** - After confirming everything works, you can keep TTL on Auto
4. **Setup monitoring** - Use uptime monitoring (e.g., UptimeRobot)
5. **Configure webhooks** - Auto-deploy from Contentful (see main README)
6. **Optimize performance** - Enable Cloudflare speed features
7. **Monitor SSL expiry** - Cloudflare auto-renews, but check periodically

## Additional Resources

- **Cloudflare Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)
- **GitHub Pages Docs**: [docs.github.com/pages](https://docs.github.com/pages)
- **DNS Propagation Checker**: [whatsmydns.net](https://www.whatsmydns.net/)
- **SSL Test**: [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
- **Main README**: [../README.md](../README.md)
- **Local Development**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Security Guidelines**: [../SECURITY.md](../SECURITY.md)

## Summary

You now have:
- ✅ Both domains pointing to GitHub Pages via Cloudflare
- ✅ magnuskallman.se redirecting to sourceman.se with 301
- ✅ SSL/TLS encryption on both domains
- ✅ Path preservation in redirects
- ✅ SEO-friendly permanent redirect

This setup is:
- **Free** - No hosting or redirect service costs
- **Fast** - Edge-level redirects via Cloudflare
- **Secure** - SSL/TLS encryption end-to-end
- **Reliable** - GitHub Pages + Cloudflare uptime
- **Scalable** - Handles traffic spikes automatically
