// Mockup 5: Luxury Minimal
// Premium feel with gold accents

export default function Mockup5() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant monogram logo */}
            <div className="w-12 h-12 border border-amber-400 rounded-full flex items-center justify-center">
              <span className="text-amber-400 font-light text-xl">Σ</span>
            </div>
            <span className="text-lg font-light tracking-[0.3em] uppercase">Sovereign</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Solutions</a>
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Excellence</a>
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Heritage</a>
            <a href="#" className="text-xs tracking-widest text-gray-400 hover:text-amber-400 transition uppercase">Contact</a>
            <button className="px-8 py-3 border border-amber-400 text-amber-400 text-xs tracking-widest uppercase hover:bg-amber-400 hover:text-gray-900 transition">
              Private Access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-32">
        <div className="text-center">
          <div className="inline-block px-6 py-2 border border-amber-400/30 mb-12">
            <p className="text-xs tracking-[0.3em] text-amber-400 uppercase">Established 2024</p>
          </div>
          <h1 className="text-7xl font-extralight tracking-wider leading-tight mb-8">
            Artificial Intelligence
            <br />
            <span className="font-light text-amber-400">Perfected</span>
          </h1>
          <p className="text-xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Where computational excellence meets uncompromising standards.
            Reserved for organizations that demand nothing less than extraordinary.
          </p>
          <div className="flex gap-6 justify-center">
            <button className="px-12 py-4 bg-amber-400 text-gray-900 uppercase tracking-widest text-sm hover:bg-amber-300 transition">
              Request Consultation
            </button>
            <button className="px-12 py-4 border border-gray-600 uppercase tracking-widest text-sm hover:border-amber-400 transition">
              View Credentials
            </button>
          </div>

          {/* Metrics */}
          <div className="mt-32 grid grid-cols-4 gap-px bg-gray-800">
            {[
              { value: 'Fortune 100', label: 'Clientele' },
              { value: '24/7', label: 'Concierge' },
              { value: 'Bespoke', label: 'Solutions' },
              { value: 'Unlimited', label: 'Resources' }
            ].map((metric, i) => (
              <div key={i} className="bg-gray-900 p-8">
                <p className="text-3xl font-light text-amber-400 mb-2">{metric.value}</p>
                <p className="text-xs uppercase tracking-widest text-gray-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-black">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-4xl font-light text-center mb-16 tracking-wide">
            Exclusive Services
          </h2>
          <div className="grid grid-cols-3 gap-12">
            {[
              {
                title: 'Custom Model Development',
                desc: 'Proprietary AI models tailored to your exact specifications',
                features: ['Dedicated team', 'IP ownership', 'Lifetime support']
              },
              {
                title: 'Enterprise Integration',
                desc: 'Seamless deployment within your existing infrastructure',
                features: ['On-premise option', 'Private cloud', 'Hybrid solutions']
              },
              {
                title: 'Strategic Consultation',
                desc: 'Executive-level guidance for AI transformation',
                features: ['C-suite workshops', 'Roadmap design', 'ROI optimization']
              }
            ].map((service, i) => (
              <div key={i} className="border border-gray-800 p-8 hover:border-amber-400/50 transition">
                <h3 className="text-xl font-light mb-4 text-amber-400">{service.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="w-1 h-1 bg-amber-400"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-8 py-24 text-center">
          <div className="w-16 h-px bg-amber-400 mx-auto mb-8"></div>
          <blockquote className="text-2xl font-light leading-relaxed mb-8 text-gray-300">
            "Sovereign's AI capabilities have fundamentally transformed our operations.
            The level of sophistication and support is unparalleled in the industry."
          </blockquote>
          <cite className="text-sm text-amber-400 tracking-widest uppercase not-italic">
            Michael Chen • CEO, Global Finance Corp
          </cite>
          <div className="w-16 h-px bg-amber-400 mx-auto mt-8"></div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 py-32 text-center">
        <h2 className="text-5xl font-light mb-8 tracking-wide">
          Begin Your Journey
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join an exclusive network of industry leaders leveraging the pinnacle of artificial intelligence.
        </p>
        <button className="px-16 py-5 bg-amber-400 text-gray-900 uppercase tracking-[0.2em] text-sm hover:bg-amber-300 transition">
          Schedule Private Demo
        </button>
      </section>
    </div>
  )
}