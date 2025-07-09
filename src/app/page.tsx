import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="text-center py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Write. <span className="text-blue-600">Tokenize.</span> Trade.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            The first decentralized blogging platform where every post becomes a tradeable coin. 
            Create content, build value, and earn from your audience's investment in your ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/write" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              Create Post Coin
            </Link>
            <Link 
              href="/discover" 
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              Discover & Trade
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Write Your Post</h3>
              <p className="text-gray-600 leading-relaxed">
                Create compelling content and publish it as a tradeable coin on the Zora protocol. 
                Your post becomes a unique digital asset.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🪙</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Tokenize Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Each post automatically becomes a coin with its own market. 
                Readers can invest in content they believe in.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Earn from Trades</h3>
              <p className="text-gray-600 leading-relaxed">
                Creators earn fees from every trade. Build an audience, 
                create value, and benefit from your content's success.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">Why Tokenize Your Content?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900">
                <span className="text-2xl text-green-600">💰</span>
                Direct Monetization
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Earn directly from your audience's investment in your content. 
                No ads, no subscriptions - just pure value creation.
              </p>
            </div>
            <div className="text-left p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900">
                <span className="text-2xl text-blue-600">🏛️</span>
                Decentralized Ownership
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your content lives on IPFS and blockchain. No platform can censor, 
                delete, or control your work.
              </p>
            </div>
            <div className="text-left p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900">
                <span className="text-2xl text-purple-600">🎯</span>
                Aligned Incentives
              </h3>
              <p className="text-gray-600 leading-relaxed">
                When your content succeeds, everyone wins. Readers invest in quality, 
                creators earn from popularity.
              </p>
            </div>
            <div className="text-left p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900">
                <span className="text-2xl text-red-600">🚀</span>
                Built on Zora
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by Zora's robust infrastructure for fair, transparent, 
                and efficient token trading.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Ready to Tokenize Your Ideas?</h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the future of content creation where great ideas create lasting value.
          </p>
          <Link 
            href="/write" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg inline-block transition-colors duration-200"
          >
            Create Your First Post Coin
          </Link>
        </div>
      </section>
    </div>
  );
}
