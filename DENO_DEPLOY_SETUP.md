# Deno Deploy GitHub Actions Setup Guide

This guide resolves the "You don't have permission to access the project" error when deploying to Deno Deploy via GitHub Actions.

## 1. Generate Deno Deploy Access Token

### Step 1.1: Create a Deno Deploy Account
1. Go to [dash.deno.com](https://dash.deno.com)
2. Sign in with your GitHub account
3. Complete account setup if prompted

### Step 1.2: Generate Access Token
1. Navigate to **Account Settings** → **Access Tokens**
2. Click **"New Access Token"**
3. Configure the token:
   - **Name**: `GitHub Actions - [your-repo-name]`
   - **Expiration**: Choose appropriate duration (90 days recommended)
   - **Scopes**: Select **"All projects"** or specific project access
4. Click **"Create"**
5. **IMPORTANT**: Copy the token immediately - it won't be shown again

### Step 1.3: Note Your Project Name
- If deploying to an existing project, note the exact project name from your Deno Deploy dashboard
- Project names are case-sensitive and must match exactly

## 2. Set Up GitHub Repository Secrets

### Step 2.1: Access Repository Settings
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**

### Step 2.2: Add Required Secrets
Add these repository secrets:

#### `DENO_DEPLOY_TOKEN`
- **Name**: `DENO_DEPLOY_TOKEN`
- **Value**: The access token from Step 1.2
- **Description**: Deno Deploy API access token

#### `DENO_DEPLOY_PROJECT` (Optional)
- **Name**: `DENO_DEPLOY_PROJECT`
- **Value**: Your exact Deno Deploy project name
- **Description**: Target project name (if not set, auto-generated from repo name)

### Step 2.3: Verify Secret Configuration
- Ensure no extra spaces or characters in the token
- Confirm the project name matches exactly (case-sensitive)

## 3. Verify Token Access

### Step 3.1: Test Token Locally (Optional)
```bash
# Install deployctl
deno install -A --global jsr:@deno/deployctl

# Set token environment variable
export DENO_DEPLOY_TOKEN="your-token-here"

# Test token by listing projects
deployctl projects list --token="$DENO_DEPLOY_TOKEN"
```

### Step 3.2: Check Project Permissions
1. In Deno Deploy dashboard, go to your project
2. Check **Settings** → **General** → **Access Control**
3. Ensure your account has **Deploy** permissions

## 4. Troubleshooting Common Issues

### Issue: "Token is not valid"
**Causes:**
- Token expired or revoked
- Token copied incorrectly (extra spaces/characters)
- Token doesn't have required scopes

**Solutions:**
1. Generate a new access token
2. Verify token is copied exactly without extra characters
3. Ensure token has "All projects" scope or specific project access

### Issue: "You don't have permission to access the project"
**Causes:**
- Project name mismatch (case-sensitive)
- Token doesn't have access to the specific project
- Project doesn't exist

**Solutions:**
1. Verify exact project name in Deno Deploy dashboard
2. Check token scopes include the target project
3. Let the workflow auto-create the project (remove `DENO_DEPLOY_PROJECT` secret)

### Issue: "Project not found"
**Causes:**
- Project name typo
- Project was deleted
- Wrong Deno Deploy account

**Solutions:**
1. Double-check project name spelling and case
2. Create project manually in Deno Deploy dashboard
3. Use auto-generated project name (remove `DENO_DEPLOY_PROJECT` secret)

### Issue: Workflow creates new project instead of using existing
**Causes:**
- `DENO_DEPLOY_PROJECT` secret not set
- Project name doesn't match existing project

**Solutions:**
1. Set `DENO_DEPLOY_PROJECT` secret with exact project name
2. Verify project exists in your Deno Deploy dashboard

## 5. Workflow Configuration Notes

### Current Workflow Behavior
- If `DENO_DEPLOY_PROJECT` is set: Uses that exact project name
- If not set: Auto-generates project name from repository name
- Auto-creates project if it doesn't exist

### Recommended Setup
1. **For new projects**: Don't set `DENO_DEPLOY_PROJECT` - let workflow auto-create
2. **For existing projects**: Set `DENO_DEPLOY_PROJECT` to exact project name

### Project Name Generation Rules
- Repository name converted to lowercase
- Non-alphanumeric characters replaced with hyphens
- Leading/trailing hyphens removed
- Maximum 63 characters

## 6. Security Best Practices

### Token Security
- Use tokens with minimal required scopes
- Set reasonable expiration dates (90 days max recommended)
- Rotate tokens regularly
- Never commit tokens to code

### Project Access
- Use project-specific tokens when possible
- Review project permissions regularly
- Remove unused tokens from Deno Deploy dashboard

## 7. Testing Your Setup

### Step 7.1: Trigger Workflow
1. Push changes to your main branch
2. Monitor GitHub Actions workflow execution
3. Check for successful Deno Deploy deployment

### Step 7.2: Verify Deployment
1. Check Deno Deploy dashboard for new deployment
2. Test deployed function endpoints
3. Verify logs show successful deployment

### Step 7.3: Common Success Indicators
- Workflow shows "✅ Deno Deploy successful: [URL]"
- New deployment appears in Deno Deploy dashboard
- Function endpoints respond correctly

## Need Help?

If you're still experiencing issues:
1. Check GitHub Actions logs for specific error messages
2. Verify all secrets are set correctly
3. Confirm token hasn't expired
4. Try regenerating the access token
5. Test with a fresh project name

Remember: Project names are case-sensitive and tokens must have appropriate scopes for the target project.
