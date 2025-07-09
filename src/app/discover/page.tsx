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
        setPosts([]);
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading posts from Zora...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Discover Posts</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filter === 'new' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filter === 'trending' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📝</div>
              <div className="flex-1">
                <h3 className="text-blue-900 font-semibold mb-2">No Posts Yet</h3>
                <p className="text-blue-800 mb-4 leading-relaxed">{error}</p>
                <div className="text-sm text-blue-700">
                  <p className="mb-3">This page shows posts created specifically on zo-blogs platform.</p>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">How to see posts here:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800 leading-relaxed">
                      <li>Connect your wallet</li>
                      <li>Go to the Write page</li>
                      <li>Create a new post</li>
                      <li>Your post will appear here as a tradeable coin</li>
                    </ol>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Link 
                    href="/write" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Create First Post
                  </Link>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link href={`/post/${post.coinAddress}`} key={post.coinAddress}>
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    {/* Post Content */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h2>
                      <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">By {formatAddress(post.author)}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Coin Stats */}
                    <div className="bg-gray-50 rounded-lg p-4 min-w-[200px]">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 mb-2">{post.symbol}</div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Market Cap:</span> ${formatValue(post.marketCap)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">24h Volume:</span> ${formatValue(post.volume24h)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Holders:</span> {post.holders}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600 text-lg">No posts found.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
} 