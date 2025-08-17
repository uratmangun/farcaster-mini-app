import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function FarcasterSDK() {
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Initialize the SDK and signal that the app is ready
        await sdk.actions.ready();
        console.log('Farcaster SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      }
    };

    initializeSDK();
  }, []);

  return null; // This component doesn't render anything
}
