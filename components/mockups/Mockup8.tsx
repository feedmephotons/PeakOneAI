// Mockup 8: Future Vision
// Holographic effects and modern gradients

export default function Mockup8() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <style jsx>{`
        .holographic {
          background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glow {
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
        }
      `}</style>

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Futuristic logo */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg opacity-80 blur-sm"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded"></div>
              </div>
            </div>
            <span className="text-xl font-light tracking-wider">QUANTUM</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition">Interface</a>
            <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition">Protocols</a>
            <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition">Network</a>
            <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition">Labs</a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm rounded-full hover:scale-105 transition-transform glow">
              Enter Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-8">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">System Online</span>
          </div>
          <h1 className="text-8xl font-extralight leading-none mb-8">
            <span className="holographic">Quantum AI</span>
            <br />
            <span className="text-gray-400">Intelligence</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-3xl mx-auto">
            Harness the power of quantum-inspired algorithms and next-generation
            neural networks. The future of computation is here.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg hover:scale-105 transition-transform glow">
              Initialize System
            </button>
            <button className="px-8 py-4 border border-white/20 rounded-lg hover:bg-white/10 transition">
              View Documentation
            </button>
          </div>

          {/* Floating metrics */}
          <div className="mt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { label: 'Qubits', value: '1024', color: 'from-violet-500 to-purple-500' },
              { label: 'Entanglement', value: '99.8%', color: 'from-cyan-500 to-blue-500' },
              { label: 'Coherence', value: '∞', color: 'from-pink-500 to-rose-500' }
            ].map((metric, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r opacity-20 blur-xl group-hover:opacity-40 transition"
                     style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <p className={`text-3xl font-light bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h2 className="text-4xl font-light mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              Technology Stack
            </span>
          </h2>
          <p className="text-gray-500">Advanced systems powering the future</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Neural Core', desc: 'Quantum processing unit', status: 'Active' },
            { name: 'Data Matrix', desc: 'Distributed storage grid', status: 'Online' },
            { name: 'Sync Protocol', desc: 'Real-time synchronization', status: 'Stable' },
            { name: 'Shield Array', desc: 'Security infrastructure', status: 'Armed' },
            { name: 'Flux Network', desc: 'Dynamic routing system', status: 'Optimal' },
            { name: 'Echo Chamber', desc: 'Feedback loop processor', status: 'Running' },
            { name: 'Void Cache', desc: 'Quantum memory bank', status: 'Ready' },
            { name: 'Nexus Link', desc: 'API gateway cluster', status: 'Connected' }
          ].map((tech, i) => (
            <div key={i} className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-light text-white">{tech.name}</h3>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{tech.desc}</p>
                <p className="text-xs text-cyan-400">{tech.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Demo */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              <div className="grid grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-light mb-6">
                    Quantum Entanglement
                    <br />
                    <span className="text-gray-400">Processing</span>
                  </h2>
                  <div className="space-y-4 text-gray-400">
                    <p>• Superposition-based computation</p>
                    <p>• Entangled neural pathways</p>
                    <p>• Probabilistic outcome optimization</p>
                    <p>• Quantum error correction</p>
                  </div>
                  <button className="mt-8 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg text-sm hover:scale-105 transition-transform">
                    Explore Quantum Lab
                  </button>
                </div>
                <div className="relative h-64">
                  {/* Animated particles */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-4 border border-violet-500/30 rounded-full animate-ping animation-delay-200"></div>
                      <div className="absolute inset-8 border border-pink-500/30 rounded-full animate-ping animation-delay-400"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full glow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <h2 className="text-5xl font-light mb-8">
          <span className="holographic">Enter the Quantum Realm</span>
        </h2>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
          Join the next evolution of artificial intelligence.
          Limited access available.
        </p>
        <button className="px-12 py-5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full text-lg hover:scale-105 transition-transform glow">
          Request Quantum Access
        </button>
      </section>
    </div>
  )
}