'use client';

import { useEffect, useState } from 'react';

interface Post {
  title: string;
  content: string;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) {
        console.log("No post ID found in params.");
        setIsLoading(false);
        return;
      }
      
      const gateway = 'https://ipfs.io';
      console.log("Using public IPFS Gateway:", gateway);

      const url = `${gateway}/ipfs/${params.id}`;
      console.log("Fetching post from URL:", url);

      try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch post. Status: ${res.status}`);
        }
        const data = await res.json();
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (isLoading) {
    return <div>Loading post...</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="prose lg:prose-xl">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
} 