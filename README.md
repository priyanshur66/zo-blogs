# zo-blogs: Tokenized Blogging Platform

**The first decentralized blogging platform where every post becomes a tradeable cryptocurrency coin.**

## 🚀 Overview

zo-blogs revolutionizes content creation by tokenizing every blog post as an ERC-20 token on the Zora Protocol. Writers can publish content that automatically becomes tradeable digital assets, while readers can invest in content they believe in. This creates a new creator economy where quality content generates lasting financial value for both creators and supporters.

## 🛠 Zora Integration Code

Browse this file for helper functions that handle minting, pricing, and trading post-coins via the Zora Protocol. <a href="./src/utils/zora.ts"><code>src/utils/zora.ts</code></a> 
## ✨ Key Features

### 🔗 **Tokenized Content**
- Every blog post becomes a unique ERC-20 token
- Automatic metadata creation and IPFS storage
- Decentralized, censorship-resistant content storage
- Generated coin symbols based on post title + author

### 💰 **Creator Monetization**
- Direct earnings from token sales
- Trading fees on secondary markets
- No platform lock-in - content exists independently
- Aligned incentives where popular content creates value

### 📈 **Trading & Investment**
- Real-time market data for each post coin
- Buy/sell interface integrated into post views
- Market cap, volume, and holder analytics
- Slippage protection and safety validations

### 🎨 **Modern User Experience**
- Responsive design built with Tailwind CSS
- Wallet-first architecture using RainbowKit
- Content discovery with filtering (All, New, Trending)
- Image upload with automatic placeholder generation

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Zora Protocol on Base network
- **Wallet Integration**: RainbowKit + WalletConnect
- **State Management**: React hooks + local storage
- **File Storage**: IPFS via Zora uploader
- **Token Creation**: Zora Coins SDK
- **Trading**: Zora trading infrastructure

## 🏗 Architecture

### Core Components
- **Homepage**: Landing page with value proposition
- **Write Page**: Content creation and tokenization
- **Discover Page**: Platform-specific post discovery
- **Post Detail**: Individual post view with trading interface
- **Header**: Navigation and wallet connection

### Key Utilities
- **Zora Integration**: Token creation, metadata management
- **Platform Registry**: Local tracking of zo-blogs posts
- **Trading Functions**: Buy/sell with validation
- **User Management**: Creator coin tracking

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Web3 wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd 02
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key
NEXT_PUBLIC_PLATFORM_ADDRESS=your_platform_address
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID from [WalletConnect Dashboard](https://walletconnect.com/) | Yes |
| `NEXT_PUBLIC_ZORA_API_KEY` | Zora API key for enhanced functionality | Optional |
| `NEXT_PUBLIC_PLATFORM_ADDRESS` | Platform address for referrer fees | Optional |

## 📖 Usage Guide

### Creating a Post
1. Connect your wallet using the "Connect Wallet" button
2. Navigate to the "Write" page
3. Enter post title and content
4. Optionally upload a featured image
5. Click "Create Post Coin" to tokenize and publish

### Discovering Content
1. Visit the "Discover" page
2. Browse posts with filtering options:
   - **All**: All platform posts
   - **New**: Recently created posts
   - **Trending**: Posts with highest trading volume

### Trading Post Coins
1. Click on any post to view details
2. Connect your wallet if not already connected
3. Enter trade amount and select Buy/Sell
4. Review trading warnings and market data
5. Confirm transaction in your wallet

### Platform Features
- **Market Data**: Real-time trading metrics
- **Creator Analytics**: Track your post performance
- **Decentralized Storage**: Content lives on IPFS
- **Cross-Platform**: Works on desktop and mobile

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── page.tsx           # Homepage
│   ├── write/page.tsx     # Content creation
│   ├── discover/page.tsx  # Content discovery
│   └── post/[id]/page.tsx # Post details
├── components/            # Reusable components
│   └── Header.tsx        # Navigation header
├── providers/            # Context providers
│   └── RainbowKitProvider.tsx
└── utils/               # Utility functions
    └── zora.ts         # Zora protocol integration
```

### Key Functions
- `createPostCoin()`: Tokenize a blog post
- `fetchPlatformPosts()`: Get all platform posts
- `fetchPostDetails()`: Get individual post data
- `tradeCoin()`: Execute buy/sell transactions

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## 🔮 Future Enhancements

- **Liquidity Pools**: Automatic Uniswap V4 integration
- **Social Features**: Comments, likes, follows
- **Analytics Dashboard**: Creator insights and metrics
- **Multi-chain Support**: Deploy on multiple networks
- **Mobile App**: React Native implementation
- **Advanced Trading**: Limit orders, stop losses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Zora Protocol**: [https://zora.co](https://zora.co)
- **Base Network**: [https://base.org](https://base.org)
- **RainbowKit**: [https://rainbowkit.com](https://rainbowkit.com)
- **Next.js**: [https://nextjs.org](https://nextjs.org)

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed description
3. Join our community discussions

---

**Built with ❤️ for the future of decentralized content creation**
