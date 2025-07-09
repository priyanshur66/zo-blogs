import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            Write. <span className="text-blue-600">Tokenize.</span> Trade.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The first decentralized blogging platform where every post becomes a tradeable coin. 
            Create content, build value, and earn from your audience's investment in your ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/write" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              Create Post Coin
            </Link>
            <Link 
              href="/discover" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg"
            >
              Discover & Trade
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Write Your Post</h3>
              <p className="text-gray-600">
                Create compelling content and publish it as a tradeable coin on the Zora protocol. 
                Your post becomes a unique digital asset.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🪙</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tokenize Content</h3>
              <p className="text-gray-600">
                Each post automatically becomes a coin with its own market. 
                Readers can invest in content they believe in.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Earn from Trades</h3>
              <p className="text-gray-600">
                Creators earn fees from every trade. Build an audience, 
                create value, and benefit from your content's success.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Tokenize Your Content?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-green-600">💰</span>
                Direct Monetization
              </h3>
              <p className="text-gray-600">
                Earn directly from your audience's investment in your content. 
                No ads, no subscriptions - just pure value creation.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-blue-600">🏛️</span>
                Decentralized Ownership
              </h3>
              <p className="text-gray-600">
                Your content lives on IPFS and blockchain. No platform can censor, 
                delete, or control your work.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-purple-600">🎯</span>
                Aligned Incentives
              </h3>
              <p className="text-gray-600">
                When your content succeeds, everyone wins. Readers invest in quality, 
                creators earn from popularity.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-red-600">🚀</span>
                Built on Zora
              </h3>
              <p className="text-gray-600">
                Powered by Zora's robust infrastructure for fair, transparent, 
                and efficient token trading.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Tokenize Your Ideas?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the future of content creation where great ideas create lasting value.
          </p>
          <Link 
            href="/write" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg inline-block"
          >
            Create Your First Post Coin
          </Link>
        </div>
      </section>
    </div>
  );
}
