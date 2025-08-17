#!/usr/bin/env node

/**
 * Farcaster Account Association Generator
 *
 * This script generates the required account association data for Farcaster Mini Apps.
 * It creates a JSON Farcaster Signature (JFS) with header, payload, and signature
 * that proves domain ownership to a Farcaster account.
 *
 * Usage: node scripts/generate-farcaster-auth.js
 */

import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Configuration from environment variables
const config = {
  fid: process.env.FARCASTER_FID,
  privateKey: process.env.FARCASTER_PRIVATE_KEY,
  domain: process.env.FARCASTER_DOMAIN,
  manifestPath: process.env.FARCASTER_MANIFEST_PATH || join(__dirname, '../public/.well-known/farcaster.json')
};

/**
 * Validates required environment variables
 */
function validateConfig() {
  const missing = [];
  
  if (!config.fid) missing.push('FARCASTER_FID');
  if (!config.privateKey) missing.push('FARCASTER_PRIVATE_KEY');
  if (!config.domain) missing.push('FARCASTER_DOMAIN');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
}

/**
 * Creates base64 encoded header for JFS
 */
function createHeader(fid, custodyAddress) {
  const header = {
    fid: parseInt(fid),
    type: "custody",
    key: custodyAddress
  };
  
  return Buffer.from(JSON.stringify(header)).toString('base64');
}

/**
 * Creates base64 encoded payload for JFS
 */
function createPayload(domain) {
  const payload = { domain };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Simulates signature creation (placeholder implementation)
 * In a real implementation, this would use the actual private key to sign
 */
function createSignature(header, payload, privateKey) {
  // This is a placeholder implementation
  // In production, you would use the actual Farcaster signing protocol
  const message = header + payload;
  const hash = createHash('sha256').update(message + privateKey).digest('hex');
  
  // Convert to mock signature format (this is NOT a real signature)
  const mockSignature = '0x' + hash + hash.slice(0, 32);
  return Buffer.from(mockSignature).toString('base64');
}

/**
 * Derives custody address from private key (placeholder)
 */
function deriveCustodyAddress(privateKey) {
  // This is a placeholder implementation
  // In production, you would derive the actual Ethereum address from the private key
  const hash = createHash('sha256').update(privateKey).digest('hex');
  return '0x' + hash.slice(0, 40);
}

/**
 * Generates the account association object
 */
function generateAccountAssociation() {
  console.log('🔐 Generating Farcaster account association...');
  
  const custodyAddress = deriveCustodyAddress(config.privateKey);
  const header = createHeader(config.fid, custodyAddress);
  const payload = createPayload(config.domain);
  const signature = createSignature(header, payload, config.privateKey);
  
  return {
    header,
    payload,
    signature
  };
}

/**
 * Updates the farcaster.json manifest file
 */
function updateManifest(accountAssociation) {
  try {
    console.log('📝 Reading existing manifest...');
    const manifestContent = readFileSync(config.manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Update the account association
    manifest.accountAssociation = accountAssociation;
    
    // Update the homeUrl to match the domain from .env
    if (manifest.miniapp) {
      const oldHomeUrl = manifest.miniapp.homeUrl;
      manifest.miniapp.homeUrl = config.domain;
      
      if (oldHomeUrl !== config.domain) {
        console.log('🔄 Syncing homeUrl with domain from .env:');
        console.log(`   ${oldHomeUrl} → ${config.domain}`);
      }
    }
    
    // Write back to file
    writeFileSync(config.manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('✅ Successfully updated farcaster.json manifest');
    console.log(`   File: ${config.manifestPath}`);
    
    return manifest;
  } catch (error) {
    console.error('❌ Error updating manifest:', error.message);
    process.exit(1);
  }
}

/**
 * Displays the generated data for verification
 */
function displayResults(accountAssociation, manifest) {
  console.log('\n🎉 Account Association Generated Successfully!');
  console.log('\n📋 Generated Data:');
  console.log('   FID:', config.fid);
  console.log('   Domain:', config.domain);
  console.log('   Header:', accountAssociation.header);
  console.log('   Payload:', accountAssociation.payload);
  console.log('   Signature:', accountAssociation.signature.slice(0, 32) + '...');
  
  console.log('\n🔍 Verification:');
  console.log('   1. Check that your domain matches exactly:', config.domain);
  console.log('   2. Verify your FID is correct:', config.fid);
  console.log('   3. Test your manifest at: https://warpcast.com/~/developers/mini-apps');
  
  console.log('\n⚠️  Important Notes:');
  console.log('   - This script uses placeholder signature generation');
  console.log('   - For production use, implement proper Farcaster signing');
  console.log('   - Verify domain ownership before deploying');
  console.log('   - Use the official Warpcast tool for production signatures');
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Farcaster Account Association Generator\n');
  
  // Validate configuration
  validateConfig();
  
  // Generate account association
  const accountAssociation = generateAccountAssociation();
  
  // Update manifest file
  const manifest = updateManifest(accountAssociation);
  
  // Display results
  displayResults(accountAssociation, manifest);
  
  console.log('\n✨ Done! Your farcaster.json has been updated.');
}

// Run the script
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main();
}

export { generateAccountAssociation, updateManifest };
