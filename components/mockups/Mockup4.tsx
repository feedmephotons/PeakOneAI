// Mockup 4: Tech Brutalist
// Bold, stark contrasts with sharp edges

export default function Mockup4() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-0 flex">
          <div className="px-8 py-6 bg-yellow-400 text-black">
            <span className="text-2xl font-black tracking-tighter">FORGE</span>
          </div>
          <div className="flex-1 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Product</a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Deploy</a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Scale</a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-yellow-400 transition">Docs</a>
            </div>
            <button className="px-6 py-3 bg-white text-black font-bold uppercase text-sm hover:bg-yellow-400 transition">
              Start Building
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-0">
          <div className="flex">
            <div className="w-2/3 bg-black text-white p-16">
              <h1 className="text-7xl font-black uppercase leading-none mb-8">
                Build
                <br />
                <span className="text-yellow-400">Faster</span>
                <br />
                Deploy
                <br />
                <span className="text-yellow-400">Stronger</span>
              </h1>
              <p className="text-xl mb-12 max-w-lg">
                Industrial-strength AI infrastructure for developers who refuse to compromise.
                No fluff. Just raw power.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-yellow-400 text-black font-bold uppercase hover:bg-yellow-300 transition">
                  Get API Keys
                </button>
                <button className="px-8 py-4 border-2 border-white font-bold uppercase hover:bg-white hover:text-black transition">
                  Documentation
                </button>
              </div>
            </div>
            <div className="w-1/3 bg-yellow-400 p-16">
              <div className="space-y-8">
                <div>
                  <p className="text-5xl font-black">100K</p>
                  <p className="text-sm font-bold uppercase">Requests/sec</p>
                </div>
                <div>
                  <p className="text-5xl font-black">5ms</p>
                  <p className="text-sm font-bold uppercase">P99 Latency</p>
                </div>
                <div>
                  <p className="text-5xl font-black">0</p>
                  <p className="text-sm font-bold uppercase">Downtime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-0 py-0">
        <div className="grid grid-cols-3 gap-0">
          {[
            { title: 'RAW COMPUTE', desc: 'Bare metal performance', color: 'bg-red-500' },
            { title: 'INSTANT SCALE', desc: 'From 1 to 1M users', color: 'bg-blue-500' },
            { title: 'GLOBAL EDGE', desc: '300+ locations worldwide', color: 'bg-green-500' },
            { title: 'REAL-TIME', desc: 'Sub-millisecond updates', color: 'bg-purple-500' },
            { title: 'BULLETPROOF', desc: '99.999% uptime SLA', color: 'bg-orange-500' },
            { title: 'DEVELOPER FIRST', desc: 'CLI, SDK, API', color: 'bg-pink-500' }
          ].map((feature, i) => (
            <div key={i} className={`${feature.color} text-white p-12 relative group overflow-hidden`}>
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase mb-3">{feature.title}</h3>
                <p className="text-lg">{feature.desc}</p>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-16 py-16">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-black uppercase mb-8 text-yellow-400">
                Ship Code
                <br />
                Not Complexity
              </h2>
              <p className="text-lg mb-8">
                One API. Every model. Zero configuration.
                Built by engineers, for engineers who have better things to do.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-1 bg-yellow-400"></div>
                  <span className="font-bold uppercase">Type-safe SDKs</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-1 bg-yellow-400"></div>
                  <span className="font-bold uppercase">Auto-scaling</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-1 bg-yellow-400"></div>
                  <span className="font-bold uppercase">Built-in caching</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-8 font-mono text-sm">
              <div className="text-green-400 mb-2"># Install</div>
              <div className="text-gray-300 mb-4">npm install @forge/ai</div>
              <div className="text-green-400 mb-2"># Initialize</div>
              <div className="text-gray-300 mb-4">const ai = new Forge('api_key')</div>
              <div className="text-green-400 mb-2"># Ship</div>
              <div className="text-gray-300">await ai.complete('Build me something amazing')</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}