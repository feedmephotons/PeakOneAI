// Mockup 6: Swiss Design
// Grid-based, systematic layout

export default function Mockup6() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b-2 border-black">
        <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto px-6 py-4">
          <div className="col-span-3 flex items-center">
            <div className="flex items-center gap-2">
              {/* Grid-based logo */}
              <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
                <div className="bg-black"></div>
                <div className="bg-red-600"></div>
                <div className="bg-red-600"></div>
                <div className="bg-black"></div>
              </div>
              <span className="text-xl font-medium">GRID</span>
            </div>
          </div>
          <div className="col-span-6 flex items-center justify-center gap-8">
            <a href="#" className="text-sm hover:text-red-600 transition">System</a>
            <a href="#" className="text-sm hover:text-red-600 transition">Modules</a>
            <a href="#" className="text-sm hover:text-red-600 transition">Framework</a>
            <a href="#" className="text-sm hover:text-red-600 transition">Documentation</a>
          </div>
          <div className="col-span-3 flex items-center justify-end">
            <button className="px-6 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition">
              Access Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <h1 className="text-6xl font-bold leading-none mb-8">
              Systematic
              <br />
              <span className="text-red-600">Intelligence</span>
              <br />
              Platform
            </h1>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-lg leading-relaxed mb-6">
                  Precision-engineered artificial intelligence built on mathematical principles
                  and systematic design methodology.
                </p>
                <button className="px-6 py-3 bg-black text-white hover:bg-gray-900 transition">
                  Initialize System
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-3xl font-bold">99.9%</p>
                  <p className="text-sm">Accuracy</p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-3xl font-bold">1.2ms</p>
                  <p className="text-sm">Response</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-sm">Available</p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-3xl font-bold">ISO</p>
                  <p className="text-sm">Certified</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            {/* Abstract grid visualization */}
            <div className="h-full grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`${
                    i % 3 === 0 ? 'bg-red-600' : i % 2 === 0 ? 'bg-black' : 'bg-gray-200'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-4 mb-8">
            <div className="col-span-3">
              <h2 className="text-2xl font-bold">Core Modules</h2>
            </div>
            <div className="col-span-9">
              <p className="text-gray-600">Modular architecture for maximum flexibility and scalability</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4">
            {[
              { name: 'Neural Core', desc: 'Advanced ML processing', span: 4 },
              { name: 'Data Pipeline', desc: 'Real-time ingestion', span: 4 },
              { name: 'API Gateway', desc: 'Unified access layer', span: 4 },
              { name: 'Analytics Engine', desc: 'Predictive insights', span: 6 },
              { name: 'Security Layer', desc: 'End-to-end encryption', span: 6 },
              { name: 'Orchestration', desc: 'Workflow automation', span: 3 },
              { name: 'Monitoring', desc: 'Real-time observability', span: 3 },
              { name: 'Storage', desc: 'Distributed data layer', span: 3 },
              { name: 'Compute', desc: 'Elastic processing', span: 3 }
            ].map((module, i) => (
              <div
                key={i}
                className={`col-span-${module.span} bg-white border-2 border-black p-6 hover:bg-red-50 transition`}
                style={{ gridColumn: `span ${module.span}` }}
              >
                <h3 className="font-bold mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 mb-8">
            <h2 className="text-3xl font-bold">Technical Specifications</h2>
          </div>
          {[
            { label: 'Processing', value: 'Multi-threaded neural processing with automatic load balancing', span: 6 },
            { label: 'Memory', value: '512GB high-speed cache with intelligent prefetching', span: 6 },
            { label: 'Network', value: '100Gbps redundant connectivity across global regions', span: 4 },
            { label: 'Storage', value: 'Petabyte-scale distributed filesystem', span: 4 },
            { label: 'Security', value: 'FIPS 140-2 Level 3 compliance', span: 4 }
          ].map((spec, i) => (
            <div
              key={i}
              className={`col-span-${spec.span} border-t-2 border-black pt-4`}
              style={{ gridColumn: `span ${spec.span}` }}
            >
              <p className="text-sm font-bold text-red-600 mb-2">{spec.label}</p>
              <p className="text-sm">{spec.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <p className="font-bold">GRID AI</p>
            </div>
            <div className="col-span-3">
              <p className="text-sm text-gray-400">© 2024 Grid Systems</p>
            </div>
            <div className="col-span-3">
              <p className="text-sm text-gray-400">Engineering Excellence</p>
            </div>
            <div className="col-span-3 text-right">
              <a href="#" className="text-sm text-red-400 hover:text-red-300">Contact Engineering</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}