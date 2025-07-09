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

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      alert('Missing WalletConnect Project ID. Please check your environment variables.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create coin for the post
      const result = await createPostCoin(
        title,
        content,
        address as Address,
        walletClient,
        publicClient,
        featuredImage || undefined
      );

      console.log('Post coin created:', result);

      // Store coin address locally for this user
      addUserPostCoin(address, result.address);

      // Navigate to the post page using coin address
      router.push(`/post/${result.address}`);
    } catch (error) {
      console.error('Failed to create post coin:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        hasImage: !!featuredImage,
        errorType: typeof error,
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Provide specific error messages
      let errorMessage = 'Failed to create post';
      if (error instanceof Error) {
        // Only show image error if there was actually an image AND the error mentions image
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
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-8">Write a New Post</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to create a post coin</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Write a New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-lg font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your post title"
            maxLength={100}
          />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-lg font-medium mb-1">
            Featured Image 
            <span className="text-sm text-gray-500 font-normal ml-1">(Optional)</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          {featuredImage && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {featuredImage.name}
            </p>
          )}
          {!featuredImage && (
            <p className="text-sm text-gray-500 mt-1">
              No image selected. A placeholder image with your post title will be generated automatically.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-lg font-medium mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={10}
            placeholder="Write your story..."
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🪙 Post Coin Creation</h3>
          <p className="text-sm text-gray-700">
            This post will be minted as a tradeable coin on Zora. Readers can invest in your content, 
            and you'll earn from trading fees. The coin will be priced in ETH.
          </p>
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Post Coin...' : 'Create Post Coin'}
        </button>
      </form>
    </div>
  );
} 