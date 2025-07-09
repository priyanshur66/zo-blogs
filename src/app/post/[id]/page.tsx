export default function PostPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the post data based on the id
  const post = {
    id: params.id,
    title: 'My First Blog Post',
    author: '0x123...',
    content: `
      This is the beginning of my journey into the world of decentralized blogging.
      I'm excited to share my thoughts and ideas with the community.
      
      Web3 is all about ownership, and with platforms like zo-blogs, I can truly own my content.
      No more censorship or de-platforming. It's a new era for creators.
    `,
  };

  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-8">by {post.author}</p>
      <div className="prose lg:prose-xl">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
} 