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
import { Address, WalletClient, PublicClient, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { Token, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { Pool, Position } from '@uniswap/v4-sdk';

// Platform constants
export const PLATFORM_ADDRESS = (process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
export const PLATFORM_NAME = "zo-blogs";

// Uniswap V4 contract addresses on Base
export const UNISWAP_V4_POOL_MANAGER = "0x38EB8B22Df3Ae7fb21e92881151B365Df14ba967" as Address; // Base mainnet
export const UNISWAP_V4_POSITION_MANAGER = "0x1B1C77B606d13b09C84d1c7394B96b147bC03147" as Address; // Base mainnet
export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" as Address; // Base WETH

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

// Create initial liquidity pool for the coin using Uniswap V4
export async function createInitialLiquidityPool(
  coinAddress: Address,
  ethAmount: string, // Amount of ETH to provide (e.g., "0.1")
  tokenAmount: string, // Amount of token to provide (e.g., "1000")
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  try {
    console.log('Creating liquidity pool for coin:', coinAddress);
    console.log('ETH amount:', ethAmount);
    console.log('Token amount:', tokenAmount);

    // Create token instances for SDK
    const token = new Token(
      base.id,
      coinAddress,
      18, // Most ERC20 tokens use 18 decimals
      'COIN',
      'Blog Coin'
    );

    const weth = new Token(
      base.id,
      WETH_ADDRESS,
      18,
      'WETH',
      'Wrapped Ether'
    );

    // Parse amounts
    const ethAmountParsed = parseEther(ethAmount);
    const tokenAmountParsed = parseEther(tokenAmount);

    // Create currency amounts
    const ethCurrencyAmount = CurrencyAmount.fromRawAmount(weth, ethAmountParsed.toString());
    const tokenCurrencyAmount = CurrencyAmount.fromRawAmount(token, tokenAmountParsed.toString());

    console.log('Currency amounts created successfully');

    // Prepare transaction parameters for Uniswap V4 pool creation
    const poolParams = {
      tokenA: coinAddress,
      tokenB: WETH_ADDRESS,
      fee: 3000, // 0.3% fee tier
      tickLower: -887220, // Full range
      tickUpper: 887220,  // Full range
      amount0Desired: tokenAmountParsed,
      amount1Desired: ethAmountParsed,
      amount0Min: (tokenAmountParsed * BigInt(95)) / BigInt(100), // 5% slippage
      amount1Min: (ethAmountParsed * BigInt(95)) / BigInt(100), // 5% slippage
      recipient: walletClient.account?.address,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 1800) // 30 minutes
    };

    console.log('Pool parameters prepared:', poolParams);

    // First, approve the Position Manager to spend tokens
    const tokenApprovalTx = await walletClient.writeContract({
      address: coinAddress,
      abi: [
        {
          name: 'approve',
          type: 'function',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ],
      functionName: 'approve',
      args: [UNISWAP_V4_POSITION_MANAGER, tokenAmountParsed],
      chain: base
    });

    console.log('Token approval transaction:', tokenApprovalTx);

    // Create the pool and add initial liquidity
    const addLiquidityTx = await walletClient.writeContract({
      address: UNISWAP_V4_POSITION_MANAGER,
      abi: [
        {
          name: 'mint',
          type: 'function',
          inputs: [
            { name: 'params', type: 'tuple', components: [
              { name: 'token0', type: 'address' },
              { name: 'token1', type: 'address' },
              { name: 'fee', type: 'uint24' },
              { name: 'tickLower', type: 'int24' },
              { name: 'tickUpper', type: 'int24' },
              { name: 'amount0Desired', type: 'uint256' },
              { name: 'amount1Desired', type: 'uint256' },
              { name: 'amount0Min', type: 'uint256' },
              { name: 'amount1Min', type: 'uint256' },
              { name: 'recipient', type: 'address' },
              { name: 'deadline', type: 'uint256' }
            ]}
          ],
          outputs: [
            { name: 'tokenId', type: 'uint256' },
            { name: 'liquidity', type: 'uint128' },
            { name: 'amount0', type: 'uint256' },
            { name: 'amount1', type: 'uint256' }
          ]
        }
      ],
      functionName: 'mint',
      args: [poolParams],
      value: ethAmountParsed // Send ETH with the transaction
    });

    console.log('Add liquidity transaction:', addLiquidityTx);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: addLiquidityTx });
    console.log('Liquidity pool created successfully:', receipt);

    return {
      success: true,
      transactionHash: addLiquidityTx,
      ethAmount: ethAmount,
      tokenAmount: tokenAmount,
      poolAddress: coinAddress // Pool address will be derived from token addresses
    };
  } catch (error) {
    console.error('Failed to create liquidity pool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Create a coin for a blog post with optional liquidity pool
export async function createPostCoin(
  title: string,
  content: string,
  authorAddress: Address,
  walletClient: WalletClient,
  publicClient: PublicClient,
  featuredImage?: File,
  createLiquidity?: {
    ethAmount: string; // Amount of ETH to provide for liquidity (e.g., "0.1")
    tokenAmount: string; // Amount of tokens to provide for liquidity (e.g., "1000")
  }
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
      // NOTE: This only creates the ERC-20 token contract
      // Trading requires a Uniswap liquidity pool which is NOT created here
      // This is why coins show "0 volume" and trading fails with "Quote failed"
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
    
    // Create liquidity pool if requested
    let liquidityResult = null;
    if (createLiquidity) {
      console.log('Creating initial liquidity pool...');
      liquidityResult = await createInitialLiquidityPool(
        result.address,
        createLiquidity.ethAmount,
        createLiquidity.tokenAmount,
        walletClient,
        publicClient
      );
      
      if (liquidityResult.success) {
        console.log('✅ Liquidity pool created successfully!');
        console.log('Pool details:', liquidityResult);
      } else {
        console.error('❌ Failed to create liquidity pool:', liquidityResult.error);
        // Don't throw error here - coin creation was successful even if liquidity failed
      }
    }
    
    return {
      ...result,
      liquidity: liquidityResult
    };
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
    console.log('=== FETCHING POST DETAILS ===');
    console.log('Coin address:', coinAddress);
    
    const coinResponse = await getCoin({
      address: coinAddress,
      chain: base.id
    });

    console.log('Zora API response:', coinResponse);
    const coin = coinResponse.data?.zora20Token;
    if (!coin) {
      throw new Error('Coin not found');
    }

    console.log('Raw coin data from Zora:', coin);
    
    // Check for trading readiness indicators
    console.log('Trading readiness check:');
    console.log('- Has market cap:', coin.marketCap !== undefined && coin.marketCap !== null);
    console.log('- Market cap value:', coin.marketCap);
    console.log('- Has volume:', coin.volume24h !== undefined && coin.volume24h !== null);
    console.log('- Volume value:', coin.volume24h);
    console.log('- Has holders:', coin.uniqueHolders !== undefined && coin.uniqueHolders !== null);
    console.log('- Holders count:', coin.uniqueHolders);
    console.log('- Total supply:', coin.totalSupply);

    // Get metadata from IPFS
    let metadata = null;
    try {
      const metadataResponse = await fetch(coin.uri);
      metadata = await metadataResponse.json();
      console.log('Metadata from IPFS:', metadata);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }

    const result = {
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
    
    console.log('Final result:', result);
    console.log('==============================');
    
    return result;
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