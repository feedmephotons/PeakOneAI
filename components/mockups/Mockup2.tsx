// Mockup 2: Dark Gradient
// Subtle dark purple gradients with glass morphism

export default function Mockup2() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Gradient orb logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full relative">
              <div className="absolute inset-1 bg-black rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full"></div>
            </div>
            <span className="text-xl font-light tracking-wide">NEXUS</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-300 hover:text-white transition">Platform</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition">Resources</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition">Company</a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm rounded-lg hover:opacity-90 transition">
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live: 2.5M operations today</span>
          </div>
          <h1 className="text-7xl font-extralight leading-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Artificial Intelligence
            <br />
            <span className="font-normal">Without Limits</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the convergence of machine learning and human intuition.
            Built for enterprises that shape tomorrow.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition">
              Get Early Access
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg hover:bg-white/20 transition">
              Watch Overview
            </button>
          </div>
        </div>

        {/* Floating glass cards */}
        <div className="mt-24 grid grid-cols-4 gap-6">
          {[
            { metric: '10ms', label: 'Response Time' },
            { metric: '99.99%', label: 'Availability' },
            { metric: '256-bit', label: 'Encryption' },
            { metric: '24/7', label: 'Support' }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <p className="text-3xl font-light text-purple-400 mb-2">{item.metric}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-light mb-6">
              Cognitive Computing
              <br />
              <span className="text-gray-400">Reimagined</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Quantum Processing', desc: 'Leverage quantum-inspired algorithms for exponential speed' },
                { title: 'Adaptive Learning', desc: 'Models that evolve with your data in real-time' },
                { title: 'Predictive Analytics', desc: 'Forecast trends before they emerge' }
              ].map((feature, i) => (
                <div key={i} className="group">
                  <h3 className="text-lg font-normal text-white mb-2 group-hover:text-purple-400 transition">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-12">
              {/* Abstract neural network visualization */}
              <svg className="w-full h-64" viewBox="0 0 400 200">
                <circle cx="50" cy="100" r="8" fill="url(#gradient)" />
                <circle cx="150" cy="50" r="8" fill="url(#gradient)" />
                <circle cx="150" cy="150" r="8" fill="url(#gradient)" />
                <circle cx="250" cy="50" r="8" fill="url(#gradient)" />
                <circle cx="250" cy="150" r="8" fill="url(#gradient)" />
                <circle cx="350" cy="100" r="8" fill="url(#gradient)" />
                <line x1="50" y1="100" x2="150" y2="50" stroke="url(#gradient)" strokeWidth="1" opacity="0.3" />
                <line x1="50" y1="100" x2="150" y2="150" stroke="url(#gradient)" strokeWidth="1" opacity="0.3" />
                <line x1="150" y1="50" x2="250" y2="50" stroke="url(#gradient)" strokeWidth="1" opacity="0.3" />
                <line x1="150" y1="150" x2="250" y2="150" stroke="url(#gradient)" strokeWidth="1" opacity="0.3" />
                <line x1="250" y1="50" x2="350" y2="100" stroke="url(#gradient)" strokeWidth="1" opacity="0.3" />
                <line x1="250" y1="150" x2="350" y2="100" stroke="url(#gradient)" strokeWidth="1" opacity="0.3" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}