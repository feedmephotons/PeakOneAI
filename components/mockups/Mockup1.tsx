// Mockup 1: Monochrome Minimal
// Pure black & white with geometric shapes, no emojis, premium feel

export default function Mockup1() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Custom geometric logo */}
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 bg-black rotate-45 transform scale-75"></div>
              <div className="absolute inset-2 bg-white rotate-45 transform scale-75"></div>
            </div>
            <span className="text-2xl font-light tracking-tighter">APEX</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm hover:opacity-60 transition">Product</a>
            <a href="#" className="text-sm hover:opacity-60 transition">Solutions</a>
            <a href="#" className="text-sm hover:opacity-60 transition">Enterprise</a>
            <a href="#" className="text-sm hover:opacity-60 transition">Pricing</a>
            <button className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-900 transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-7xl font-light leading-tight mb-6">
              Intelligence
              <br />
              <span className="font-normal">Redefined</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              A new paradigm in artificial intelligence. Built for professionals
              who demand excellence, precision, and uncompromising performance.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-black text-white hover:bg-gray-900 transition">
                Start Free Trial
              </button>
              <button className="px-8 py-3 border border-black hover:bg-black hover:text-white transition">
                View Demo
              </button>
            </div>
            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-3xl font-light">99.9%</p>
                <p className="text-sm text-gray-600">Uptime SLA</p>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <p className="text-3xl font-light">150ms</p>
                <p className="text-sm text-gray-600">Avg Response</p>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <p className="text-3xl font-light">SOC 2</p>
                <p className="text-sm text-gray-600">Certified</p>
              </div>
            </div>
          </div>
          <div className="relative">
            {/* Geometric abstract visualization */}
            <div className="relative w-full h-96">
              <div className="absolute inset-0 border-2 border-black"></div>
              <div className="absolute top-8 left-8 w-32 h-32 border-2 border-black bg-white"></div>
              <div className="absolute bottom-8 right-8 w-48 h-48 border-2 border-black bg-black"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-black rotate-45"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-black">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-3 gap-px bg-black">
            {[
              { title: 'Neural Processing', desc: 'Advanced ML models with real-time adaptation' },
              { title: 'Data Synthesis', desc: 'Transform raw data into actionable intelligence' },
              { title: 'Secure Pipeline', desc: 'End-to-end encryption with zero-knowledge architecture' },
              { title: 'Global Scale', desc: 'Deploy across regions with automatic failover' },
              { title: 'API First', desc: 'RESTful and GraphQL endpoints with 99.99% uptime' },
              { title: 'Custom Models', desc: 'Train and deploy proprietary AI models' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 hover:bg-gray-50 transition">
                <h3 className="text-xl font-normal mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h2 className="text-5xl font-light mb-6">Ready to Transform?</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join industry leaders who have already made the switch to next-generation AI.
          </p>
          <button className="px-12 py-4 bg-white text-black hover:bg-gray-100 transition">
            Schedule Consultation
          </button>
        </div>
      </section>
    </div>
  )
}