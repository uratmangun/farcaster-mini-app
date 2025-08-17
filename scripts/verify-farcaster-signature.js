#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import * as ed25519 from '@noble/ed25519';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure ed25519 to use Node.js crypto for SHA-512
ed25519.etc.sha512Sync = (...m) => createHash('sha512').update(Buffer.concat(m)).digest();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verify Farcaster Account Association Signature
 * 
 * This script verifies if the signature in the farcaster.json manifest
 * matches the domain and other payload data.
 */

function decodeBase64(base64String) {
  try {
    const decoded = Buffer.from(base64String, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Failed to decode Base64:', error.message);
    return null;
  }
}

function hexToBytes(hex) {
  try {
    const cleanHex = hex.replace(/^0x/, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  } catch (error) {
    console.error('❌ Failed to decode hex:', error.message);
    return null;
  }
}

async function verifyAccountAssociation(accountAssociation) {
  console.log('\n🔍 Verifying Account Association...\n');

  // Decode header
  const header = decodeBase64(accountAssociation.header);
  if (!header) {
    console.log('❌ Failed to decode header');
    return false;
  }

  console.log('📋 Header Data:');
  console.log('   FID:', header.fid);
  console.log('   Type:', header.type);
  console.log('   Key:', header.key);

  // Decode payload
  const payload = decodeBase64(accountAssociation.payload);
  if (!payload) {
    console.log('❌ Failed to decode payload');
    return false;
  }

  console.log('\n📋 Payload Data:');
  console.log('   Domain:', payload.domain);

  // Decode signature from base64
  const signatureBytes = Buffer.from(accountAssociation.signature, 'base64');
  console.log('\n📋 Signature Data:');
  console.log('   Signature length:', signatureBytes.length, 'bytes');
  console.log('   Signature (base64):', accountAssociation.signature.slice(0, 32) + '...');

  // Create the message that should have been signed
  const message = accountAssociation.header + '.' + accountAssociation.payload;
  console.log('\n🔐 Verification Details:');
  console.log('   Message to verify:', message.slice(0, 100) + '...');

  // Extract public key from header
  const publicKeyBytes = hexToBytes(header.key);
  if (!publicKeyBytes) {
    console.log('❌ Failed to decode public key');
    return false;
  }

  // Perform Ed25519 signature verification
  let signatureValid = false;
  try {
    const messageBytes = new TextEncoder().encode(message);
    signatureValid = await ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
    
    console.log('\n🔐 Ed25519 Signature Verification:');
    if (signatureValid) {
      console.log('   ✅ Signature verification: VALID');
      console.log('   ✅ This is a real cryptographic signature');
    } else {
      console.log('   ❌ Signature verification: INVALID');
    }
  } catch (error) {
    console.log('\n❌ Signature verification failed:', error.message);
  }

  // Check if domain matches expected format (domain only, no protocol)
  const domainValid = payload.domain && !payload.domain.startsWith('http://') && !payload.domain.startsWith('https://');
  console.log('\n✅ Domain Format Check:');
  console.log('   Domain format valid:', domainValid ? '✅ Yes' : '❌ No');
  console.log('   Domain value:', payload.domain);
  console.log('   Expected format: domain.com (without https://)');

  // Check if FID is present and valid
  const fidValid = header.fid && typeof header.fid === 'number' && header.fid > 0;
  console.log('\n✅ FID Check:');
  console.log('   FID valid:', fidValid ? '✅ Yes' : '❌ No');
  console.log('   FID value:', header.fid);

  return {
    headerValid: !!header,
    payloadValid: !!payload,
    domainFormatValid: domainValid,
    fidValid: fidValid,
    signatureValid: signatureValid,
    signatureFormat: signatureValid ? 'real/ed25519' : 'invalid',
    canVerifySignature: true,
    message: signatureValid ? 'Real Ed25519 signature verified successfully' : 'Signature verification failed'
  };
}

function loadFarcasterManifest() {
  try {
    const manifestPath = path.join(__dirname, '..', 'public', '.well-known', 'farcaster.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    return JSON.parse(manifestContent);
  } catch (error) {
    console.error('❌ Failed to load farcaster.json:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔐 Farcaster Account Association Signature Verifier');
  console.log('=' .repeat(60));

  const manifest = loadFarcasterManifest();
  if (!manifest) {
    process.exit(1);
  }

  if (!manifest.accountAssociation) {
    console.log('❌ No accountAssociation found in manifest');
    process.exit(1);
  }

  const result = await verifyAccountAssociation(manifest.accountAssociation);

  console.log('\n📊 Verification Summary:');
  console.log('=' .repeat(40));
  console.log('Header decoded:', result.headerValid ? '✅' : '❌');
  console.log('Payload decoded:', result.payloadValid ? '✅' : '❌');
  console.log('Domain format:', result.domainFormatValid ? '✅' : '❌');
  console.log('FID valid:', result.fidValid ? '✅' : '❌');
  console.log('Signature verification:', result.signatureValid ? '✅' : '❌');
  console.log('Signature type:', result.signatureFormat);
  console.log('Can verify signature:', result.canVerifySignature ? '✅' : '❌');

  console.log('\n💡 Status:');
  if (result.signatureValid) {
    console.log('   ✅ This is a production-ready signature');
    console.log('   ✅ Ed25519 cryptographic verification passed');
    console.log('   ✅ Ready for Farcaster Mini App deployment');
    console.log('   🔗 Test your manifest at: https://warpcast.com/~/developers/mini-apps');
  } else {
    console.log('   ❌ Signature verification failed');
    console.log('   🔧 Check your private key and regenerate if needed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyAccountAssociation, decodeBase64 };
