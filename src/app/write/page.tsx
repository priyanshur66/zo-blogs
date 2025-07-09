'use client';

import { useState } from 'react';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post submission to IPFS via Pinata
    console.log({ title, content });
  };

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
          />
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
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Publish
        </button>
      </form>
    </div>
  );
} 