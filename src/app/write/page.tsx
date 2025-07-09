'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address } from 'viem';
import { createPostCoin, addUserPostCoin } from '@/utils/zora';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createLiquidity, setCreateLiquidity] = useState(false);
  const [ethAmount, setEthAmount] = useState('0.01');
  const [tokenAmount, setTokenAmount] = useState('1000');
  const router = useRouter();
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert('Please fill in both title and content.');
      return;
    }

    if (!isConnected || !address || !walletClient || !publicClient) {
      alert('Please connect your wallet first.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      alert('Missing WalletConnect Project ID. Please check your environment variables.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPostCoin(
        title,
        content,
        address as Address,
        walletClient,
        publicClient,
        featuredImage || undefined,
        createLiquidity ? {
          ethAmount,
          tokenAmount
        } : undefined
      );

      console.log('Post coin created:', result);
      addUserPostCoin(address, result.address);
      router.push(`/post/${result.address}`);
    } catch (error) {
      console.error('Failed to create post coin:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        hasImage: !!featuredImage,
        errorType: typeof error,
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      let errorMessage = 'Failed to create post';
      if (error instanceof Error) {
        if (featuredImage && (error.message.includes('image') || error.message.includes('Image'))) {
          errorMessage = 'There was an issue with the image. Try creating the post without an image.';
        } else if (error.message.includes('wallet') || error.message.includes('Wallet')) {
          errorMessage = 'Wallet connection issue. Please reconnect your wallet and try again.';
        } else if (error.message.includes('metadata') || error.message.includes('Metadata')) {
          errorMessage = 'Failed to create post metadata. Please try again.';
        } else if (error.message.includes('API key') || error.message.includes('api key')) {
          errorMessage = 'API key issue. Please check your Zora API key configuration.';
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('gas') || error.message.includes('Gas')) {
          errorMessage = 'Transaction failed due to gas issues. Please try again.';
        } else {
          errorMessage = `Failed to create post: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">✍️</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Write a New Post</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Connect your wallet to create a post coin and start earning from your content.
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Write a New Post</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Create engaging content and turn it into a tradeable coin
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                Title
              </label>
                             <input
                 id="title"
                 type="text"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
                 placeholder="Enter your post title"
                 maxLength={100}
               />
              <p className="text-sm text-gray-500 mt-1">
                {title.length}/100 characters
              </p>
            </div>
            
            {/* Featured Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-900 mb-2">
                Featured Image 
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
              {featuredImage ? (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Selected: {featuredImage.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  No image selected. A placeholder image with your post title will be generated automatically.
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
                Content
              </label>
                             <textarea
                 id="content"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none text-black"
                 rows={10}
                 placeholder="Write your story..."
               />
              <p className="text-sm text-gray-500 mt-1">
                {content.length} characters
              </p>
            </div>

            {/* Post Coin Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🪙</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Post Coin Creation</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This post will be minted as a tradeable coin on Zora. Readers can invest in your content, 
                    and you'll earn from trading fees. The coin will be priced in ETH.
                  </p>
                </div>
              </div>
            </div>

            {/* Liquidity Pool Option */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="createLiquidity"
                  checked={createLiquidity}
                  onChange={(e) => setCreateLiquidity(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="createLiquidity" className="font-semibold text-green-900 cursor-pointer">
                    💧 Create Liquidity Pool (Enable Trading)
                  </label>
                  <p className="text-sm text-green-800 mt-1 leading-relaxed">
                    Create a Uniswap V4 liquidity pool to enable immediate trading of your coin. 
                    This requires additional ETH (~$20-50 in gas + liquidity).
                  </p>
                </div>
              </div>
              
              {createLiquidity && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-green-200">
                  <div>
                    <label htmlFor="ethAmount" className="block text-sm font-medium text-green-900 mb-2">
                      ETH Amount
                    </label>
                    <input
                      id="ethAmount"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.01"
                    />
                    <p className="text-xs text-green-700 mt-1">
                      Amount of ETH to provide as liquidity
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="tokenAmount" className="block text-sm font-medium text-green-900 mb-2">
                      Token Amount
                    </label>
                    <input
                      id="tokenAmount"
                      type="number"
                      step="1"
                      min="1"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1000"
                    />
                    <p className="text-xs text-green-700 mt-1">
                      Amount of tokens to provide as liquidity
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-2">Important Notes:</p>
                  <ul className="text-sm text-yellow-800 space-y-1 leading-relaxed">
                    <li>• Publishing requires ETH for gas fees (~$5-15)</li>
                    <li>• Your post will be stored permanently on IPFS</li>
                    <li>• The coin will be created on Base network</li>
                    <li>• You'll earn fees from all future trades</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !title || !content}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg text-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Post Coin...
                </>
              ) : (
                'Create Post Coin'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 