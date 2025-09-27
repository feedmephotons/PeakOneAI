// Mockup 7: Neo-Morphic
// Soft shadows and depth

export default function Mockup7() {
  return (
    <div className="min-h-screen bg-gray-200">
      <style jsx>{`
        .neo-raised {
          background: linear-gradient(145deg, #e6e6e6, #ffffff);
          box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
        }
        .neo-inset {
          background: linear-gradient(145deg, #cacaca, #f0f0f0);
          box-shadow: inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff;
        }
        .neo-flat {
          background: #e0e0e0;
          box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;
        }
      `}</style>

      {/* Navigation */}
      <nav className="px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 neo-raised rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full"></div>
            </div>
            <span className="text-2xl font-light text-gray-700">DEPTH</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="px-6 py-3 neo-flat rounded-xl text-gray-700 hover:scale-95 transition-transform">
              Features
            </button>
            <button className="px-6 py-3 neo-flat rounded-xl text-gray-700 hover:scale-95 transition-transform">
              Technology
            </button>
            <button className="px-6 py-3 neo-flat rounded-xl text-gray-700 hover:scale-95 transition-transform">
              Company
            </button>
            <button className="px-8 py-3 neo-raised rounded-xl text-gray-800 font-medium hover:scale-95 transition-transform">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="neo-inset rounded-2xl p-8 mb-8">
              <p className="text-sm text-indigo-600 font-medium mb-2">NEXT GENERATION AI</p>
              <h1 className="text-5xl font-light text-gray-800 leading-tight">
                Intelligence with
                <br />
                <span className="font-normal bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dimension
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-8 px-4">
              Experience artificial intelligence that adapts, learns, and evolves
              with your needs. Built on cutting-edge neural architecture.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-4 neo-raised rounded-xl text-gray-800 font-medium hover:scale-95 transition-transform">
                Start Free Trial
              </button>
              <button className="px-8 py-4 neo-flat rounded-xl text-gray-700 hover:scale-95 transition-transform">
                Learn More
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '2.5M+', label: 'API Calls Daily' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<10ms', label: 'Response Time' },
              { value: '24/7', label: 'Support' }
            ].map((stat, i) => (
              <div key={i} className="neo-raised rounded-2xl p-8 text-center hover:scale-105 transition-transform">
                <p className="text-3xl font-light text-indigo-600 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-gray-800 mb-4">
            Core Capabilities
          </h2>
          <p className="text-gray-600">Advanced features that set us apart</p>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: 'Adaptive Learning',
              desc: 'Models that improve with every interaction',
              icon: '🧠'
            },
            {
              title: 'Real-time Processing',
              desc: 'Instant responses at any scale',
              icon: '⚡'
            },
            {
              title: 'Secure Infrastructure',
              desc: 'Enterprise-grade security and compliance',
              icon: '🔒'
            },
            {
              title: 'Custom Training',
              desc: 'Train models on your proprietary data',
              icon: '🎯'
            },
            {
              title: 'Global Deployment',
              desc: 'Deploy anywhere, scale everywhere',
              icon: '🌍'
            },
            {
              title: 'Expert Support',
              desc: 'Dedicated team of AI specialists',
              icon: '👥'
            }
          ].map((feature, i) => (
            <div key={i} className="neo-raised rounded-2xl p-8 hover:scale-105 transition-transform">
              <div className="w-12 h-12 neo-inset rounded-xl flex items-center justify-center mb-4 text-2xl">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integration Section */}
      <section className="bg-gradient-to-br from-indigo-100 to-purple-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="neo-raised rounded-3xl p-12">
            <div className="grid grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-light text-gray-800 mb-6">
                  Seamless Integration
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Connect with your existing tools and workflows. Our API is designed
                  to work with everything you already use.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="text-gray-700">RESTful API & GraphQL</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">WebSocket support</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="text-gray-700">SDK for all major languages</span>
                  </div>
                </div>
              </div>
              <div className="neo-inset rounded-2xl p-8">
                <pre className="text-sm text-gray-700 font-mono">
{`const depth = new DepthAI({
  apiKey: 'your-api-key',
  model: 'advanced-v2'
});

const result = await depth.analyze({
  input: 'Your data here',
  mode: 'real-time'
});

console.log(result.insights);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="neo-raised rounded-3xl p-16">
          <h2 className="text-5xl font-light text-gray-800 mb-6">
            Ready to add depth to your AI?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of companies using our platform to build
            the future of intelligent applications.
          </p>
          <button className="px-12 py-5 neo-raised rounded-xl text-gray-800 font-medium text-lg hover:scale-95 transition-transform">
            Start Building Today
          </button>
        </div>
      </section>
    </div>
  )
}