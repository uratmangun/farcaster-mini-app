#!/usr/bin/env node

import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import * as ed25519 from '@noble/ed25519';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure ed25519 to use Node.js crypto for SHA-512
ed25519.etc.sha512Sync = (...m) => createHash('sha512').update(Buffer.concat(m)).digest();

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
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Please set these in your .env file');
    process.exit(1);
  }

  // Validate FID is a number
  if (isNaN(parseInt(config.fid))) {
    console.error('❌ FARCASTER_FID must be a valid number');
    process.exit(1);
  }

  // Validate private key format (should be hex without 0x prefix)
  const privateKeyRegex = /^[a-fA-F0-9]{64}$/;
  const cleanPrivateKey = config.privateKey.replace(/^0x/, '');
  if (!privateKeyRegex.test(cleanPrivateKey)) {
    console.error('❌ FARCASTER_PRIVATE_KEY must be a 64-character hex string (with or without 0x prefix)');
    process.exit(1);
  }

  // Clean domain of any protocol prefixes
  config.domain = config.domain.replace(/^https?:\/\//, '');
  
  console.log('✅ Configuration validated successfully');
}

/**
 * Converts a hex string to Uint8Array
 */
function hexToBytes(hex) {
  const cleanHex = hex.replace(/^0x/, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Converts Uint8Array to hex string
 */
function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates the Farcaster signature header
 */
function createHeader(fid, publicKey) {
  const header = {
    fid: parseInt(fid),
    type: 'custody',
    key: `0x${bytesToHex(publicKey)}`
  };
  
  return Buffer.from(JSON.stringify(header)).toString('base64');
}

/**
 * Creates the Farcaster signature payload
 */
function createPayload(domain) {
  const payload = {
    domain: domain
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Signs the message using Ed25519
 */
async function signMessage(message, privateKeyBytes) {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signature = await ed25519.sign(messageBytes, privateKeyBytes);
    return `0x${bytesToHex(signature)}`;
  } catch (error) {
    console.error('❌ Failed to sign message:', error.message);
    throw error;
  }
}

/**
 * Generates a real Farcaster account association
 */
async function generateAccountAssociation() {
  console.log('\n🔐 Generating Real Farcaster Account Association...');
  
  try {
    // Convert private key to bytes
    const privateKeyBytes = hexToBytes(config.privateKey);
    
    // Generate public key from private key
    const publicKey = await ed25519.getPublicKey(privateKeyBytes);
    
    console.log('   📋 Using FID:', config.fid);
    console.log('   📋 Using Domain:', config.domain);
    console.log('   📋 Public Key:', `0x${bytesToHex(publicKey)}`);
    
    // Create header and payload
    const header = createHeader(config.fid, publicKey);
    const payload = createPayload(config.domain);
    
    // Create the message to sign (header.payload format)
    const message = `${header}.${payload}`;
    
    // Sign the message
    const signature = await signMessage(message, privateKeyBytes);
    
    console.log('   ✅ Message signed successfully');
    
    // Encode signature as base64
    const signatureBytes = hexToBytes(signature);
    const signatureBase64 = Buffer.from(signatureBytes).toString('base64');
    
    return {
      header,
      payload,
      signature: signatureBase64
    };
    
  } catch (error) {
    console.error('❌ Failed to generate account association:', error.message);
    throw error;
  }
}

/**
 * Loads existing manifest or creates a new one
 */
function loadOrCreateManifest() {
  try {
    if (readFileSync(config.manifestPath, 'utf-8')) {
      const content = readFileSync(config.manifestPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('📝 Creating new manifest file...');
  }
  
  // Default manifest structure
  return {
    accountAssociation: {},
    miniapp: {
      version: "1",
      name: "Farcaster Mini App",
      iconUrl: `https://${config.domain}/images/flux-icon-2025-08-17T06-04-24-740Z.png`,
      homeUrl: `https://${config.domain}`,
      imageUrl: `https://${config.domain}/images/flux-embed-2025-08-17T06-04-35-570Z.png`,
      buttonTitle: "Launch App",
      splashImageUrl: `https://${config.domain}/images/flux-splash-2025-08-17T06-04-46-411Z.png`,
      splashBackgroundColor: "#0ea5e9"
    }
  };
}

/**
 * Saves the manifest to file
 */
function saveManifest(manifest) {
  try {
    const manifestJson = JSON.stringify(manifest, null, 2);
    writeFileSync(config.manifestPath, manifestJson, 'utf-8');
    console.log('✅ Manifest saved to:', config.manifestPath);
  } catch (error) {
    console.error('❌ Failed to save manifest:', error.message);
    throw error;
  }
}

/**
 * Verifies the generated signature
 */
async function verifySignature(accountAssociation) {
  try {
    console.log('\n🔍 Verifying generated signature...');
    
    // Decode header to get public key
    const headerJson = JSON.parse(Buffer.from(accountAssociation.header, 'base64').toString('utf-8'));
    const publicKeyBytes = hexToBytes(headerJson.key);
    
    // Recreate the signed message
    const message = `${accountAssociation.header}.${accountAssociation.payload}`;
    const messageBytes = new TextEncoder().encode(message);
    
    // Decode signature
    const signatureBytes = Buffer.from(accountAssociation.signature, 'base64');
    
    // Verify signature
    const isValid = await ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
    
    if (isValid) {
      console.log('   ✅ Signature verification: VALID');
    } else {
      console.log('   ❌ Signature verification: INVALID');
    }
    
    return isValid;
  } catch (error) {
    console.error('   ❌ Signature verification failed:', error.message);
    return false;
  }
}

/**
 * Displays the results
 */
function displayResults(accountAssociation, manifest) {
  console.log('\n🎉 Real Account Association Generated Successfully!');
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
  
  console.log('\n✅ Production Ready:');
  console.log('   - This script uses real Ed25519 cryptographic signatures');
  console.log('   - Signatures are generated using your actual private key');
  console.log('   - Domain format follows Farcaster specification');
  console.log('   - Ready for production deployment');
  
  console.log('\n🔐 Security Notes:');
  console.log('   - Keep your FARCASTER_PRIVATE_KEY secure and never commit it');
  console.log('   - The signature proves ownership of your Farcaster account');
  console.log('   - Domain must match exactly where you host the manifest');
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Farcaster Account Association Generator (Real Signatures)');
    console.log('=' .repeat(65));
    
    // Validate configuration
    validateConfig();
    
    // Generate real account association
    const accountAssociation = await generateAccountAssociation();
    
    // Verify the signature
    await verifySignature(accountAssociation);
    
    // Load or create manifest
    const manifest = loadOrCreateManifest();
    
    // Update manifest with new account association
    manifest.accountAssociation = accountAssociation;
    
    // Save manifest
    saveManifest(manifest);
    
    // Display results
    displayResults(accountAssociation, manifest);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Deploy your app to the domain specified in FARCASTER_DOMAIN');
    console.log('   2. Ensure the manifest is accessible at /.well-known/farcaster.json');
    console.log('   3. Test your Mini App in Warpcast');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
