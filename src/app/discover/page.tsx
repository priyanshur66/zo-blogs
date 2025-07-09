'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchDiscoverPosts } from '@/utils/zora';

interface Post {
  coinAddress: string;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
  marketCap: string;
  volume24h: string;
  holders: number;
  symbol: string;
}

export default function DiscoverPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'trending'>('all');

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Discover page: Starting to fetch posts...');
        const blogPostCoins = await fetchDiscoverPosts(50);
        console.log('Discover page: Received coins:', blogPostCoins.length);
        
        if (blogPostCoins.length === 0) {
          console.log('No platform coins found');
          setPosts([]);
          setError('No posts have been created on this platform yet. Be the first to create a post!');
          return;
        }
        
        const postsData = blogPostCoins.map((edge: any) => {
          const coin = edge.node;
          console.log('Processing coin:', coin);
          
          // Handle different title formats
          let title = coin.name || 'Untitled Post';
          if (title.startsWith('Post: ')) {
            title = title.replace('Post: ', '');
          }
          
          // Handle description
          let excerpt = coin.description || 'No description available';
          if (excerpt.includes(' | Published on')) {
            excerpt = excerpt.split(' | Published on')[0];
          }
          
          return {
            coinAddress: coin.address,
            title: title,
            excerpt: excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt,
            author: coin.creatorAddress || 'Unknown',
            createdAt: coin.createdAt || new Date().toISOString(),
            marketCap: coin.marketCap || '0',
            volume24h: coin.volume24h || '0',
            holders: coin.uniqueHolders || 0,
            symbol: coin.symbol || 'COIN'
          };
        });

        console.log('Processed posts data:', postsData);

        // Sort based on filter
        let sortedPosts = postsData;
        if (filter === 'new') {
          sortedPosts = postsData.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else if (filter === 'trending') {
          sortedPosts = postsData.sort((a, b) => 
            parseFloat(b.volume24h) - parseFloat(a.volume24h)
          );
        }

        console.log('Final sorted posts:', sortedPosts.length);
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        console.error('Error details:', error);
        setError(`Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setPosts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (num === 0) return '0';
    if (num < 0.01) return '<0.01';
    return num.toFixed(2);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading posts from Zora...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discover Posts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded ${
              filter === 'new' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-4 py-2 rounded ${
              filter === 'trending' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-blue-800 font-semibold mb-2">No Posts Yet</h3>
          <p className="text-blue-700 mb-4">{error}</p>
          <div className="text-sm text-blue-600">
            <p className="mb-2">This page shows posts created specifically on zo-blogs platform.</p>
            <div className="bg-blue-100 p-3 rounded mt-3">
              <p className="font-medium">How to see posts here:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Connect your wallet</li>
                <li>Go to the Write page</li>
                <li>Create a new post</li>
                <li>Your post will appear here as a tradeable coin</li>
              </ol>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Link 
              href="/write" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Create First Post
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link href={`/post/${post.coinAddress}`} key={post.coinAddress}>
              <div className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {formatAddress(post.author)}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="bg-blue-100 px-3 py-1 rounded-full text-sm font-medium text-blue-800 mb-2">
                      ${post.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Market Cap:</span>
                      <span className="ml-1 font-medium">{formatValue(post.marketCap)} ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-500">24h Volume:</span>
                      <span className="ml-1 font-medium">{formatValue(post.volume24h)} ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Holders:</span>
                      <span className="ml-1 font-medium">{post.holders}</span>
                    </div>
                  </div>
                  <div className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View & Trade →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !error && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No posts found.</p>
            <Link href="/write" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Write the first post
            </Link>
          </div>
        )
      )}
    </div>
  );
} 