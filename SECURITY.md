# Security Policy

## Overview

This document outlines security best practices for the sourceman blog static site generator. As this project handles API credentials and deploys to production, proper security measures are critical.

## Reporting Security Issues

If you discover a security vulnerability, please email security@magnuskallman.se instead of creating a public issue.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and provide updates on the fix timeline.

## Secret Management

### Environment Variables

**Local Development:**
- ✅ **DO**: Store secrets in `.env` file (gitignored)
- ✅ **DO**: Use `.env.example` as a template (no real secrets)
- ❌ **DON'T**: Commit `.env` file to Git
- ❌ **DON'T**: Include secrets in code comments or documentation

**Production (GitHub Actions):**
- ✅ **DO**: Store secrets in GitHub repository secrets
- ✅ **DO**: Use `${{ secrets.SECRET_NAME }}` syntax in workflows
- ❌ **DON'T**: Print secrets to logs
- ❌ **DON'T**: Store secrets in workflow files

### Contentful API Tokens

**Token Types and Scopes:**

| Token Type | Scope | Usage | Risk Level |
|------------|-------|-------|------------|
| Delivery API | Read-only, published content | Production builds | Low |
| Preview API | Read-only, draft content | Development | Low |
| Management API | Read/write, all content | Webhook setup only | **HIGH** |

**Best Practices:**
1. **Use Delivery API for production**: Read-only, published content only
2. **Use Preview API for development**: See draft content without publish
3. **Never commit Management API tokens**: Full read/write access
4. **Rotate tokens every 90 days**: Regenerate and update secrets
5. **Delete unused tokens**: Remove old API keys from Contentful

### GitHub Personal Access Tokens (PAT)

**For Contentful Webhooks:**
- ✅ **DO**: Use token with minimal scope (`public_repo` if public, `repo` if private)
- ✅ **DO**: Create a dedicated token for webhooks
- ✅ **DO**: Set token expiration (90 days recommended)
- ✅ **DO**: Store in Contentful webhook configuration (not in repo)
- ❌ **DON'T**: Use token with broader scopes (e.g., `admin:org`, `delete_repo`)
- ❌ **DON'T**: Share token between multiple services

**Token Rotation:**
1. Generate new PAT with same scopes
2. Update Contentful webhook configuration
3. Verify webhook triggers correctly
4. Delete old PAT

## Git Security

### .gitignore Configuration

The `.gitignore` file must always include:

```gitignore
# Secrets and environment
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
config/local.json

# Sensitive logs
ngrok.log
ngrok.yml
```

### Pre-Commit Checks

Before committing:
1. **Check for secrets**: `git diff --cached | grep -i "api\|token\|secret\|password"`
2. **Review .env**: Ensure `.env` file is not staged
3. **Verify gitignore**: Confirm sensitive files are ignored

### If Secrets Are Accidentally Committed

**Immediate Actions:**
1. **DO NOT** use `git commit --amend` or `git rebase` - history may be pushed already
2. **Rotate ALL exposed secrets immediately**:
   - Regenerate Contentful API tokens
   - Regenerate GitHub PAT
   - Update GitHub repository secrets
   - Update local `.env` file
3. **Remove from Git history**:
   ```bash
   # Use git-filter-repo (recommended)
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths

   # Or use BFG Repo-Cleaner
   bfg --delete-files .env
   ```
4. **Force push** (only if history not pulled by others):
   ```bash
   git push origin main --force
   ```
5. **Notify team members** to re-clone the repository

## API Security

### Contentful API

**Rate Limiting:**
- Contentful enforces rate limits (varies by plan)
- Free tier: ~10 requests/second
- Implement exponential backoff for retries
- Cache responses when possible

**Error Handling:**
- ✅ **DO**: Catch and log API errors
- ✅ **DO**: Fail build if Contentful is unreachable (production)
- ❌ **DON'T**: Expose API errors to users
- ❌ **DON'T**: Log API tokens in error messages

**Content Validation:**
- Validate content types match expected schema
- Sanitize user-generated content (if applicable)
- Check for injection attempts in rich text fields

### GitHub API

**Webhook Security:**
- Use repository_dispatch (requires authentication)
- GitHub automatically validates webhook signatures
- Only trigger safe actions (build and deploy)
- Never execute arbitrary code from webhooks

## Dependency Security

### npm Packages

**Regular Updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

**Automated Security:**
- Enable Dependabot in GitHub repository settings
- Review and merge Dependabot PRs promptly
- Test updates before merging

**Package Verification:**
- Only install packages from npm registry
- Review package popularity and maintenance
- Check for known vulnerabilities before installing

## Build Security

### GitHub Actions

**Workflow Security:**
- ✅ **DO**: Pin action versions (`uses: actions/checkout@v4`)
- ✅ **DO**: Use official actions when possible
- ✅ **DO**: Limit workflow permissions to minimum required
- ❌ **DON'T**: Use `pull_request_target` (unsafe for public repos)
- ❌ **DON'T**: Execute code from untrusted sources

**Secrets in Workflows:**
```yaml
# ✅ GOOD: Secrets in env
env:
  CONTENTFUL_ACCESS_TOKEN: ${{ secrets.CONTENTFUL_ACCESS_TOKEN }}

# ❌ BAD: Secrets in commands (may be logged)
run: curl -H "Authorization: ${{ secrets.TOKEN }}" ...
```

### Content Security Policy (CSP)

Consider adding CSP headers in GitHub Pages (via meta tag):

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               style-src 'self' 'unsafe-inline';
               font-src 'self';
               img-src 'self' https:;
               script-src 'self';">
```

## Security Checklist

### Initial Setup
- [ ] Copy `.env.example` to `.env` (don't commit)
- [ ] Generate Contentful API tokens with minimal scopes
- [ ] Add tokens to `.env` file
- [ ] Verify `.env` is in `.gitignore`
- [ ] Add GitHub repository secrets
- [ ] Test build with secrets

### Before Every Commit
- [ ] Check for secrets in staged files
- [ ] Verify `.env` not staged
- [ ] Review changes for sensitive data
- [ ] Test build locally

### Regular Maintenance (Every 90 Days)
- [ ] Rotate Contentful API tokens
- [ ] Rotate GitHub PAT
- [ ] Update npm dependencies
- [ ] Run security audit (`npm audit`)
- [ ] Review access logs
- [ ] Check for unused tokens

### Production Deployment
- [ ] Verify GitHub secrets are set
- [ ] Test webhook triggers
- [ ] Monitor deployment logs
- [ ] Verify no secrets in logs
- [ ] Test site functionality

## Incident Response

### If Credentials Are Compromised

1. **Immediate** (within 5 minutes):
   - Revoke compromised tokens
   - Generate new tokens
   - Update GitHub secrets
   - Update local `.env`

2. **Short-term** (within 1 hour):
   - Review access logs for unauthorized use
   - Check for unauthorized content changes
   - Verify no malicious code deployed
   - Notify team members

3. **Long-term** (within 24 hours):
   - Document incident
   - Review security practices
   - Implement additional safeguards
   - Update security policy

### If Malicious Content Is Detected

1. **Immediate**:
   - Revert to last known good commit
   - Deploy clean version
   - Investigate source of compromise

2. **Follow-up**:
   - Review all recent content changes
   - Check Contentful audit logs
   - Strengthen content validation
   - Update access controls

## Contact

For security concerns, contact:
- **Email**: security@magnuskallman.se
- **GitHub**: Open a private security advisory

**Response Time:**
- Critical issues: 24 hours
- High severity: 48 hours
- Medium/Low: 1 week

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-10-31 | Initial security policy |

---

**Last Updated**: October 31, 2024
**Next Review**: January 31, 2025
