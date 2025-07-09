# Setup Guide for zo-blogs

## Overview
This application has been upgraded to use Zora Coins SDK to tokenize blog posts. Each post is now minted as a tradeable coin on the Zora protocol.

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# WalletConnect Project ID (required for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Zora API Key (optional but recommended for rate limiting)
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key_here

# Platform address for receiving referral fees (replace with your actual address)
NEXT_PUBLIC_PLATFORM_ADDRESS=0x0000000000000000000000000000000000000000
```

## Setup Instructions

### 1. WalletConnect Project ID
- Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create an account and project
- Copy your Project ID
- Add it to your `.env.local` file

### 2. Zora API Key (Optional but Recommended)
- Go to [Zora](https://zora.co/)
- Create an account or log in
- Navigate to Developer Settings
- Create an API key
- Add it to your `.env.local` file

### 3. Platform Address
- Replace `0x0000000000000000000000000000000000000000` with your actual wallet address
- This address will receive platform referral fees from coin trades

## Key Features

### Post Creation
- Users must connect their wallet to create posts
- Each post is automatically minted as a Zora coin
- Posts are stored on IPFS via Zora's metadata builder
- Coin addresses are stored locally for user reference

### Discovery
- Posts are discovered through Zora's explore APIs
- Shows trending, new, and top volume posts
- Displays market data for each post coin

### Trading
- Users can buy/sell post coins directly from post pages
- Trading fees benefit creators and platform
- Built-in slippage protection

## Important Notes

1. **Network**: The app uses Base mainnet for Zora Coins support
2. **Storage**: No database required - uses localStorage + Zora queries
3. **Tokenomics**: Creators earn from trading fees automatically
4. **Platform Cut**: Configure your platform address to earn referral fees

## Development

```bash
npm install
npm run dev
```

## Deployment

Make sure to set all environment variables in your deployment environment.

## Support

For issues with Zora integration, refer to:
- [Zora Coins SDK Documentation](https://docs.zora.co/docs/guides/coins-sdk)
- [Zora API Documentation](https://docs.zora.co/docs/guides/api) 