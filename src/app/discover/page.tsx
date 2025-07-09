export default function DiscoverPage() {
  const posts = [
    { id: 1, title: 'My First Blog Post', author: '0x123...', excerpt: 'This is the beginning of my journey...' },
    { id: 2, title: 'Exploring the Decentralized Web', author: '0x456...', excerpt: 'A deep dive into Web3 technologies...' },
    { id: 3, title: 'The Future of Content Creation', author: '0x789...', excerpt: 'How blockchain is changing the game...' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Discover Posts</h1>
      <div className="grid gap-8">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-500 mb-2">by {post.author}</p>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 