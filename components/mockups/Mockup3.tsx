// Mockup 3: Editorial Clean
// Magazine-style typography focus

export default function Mockup3() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Typographic logo */}
            <div className="text-3xl font-serif italic">Λ</div>
            <span className="text-lg font-serif">ATLAS</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">Features</a>
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">Customers</a>
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">Research</a>
            <a href="#" className="text-sm font-light hover:text-gray-600 transition">About</a>
            <button className="text-sm font-medium underline underline-offset-4">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-mono text-gray-500 mb-4">INTRODUCING ATLAS 2.0</p>
            <h1 className="text-8xl font-serif leading-none mb-8">
              The future of
              <br />
              <span className="italic">intelligence</span>
              <br />
              is here.
            </h1>
            <div className="flex items-start gap-16 mt-12">
              <div className="max-w-md">
                <p className="text-lg leading-relaxed text-gray-700 mb-8">
                  A revolutionary approach to artificial intelligence that combines
                  the precision of machine learning with the elegance of human thought.
                  Designed for organizations that value both performance and sophistication.
                </p>
                <button className="text-sm font-medium border-b-2 border-black pb-1 hover:pb-2 transition-all">
                  REQUEST ACCESS
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-4xl font-light">2.1B</p>
                  <p className="text-sm text-gray-500">Parameters</p>
                </div>
                <div>
                  <p className="text-4xl font-light">0.3s</p>
                  <p className="text-sm text-gray-500">Latency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Articles */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-3 gap-12">
          {[
            {
              category: 'TECHNOLOGY',
              title: 'Distributed Intelligence Architecture',
              excerpt: 'Our proprietary neural fabric enables seamless scaling across global infrastructure.',
              readTime: '5 min'
            },
            {
              category: 'SECURITY',
              title: 'Zero-Trust AI Implementation',
              excerpt: 'Every request verified, every response encrypted. Security without compromise.',
              readTime: '3 min'
            },
            {
              category: 'PERFORMANCE',
              title: 'Quantum-Ready Processing',
              excerpt: 'Built for tomorrow with algorithms that leverage quantum computing principles today.',
              readTime: '7 min'
            }
          ].map((article, i) => (
            <article key={i} className="group cursor-pointer">
              <p className="text-xs font-mono text-gray-500 mb-3">{article.category}</p>
              <h3 className="text-2xl font-serif mb-3 group-hover:underline underline-offset-4">
                {article.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {article.excerpt}
              </p>
              <p className="text-xs text-gray-400">{article.readTime} read</p>
            </article>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <blockquote className="text-4xl font-serif italic leading-relaxed mb-8">
            "Atlas represents a fundamental shift in how we think about artificial intelligence—
            not as a tool, but as a partner in human progress."
          </blockquote>
          <cite className="text-sm font-light not-italic">
            Dr. Sarah Chen, Chief Technology Officer
          </cite>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-5xl font-serif mb-16">Technical Specifications</h2>
          <div className="grid grid-cols-2 gap-x-16 gap-y-8">
            {[
              { spec: 'Processing Speed', value: '10 TFLOPS' },
              { spec: 'Memory Bandwidth', value: '900 GB/s' },
              { spec: 'Context Window', value: '128K tokens' },
              { spec: 'Accuracy Rate', value: '99.7%' },
              { spec: 'Languages Supported', value: '95' },
              { spec: 'API Endpoints', value: '250+' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-baseline border-b border-gray-200 pb-4">
                <span className="text-lg font-light">{item.spec}</span>
                <span className="text-lg font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}