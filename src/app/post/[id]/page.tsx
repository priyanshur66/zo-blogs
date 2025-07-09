'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address, formatEther, parseEther } from 'viem';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { fetchPostDetails } from '@/utils/zora';
import Link from 'next/link';

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
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) {
        console.log("No post ID found in params.");
        setError('Invalid post ID');
        setIsLoading(false);
        return;
      }
      
      try {
        const { post: postData, coin: coinDataResult } = await fetchPostDetails(params.id);
        setPost(postData);
        setCoinData(coinDataResult);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setError('Failed to load post. Please try again.');
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

  const validateTradeSetup = () => {
    const issues = [];
    
    if (!coinData?.address || coinData.address === '0x0000000000000000000000000000000000000000') {
      issues.push('Invalid coin address');
    }
    
    const marketCap = parseFloat(coinData?.marketCap || '0');
    const volume = parseFloat(coinData?.volume24h || '0');
    
    if (marketCap < 0.001) {
      issues.push('Very low market cap - liquidity may be insufficient');
    }
    
    if (volume < 0.0001) {
      issues.push('Very low trading volume - consider smaller amounts');
    }
    
    return issues;
  };

  const handleTrade = async () => {
    if (!isConnected || !address || !walletClient || !publicClient || !coinData || !tradeAmount) {
      alert('Please connect your wallet and enter a valid amount');
      return;
    }

    const validationIssues = validateTradeSetup();
    if (validationIssues.length > 0) {
      const proceed = confirm(`Trading warnings:\n${validationIssues.join('\n')}\n\nDo you want to proceed anyway?`);
      if (!proceed) return;
    }

    setIsTrading(true);
    try {
      const amountInWei = parseEther(tradeAmount);
      
      console.log('=== TRADE DEBUG INFO ===');
      console.log('Trade Type:', tradeType);
      console.log('Trade Amount:', tradeAmount);
      console.log('Amount in Wei:', amountInWei.toString());
      console.log('Coin Address:', coinData.address);
      console.log('User Address:', address);
      console.log('Network:', await publicClient.getChainId());
      console.log('Coin Market Cap:', coinData.marketCap);
      console.log('Coin Volume 24h:', coinData.volume24h);
      console.log('Coin Holders:', coinData.holders);
      console.log('Coin Total Supply:', coinData.totalSupply);
      
      const minTradeAmount = parseEther('0.000001');
      if (amountInWei < minTradeAmount) {
        throw new Error(`Trade amount too small. Minimum: 0.000001 ETH`);
      }
      
      const maxTradeAmount = parseEther('10');
      if (amountInWei > maxTradeAmount) {
        throw new Error(`Trade amount too large. Maximum: 10 ETH`);
      }

      const tradeParameters = {
        sell: tradeType === 'buy' 
          ? { type: "eth" as const }
          : { type: "erc20" as const, address: coinData.address as Address },
        buy: tradeType === 'buy' 
          ? { type: "erc20" as const, address: coinData.address as Address }
          : { type: "eth" as const },
        amountIn: amountInWei,
        slippage: 0.15,
        sender: address,
      };

      console.log('Trade Parameters:', tradeParameters);
      console.log('=======================');

      const balance = await publicClient.getBalance({ address });
      console.log('User ETH Balance:', formatEther(balance));
      
      if (tradeType === 'buy' && balance < amountInWei) {
        throw new Error('Insufficient ETH balance');
      }

      console.log('Testing quote availability with minimal amount...');
      try {
        const testParameters = {
          ...tradeParameters,
          amountIn: parseEther('0.000001')
        };
        
        console.log('Test parameters:', testParameters);
      } catch (testError) {
        console.log('Quote test failed (this is expected for untradeable coins):', testError);
      }

      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account: { address } as any,
        publicClient,
      });

      console.log('Trade successful:', receipt);
      alert('Trade successful! Transaction hash: ' + receipt.transactionHash);
      
      const { post: postData, coin: coinDataResult } = await fetchPostDetails(params.id);
      setCoinData(coinDataResult);
      
    } catch (error) {
      console.error('=== TRADE ERROR DEBUG ===');
      console.error('Error object:', error);
      console.error('Error message:', (error as Error).message);
      console.error('Error stack:', (error as Error).stack);
      console.error('========================');
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes('Quote failed') || errorMessage.includes('no quote')) {
          errorMessage = 'Trading not available for this coin yet. The coin may need a liquidity pool to be created first.';
        } else if (errorMessage.includes('Insufficient') || errorMessage.includes('insufficient')) {
          errorMessage = 'Insufficient balance or liquidity. Try a smaller amount.';
        } else if (errorMessage.includes('slippage') || errorMessage.includes('Slippage')) {
          errorMessage = 'Price moved too much during trade. Try again with a smaller amount.';
        } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorMessage.includes('gas') || errorMessage.includes('Gas')) {
          errorMessage = 'Transaction failed due to gas issues. Try increasing gas or using less ETH.';
        } else if (errorMessage.includes('denied') || errorMessage.includes('rejected')) {
          errorMessage = 'Transaction was rejected. Please try again.';
        }
      }
      
      alert(`Trade failed: ${errorMessage}`);
    } finally {
      setIsTrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post || !coinData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 text-lg mb-8">
              {error || 'This post could not be found or has been removed.'}
            </p>
            <Link 
              href="/discover"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Discover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {post.image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                  <span className="font-medium">By {formatAddress(post.author)}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                    {post.content}
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* Trading sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">$</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Trade ${coinData.symbol}</h2>
              </div>
              
              {/* Coin Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Market Cap:</span>
                    <span className="font-semibold text-gray-900">{formatValue(coinData.marketCap)} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">24h Volume:</span>
                    <span className="font-semibold text-gray-900">{formatValue(coinData.volume24h)} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Holders:</span>
                    <span className="font-semibold text-gray-900">{coinData.holders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total Supply:</span>
                    <span className="font-semibold text-gray-900">{formatValue(coinData.totalSupply)}</span>
                  </div>
                </div>
              </div>

              {/* Trading warnings */}
              {(parseFloat(coinData.marketCap) < 0.001 || parseFloat(coinData.volume24h) < 0.0001) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      Low liquidity detected. Trading may fail or have high slippage.
                    </p>
                  </div>
                </div>
              )}

              {!isConnected ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">Connect your wallet to trade this coin</p>
                  <ConnectButton />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Buy/Sell Toggle */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setTradeType('buy')}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                        tradeType === 'buy' 
                          ? 'bg-green-600 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setTradeType('sell')}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                        tradeType === 'sell' 
                          ? 'bg-red-600 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: 0.001 ETH
                    </p>
                  </div>

                  {/* Trade Button */}
                  <button
                    onClick={handleTrade}
                    disabled={isTrading || !tradeAmount}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${
                      tradeType === 'buy' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  >
                    {isTrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Trading...
                      </>
                    ) : (
                      `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${coinData.symbol}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 