'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Post {
  cid: string;
  title: string;
  excerpt: string;
}

export default function DiscoverPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const cidsString = localStorage.getItem('postCids');
      console.log("CIDs from localStorage:", cidsString);
      const cids: string[] = JSON.parse(cidsString || '[]');
      
      if (cids.length === 0) {
        setIsLoading(false);
        return;
      }
      
      const gateway = 'https://ipfs.io';
      console.log("Using public IPFS Gateway:", gateway);

      try {
        const postsData = await Promise.all(
          cids.map(async (cid) => {
            const url = `${gateway}/ipfs/${cid}`;
            console.log("Fetching post preview from URL:", url);
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`Failed to fetch post with CID: ${cid}. Status: ${res.status}`);
                return null;
            }
            const data = await res.json();
            return {
              cid,
              title: data.title,
              excerpt: data.content.substring(0, 100) + '...',
            };
          })
        );
        setPosts(postsData.filter(p => p !== null) as Post[]);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Discover Posts</h1>
      {posts.length > 0 ? (
        <div className="grid gap-8">
          {posts.map((post) => (
            <Link href={`/post/${post.cid}`} key={post.cid}>
              <div className="border p-4 rounded-lg hover:bg-gray-50">
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <p>{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No posts found. Why not write the first one?</p>
      )}
    </div>
  );
} 