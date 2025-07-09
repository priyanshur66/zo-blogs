'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address, formatEther, parseEther } from 'viem';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { fetchPostDetails } from '@/utils/zora';

interface Post {
  title: string;
  content: string;
  author: string;
  createdAt: string;
  image?: string;
}

interface CoinData {
  address: string;
  symbol: string;
  marketCap: string;
  volume24h: string;
  holders: number;
  totalSupply: string;
  uri: string;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) {
        console.log("No post ID found in params.");
        setIsLoading(false);
        return;
      }
      
      try {
        const { post: postData, coin: coinDataResult } = await fetchPostDetails(params.id);
        setPost(postData);
        setCoinData(coinDataResult);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const formatValue = (value: string | undefined) => {
    if (!value) return '0';
    const num = parseFloat(value);
    if (num === 0) return '0';
    if (num < 0.01) return '<0.01';
    return num.toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleTrade = async () => {
    if (!isConnected || !address || !walletClient || !publicClient || !coinData || !tradeAmount) {
      alert('Please connect your wallet and enter a valid amount');
      return;
    }

    setIsTrading(true);
    try {
      const amountInWei = parseEther(tradeAmount);
      
      const tradeParameters = {
        sell: tradeType === 'buy' 
          ? { type: "eth" as const }
          : { type: "erc20" as const, address: coinData.address as Address },
        buy: tradeType === 'buy' 
          ? { type: "erc20" as const, address: coinData.address as Address }
          : { type: "eth" as const },
        amountIn: amountInWei,
        slippage: 0.05, // 5% slippage tolerance
        sender: address,
      };

      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account: { address } as any,
        publicClient,
      });

      console.log('Trade successful:', receipt);
      alert('Trade successful! Transaction hash: ' + receipt.transactionHash);
      
      // Refresh post data to get updated coin metrics
      const { post: postData, coin: coinDataResult } = await fetchPostDetails(params.id);
      setCoinData(coinDataResult);
      
    } catch (error) {
      console.error('Trade failed:', error);
      alert('Trade failed: ' + (error as Error).message);
    } finally {
      setIsTrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post || !coinData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article>
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>By {formatAddress(post.author)}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              {post.image && (
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full max-w-2xl rounded-lg mb-6"
                />
              )}
            </header>
            
            <div className="prose lg:prose-xl max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </article>
        </div>

        {/* Trading Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-full">
                  <span className="text-blue-600 font-bold">🪙</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">${coinData.symbol}</h3>
                  <p className="text-gray-600 text-sm">Post Coin</p>
                </div>
              </div>

              {/* Coin Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap</span>
                  <span className="font-semibold">{formatValue(coinData.marketCap)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">24h Volume</span>
                  <span className="font-semibold">{formatValue(coinData.volume24h)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Holders</span>
                  <span className="font-semibold">{coinData.holders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Supply</span>
                  <span className="font-semibold">{formatValue(coinData.totalSupply)}</span>
                </div>
              </div>

              {/* Trading Interface */}
              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTradeType('buy')}
                      className={`flex-1 py-2 px-4 rounded ${
                        tradeType === 'buy' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setTradeType('sell')}
                      className={`flex-1 py-2 px-4 rounded ${
                        tradeType === 'sell' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount {tradeType === 'buy' ? '(ETH)' : '(Tokens)'}
                    </label>
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.001"
                      step="0.001"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <button
                    onClick={handleTrade}
                    disabled={isTrading || !tradeAmount}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTrading ? 'Trading...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${coinData.symbol}`}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Trading fees benefit the creator and platform
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Connect wallet to trade</p>
                  <ConnectButton />
                </div>
              )}
            </div>

            {/* Coin Info */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">About this Coin</h4>
              <p className="text-sm text-gray-600 mb-2">
                This post has been tokenized as a tradeable coin on Zora. 
                When you trade this coin, the creator earns from fees.
              </p>
              <div className="text-xs text-gray-500">
                <p>Contract: {formatAddress(coinData.address)}</p>
                <p>Creator: {formatAddress(post.author)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 