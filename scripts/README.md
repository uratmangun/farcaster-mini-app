# Farcaster Account Association Generator

This script automatically generates the required account association data for your Farcaster Mini App manifest.

## Scripts

Utility scripts for Farcaster Mini App development.

## generate-images.js

Generates abstract images for your Farcaster Mini App using the AIML API.

### Features
- Reads app name from `public/.well-known/farcaster.json`
- Generates 3 images with appropriate aspect ratios:
  - **App Icon** (1:1) - Square icon for `iconUrl`
  - **OG Image** (16:9) - Social sharing image for `imageUrl`  
  - **Splash Screen** (9:16) - Portrait splash screen for `splashImageUrl`
- Downloads and saves images to the `public/` folder
- Includes app name as text overlay in abstract designs

### Usage

1. Set your AIML API key:
```bash
set -x AIML_API_KEY "your-api-key-here"
```

2. Run the script:
```bash
node scripts/generate-images.js
```

3. Generated images will be saved to:
   - `public/app-icon.png` - App icon
   - `public/og-image.png` - OG/sharing image
   - `public/splash-screen.png` - Splash screen

4. Update your `farcaster.json` with the new image URLs after deployment.

### Requirements
- Node.js
- AIML API key (get one from https://aimlapi.com)
- Internet connection for API calls and image downloads

## Overview

The Farcaster account association proves domain ownership to a Farcaster account using a cryptographically signed message. This is required for:
- Verifying your Mini App authorship
- Enabling Warpcast Developer Rewards
- Publishing your app in Farcaster discovery surfaces

## Prerequisites

1. **Farcaster Account**: You need an active Farcaster account
2. **FID (Farcaster ID)**: Find this in your Farcaster profile
3. **Private Key**: Your custody address private key (get from Warpcast Developer Tools)
4. **Domain**: The exact domain where your Mini App will be hosted

## Setup

### 1. Configure Environment Variables

Copy the example environment file and fill in your Farcaster details:

```bash
cp .env.example .env
```

Edit `.env` and add your Farcaster information:

```bash
# Your Farcaster ID (found in your profile)
FARCASTER_FID=3621

# Your custody address private key (without 0x prefix)
FARCASTER_PRIVATE_KEY=your_private_key_here

# Your exact domain (no trailing slash)
FARCASTER_DOMAIN=myapp.com
```

### 2. Get Your Farcaster Credentials

#### Option A: Use Warpcast Developer Tools (Recommended)
1. Go to [Warpcast Mini App Developer Tools](https://warpcast.com/~/developers/mini-apps)
2. Enter your domain name
3. Sign the message with your Farcaster account
4. Copy the generated credentials to your `.env` file

#### Option B: Manual Setup
1. **Find your FID**: Check your Farcaster profile URL or use Farcaster APIs
2. **Get Private Key**: Export from your Farcaster custody wallet
3. **Set Domain**: Use the exact domain where you'll host the app

## Usage

### Basic Usage

Run the script to generate and update your `farcaster.json`:

```bash
node scripts/generate-farcaster-auth.js
```

### Custom Manifest Path

If your manifest file is in a different location:

```bash
FARCASTER_MANIFEST_PATH=/path/to/custom/farcaster.json node scripts/generate-farcaster-auth.js
```

## What the Script Does

1. **Validates Configuration**: Checks that all required environment variables are set
2. **Generates Header**: Creates base64-encoded JFS header with your FID and custody address
3. **Creates Payload**: Generates base64-encoded domain payload
4. **Signs Message**: Creates cryptographic signature (placeholder implementation)
5. **Updates Manifest**: Automatically updates your `public/.well-known/farcaster.json` file

## Output

The script will update your `farcaster.json` file with the account association:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjM2MjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Q4NWEwOTMyNjFmNTkyNzA4MDRBNkVBNjk3Q2VBNENlQkVjYWZFIn0",
    "payload": "eyJkb21haW4iOiJ5b2luay5wYXJ0eSJ9",
    "signature": "MHgwZmJiYWIwODg3YTU2MDFiNDU3MzVkOTQ5MDRjM2Y1NGUxMzVhZTQxOGEzMWQ5ODNhODAzZmZlYWNlZWMyZDYz..."
  },
  "miniapp": {
    // ... existing miniapp configuration
  }
}
```

## Important Security Notes

⚠️ **SECURITY WARNING**: 
- Never commit your private key to version control
- Keep your `.env` file secure and add it to `.gitignore`
- The current script uses placeholder signature generation
- For production use, implement proper Farcaster signing or use official tools

## Production Deployment

### For Production Apps:
1. Use the official [Warpcast Developer Tools](https://warpcast.com/~/developers/mini-apps) for real signatures
2. Verify your domain ownership matches exactly
3. Test your manifest at: https://warpcast.com/~/developers/mini-apps

### Domain Requirements:
- Domain must match exactly (case-sensitive)
- No trailing slashes
- Include subdomains if applicable (e.g., `app.mydomain.com`)
- Use the same domain in both environment variable and hosting

## Troubleshooting

### Common Issues:

**"Missing required environment variables"**
- Ensure all Farcaster variables are set in `.env`
- Check for typos in variable names

**"Domain mismatch"**
- Verify `FARCASTER_DOMAIN` matches your hosting domain exactly
- Remove any trailing slashes or protocols

**"Invalid FID"**
- Confirm your FID is a number (not username)
- Check your Farcaster profile for the correct FID

**"Manifest validation failed"**
- Test your manifest at Warpcast developer tools
- Ensure JSON syntax is valid
- Verify all required fields are present

## Next Steps

After running the script:

1. **Test Locally**: Verify your manifest loads correctly
2. **Deploy**: Push your updated `farcaster.json` to production
3. **Validate**: Use Warpcast tools to verify your manifest
4. **Submit**: Submit your Mini App for review if needed

## Related Files

- `public/.well-known/farcaster.json` - Your Mini App manifest
- `.env` - Environment configuration (not committed)
- `.env.example` - Example environment variables

## Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Warpcast Developer Tools](https://warpcast.com/~/developers/mini-apps)
- [Farcaster Protocol](https://github.com/farcasterxyz/protocol)
