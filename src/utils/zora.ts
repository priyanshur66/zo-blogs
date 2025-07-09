import { 
  createCoin, 
  createMetadataBuilder, 
  createZoraUploaderForCreator,
  DeployCurrency,
  getCoin,
  getCoinsNew,
  getCoinsTopGainers,
  getCoinsTopVolume24h,
  getProfile,
  getProfileBalances,
  setApiKey
} from '@zoralabs/coins-sdk';
import { Address, WalletClient, PublicClient } from 'viem';
import { base } from 'viem/chains';

// Platform constants
export const PLATFORM_ADDRESS = (process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
export const PLATFORM_NAME = "zo-blogs";

// Set up Zora API key if available
if (process.env.NEXT_PUBLIC_ZORA_API_KEY) {
  setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY);
}

// Generate coin symbol from title and author
export function generateCoinSymbol(title: string, authorAddress: string): string {
  const titlePart = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const authorPart = authorAddress.slice(2, 6).toUpperCase();
  return `${titlePart}${authorPart}`;
}

// Create a default placeholder image when no image is provided
async function createPlaceholderImage(title: string): Promise<File> {
  // Create a simple SVG placeholder
  const svgContent = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#666">
        ${title.length > 20 ? title.substring(0, 20) + '...' : title}
      </text>
      <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">
        Blog Post
      </text>
    </svg>
  `;
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  return new File([blob], 'placeholder.svg', { type: 'image/svg+xml' });
}

// Create post metadata for Zora
export async function createPostMetadata(
  title: string,
  content: string,
  authorAddress: Address,
  featuredImage?: File
) {
  const coinName = `Post: ${title}`;
  const coinSymbol = generateCoinSymbol(title, authorAddress);
  const description = `${content.substring(0, 200)}${content.length > 200 ? '...' : ''} | Published on ${PLATFORM_NAME}`;

  console.log('Creating metadata with:', {
    coinName,
    coinSymbol,
    description: description.substring(0, 100) + '...',
    hasImage: !!featuredImage
  });

  // Use provided image or create a placeholder
  let imageToUse = featuredImage;
  if (!featuredImage) {
    console.log('No image provided, creating placeholder image...');
    imageToUse = await createPlaceholderImage(title);
  }

  const builder = createMetadataBuilder()
    .withName(coinName)
    .withSymbol(coinSymbol)
    .withDescription(description)
    .withImage(imageToUse); // Always provide an image (real or placeholder)

  console.log('Uploading metadata to IPFS...');
  return builder.upload(createZoraUploaderForCreator(authorAddress));
}

// Create a coin for a blog post
export async function createPostCoin(
  title: string,
  content: string,
  authorAddress: Address,
  walletClient: WalletClient,
  publicClient: PublicClient,
  featuredImage?: File
) {
  try {
    console.log('Creating post coin for:', title);
    console.log('Has image:', !!featuredImage);
    
    // Generate coin symbol
    const coinSymbol = generateCoinSymbol(title, authorAddress);
    
    // Create metadata
    const { createMetadataParameters } = await createPostMetadata(
      title,
      content,
      authorAddress,
      featuredImage
    );

    console.log('Metadata created successfully');

    // Create coin parameters
    const coinParams = {
      ...createMetadataParameters,
      payoutRecipient: authorAddress,
      platformReferrer: PLATFORM_ADDRESS,
      currency: DeployCurrency.ETH,
      chainId: base.id,
    };

    console.log('Creating coin with params:', coinParams);

    // Create the coin
    const result = await createCoin(coinParams, walletClient, publicClient);
    
    console.log('Coin created successfully:', result);

    // Store in platform registry
    const platformCoin: PlatformCoin = {
      address: result.address,
      creator: authorAddress,
      title: title,
      createdAt: new Date().toISOString(),
      symbol: coinSymbol,
      transactionHash: result.hash
    };
    
    addPlatformCoin(platformCoin);
    console.log('Coin added to platform registry');
    
    return result;
  } catch (error) {
    console.error('Failed to create post coin:', error);
    console.error('Full error object:', error);
    throw error;
  }
}

// Platform coin registry interfaces
export interface PlatformCoin {
  address: string;
  creator: string;
  title: string;
  createdAt: string;
  symbol: string;
  transactionHash: string;
}

export interface PlatformRegistry {
  coins: PlatformCoin[];
  lastUpdated: string;
}

// Storage management for user coins
export interface UserPostCoins {
  [walletAddress: string]: {
    createdCoins: string[];
    lastUpdated: string;
  };
}

export function getUserPostCoins(address: string): string[] {
  const userCoins = JSON.parse(localStorage.getItem('userPostCoins') || '{}') as UserPostCoins;
  return userCoins[address]?.createdCoins || [];
}

export function addUserPostCoin(address: string, coinAddress: string): void {
  const userCoins = JSON.parse(localStorage.getItem('userPostCoins') || '{}') as UserPostCoins;
  
  if (!userCoins[address]) {
    userCoins[address] = { createdCoins: [], lastUpdated: new Date().toISOString() };
  }
  
  userCoins[address].createdCoins.push(coinAddress);
  userCoins[address].lastUpdated = new Date().toISOString();
  
  localStorage.setItem('userPostCoins', JSON.stringify(userCoins));
}

// Platform registry management functions
export function getPlatformRegistry(): PlatformRegistry {
  const registryData = localStorage.getItem('platformRegistry');
  if (!registryData) {
    return { coins: [], lastUpdated: new Date().toISOString() };
  }
  
  try {
    return JSON.parse(registryData) as PlatformRegistry;
  } catch (error) {
    console.error('Error parsing platform registry:', error);
    return { coins: [], lastUpdated: new Date().toISOString() };
  }
}

export function addPlatformCoin(coin: PlatformCoin): void {
  const registry = getPlatformRegistry();
  
  // Check if coin already exists (prevent duplicates)
  const existingCoin = registry.coins.find(c => c.address === coin.address);
  if (existingCoin) {
    console.log('Coin already exists in platform registry:', coin.address);
    return;
  }
  
  registry.coins.push(coin);
  registry.lastUpdated = new Date().toISOString();
  
  localStorage.setItem('platformRegistry', JSON.stringify(registry));
  console.log('Added coin to platform registry:', coin);
}

export function getPlatformCoins(): PlatformCoin[] {
  const registry = getPlatformRegistry();
  return registry.coins;
}

// Debug helper functions
export function debugPlatformRegistry(): void {
  const registry = getPlatformRegistry();
  console.log('=== Platform Registry Debug ===');
  console.log('Total coins:', registry.coins.length);
  console.log('Last updated:', registry.lastUpdated);
  console.log('Coins:', registry.coins);
  console.log('Raw localStorage data:', localStorage.getItem('platformRegistry'));
  console.log('==============================');
}

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  (window as any).debugPlatformRegistry = debugPlatformRegistry;
}

// Legacy function - no longer needed since we track platform coins directly
// Keeping for backwards compatibility but always returns false
export function isBlogPostCoin(coin: any): boolean {
  return false;
}

// Fetch platform-specific posts from Zora
export async function fetchPlatformPosts() {
  try {
    console.log('Fetching platform-specific posts...');
    
    // Get all coins created on this platform
    const platformCoins = getPlatformCoins();
    console.log('Platform coins found:', platformCoins.length);
    
    if (platformCoins.length === 0) {
      console.log('No platform coins found');
      return [];
    }

    // Query Zora for current data of each platform coin
    console.log('Querying Zora for platform coin details...');
    const coinDetailsPromises = platformCoins.map(async (platformCoin) => {
      try {
        console.log(`Fetching details for coin: ${platformCoin.address}`);
        const coinResponse = await getCoin({
          address: platformCoin.address,
          chain: base.id
        });

        if (coinResponse.data?.zora20Token) {
          // Return in the same format as the old discover function
          return {
            node: {
              ...coinResponse.data.zora20Token,
              // Ensure we have the local metadata if Zora doesn't have complete info
              name: coinResponse.data.zora20Token.name || `Post: ${platformCoin.title}`,
              createdAt: coinResponse.data.zora20Token.createdAt || platformCoin.createdAt,
            }
          };
        } else {
          console.warn(`No data found for coin: ${platformCoin.address}`);
          // Return cached data if Zora query fails
          return {
            node: {
              address: platformCoin.address,
              name: `Post: ${platformCoin.title}`,
              symbol: platformCoin.symbol,
              creatorAddress: platformCoin.creator,
              createdAt: platformCoin.createdAt,
              description: `${platformCoin.title} | Published on ${PLATFORM_NAME}`,
              marketCap: '0',
              volume24h: '0',
              uniqueHolders: 0,
              totalSupply: '0'
            }
          };
        }
      } catch (error) {
        console.error(`Error fetching coin ${platformCoin.address}:`, error);
        // Return cached data on error
        return {
          node: {
            address: platformCoin.address,
            name: `Post: ${platformCoin.title}`,
            symbol: platformCoin.symbol,
            creatorAddress: platformCoin.creator,
            createdAt: platformCoin.createdAt,
            description: `${platformCoin.title} | Published on ${PLATFORM_NAME}`,
            marketCap: '0',
            volume24h: '0',
            uniqueHolders: 0,
            totalSupply: '0'
          }
        };
      }
    });

    const coinDetails = await Promise.all(coinDetailsPromises);
    console.log('Successfully fetched platform posts:', coinDetails.length);
    
    return coinDetails.filter(detail => detail !== null);
  } catch (error) {
    console.error('Failed to fetch platform posts:', error);
    console.error('Error details:', error);
    return [];
  }
}

// Legacy function - now redirects to platform-specific posts
export async function fetchDiscoverPosts(limit: number = 20) {
  console.log('Redirecting to platform-specific posts...');
  return fetchPlatformPosts();
}

// Fetch post details by coin address
export async function fetchPostDetails(coinAddress: string) {
  try {
    const coinResponse = await getCoin({
      address: coinAddress,
      chain: base.id
    });

    const coin = coinResponse.data?.zora20Token;
    if (!coin) {
      throw new Error('Coin not found');
    }

    // Get metadata from IPFS
    let metadata = null;
    try {
      const metadataResponse = await fetch(coin.uri);
      metadata = await metadataResponse.json();
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }

    return {
      post: {
        title: metadata?.name?.replace('Post: ', '') || coin.name?.replace('Post: ', ''),
        content: metadata?.description || coin.description || '',
        author: coin.creatorAddress,
        createdAt: coin.createdAt,
        image: metadata?.image
      },
      coin: {
        address: coin.address,
        symbol: coin.symbol,
        marketCap: coin.marketCap,
        volume24h: coin.volume24h,
        holders: coin.uniqueHolders,
        totalSupply: coin.totalSupply,
        uri: coin.uri
      }
    };
  } catch (error) {
    console.error('Failed to fetch post details:', error);
    throw error;
  }
}

// Fetch user profile and created posts
export async function fetchUserProfile(address: string) {
  try {
    const [profileResponse, balancesResponse] = await Promise.all([
      getProfile({ identifier: address }),
      getProfileBalances({ identifier: address })
    ]);

    const profile = profileResponse.data?.profile;
    const balances = balancesResponse.data?.profile;

    // Filter for coins they created (posts)
    const createdCoins = balances?.coinBalances?.filter(
      (balance: any) => balance.token?.creatorAddress === address && 
                       isBlogPostCoin(balance.token)
    );

    return {
      profile,
      createdPosts: createdCoins || []
    };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return { profile: null, createdPosts: [] };
  }
} 