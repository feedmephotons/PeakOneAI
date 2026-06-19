import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Peak One "operating system" palette (navy / electric purple)
        peak: {
          bg: 'var(--peak-bg)',
          bg2: 'var(--peak-bg-2)',
          panel: 'var(--peak-panel)',
          glass: 'var(--peak-glass)',
          'glass-hover': 'var(--peak-glass-hover)',
          border: 'var(--peak-border)',
          primary: 'var(--peak-primary)',
          'primary-600': 'var(--peak-primary-600)',
          'primary-300': 'var(--peak-primary-300)',
          glow: 'var(--peak-glow)',
          text: 'var(--peak-text)',
          muted: 'var(--peak-text-muted)',
          dim: 'var(--peak-text-dim)',
          green: 'var(--peak-green)',
          amber: 'var(--peak-amber)',
          red: 'var(--peak-red)',
          blue: 'var(--peak-blue)',
        },
      },
      boxShadow: {
        peak: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 50px -20px rgba(0,0,0,0.6)',
        'peak-glow': '0 0 0 1px rgba(139,92,246,0.15), 0 24px 70px -24px rgba(139,92,246,0.35), 0 20px 50px -20px rgba(0,0,0,0.6)',
      },
      animation: {
        'in': 'in 0.2s ease-out',
        'peak-float': 'peak-float 6s ease-in-out infinite',
        'peak-pulse-glow': 'peak-pulse-glow 4s ease-in-out infinite',
        'peak-fade-up': 'peak-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        in: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'peak-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'peak-pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.25)' },
        },
        'peak-fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config