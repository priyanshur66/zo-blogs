import Image from "next/image";

export default function Home() {
  return (
    <div>
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">Welcome to zo-blogs</h1>
        <p className="text-xl text-gray-600 mb-8">
          A decentralized blogging platform where your content is truly yours.
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started
        </button>
      </section>
    </div>
  );
}
