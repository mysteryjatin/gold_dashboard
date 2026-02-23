import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#0E0E11',
          sidebar: '#131318',
          card: '#1B1C22',
          border: '#2A2B33',
          gold: '#E6B566',
          'gold-hover': '#F1C97A',
          peach: '#FFD6B3',
          text: '#FFFFFF',
          'text-secondary': '#B7B7C2',
          'text-muted': '#8B8B95',
          'row-hover': 'rgba(230, 181, 102, 0.06)',
          'status-success': '#E6B566',
          'status-pending': '#FFD6B3',
          'status-failed': '#8B8B95',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-heading': ['28px', { lineHeight: '1.3' }],
        'card-title': ['16px', { lineHeight: '1.4' }],
        'stats-number': ['24px', { lineHeight: '1.2' }],
        'sidebar-item': ['14px', { lineHeight: '1.4' }],
      },
      fontWeight: {
        'page-heading': '600',
        'card-title': '500',
        'stats-number': '700',
        'sidebar-item': '500',
      },
      maxWidth: {
        'dashboard': '1440px',
      },
      width: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
      },
      height: {
        'navbar': '72px',
        'stat-card': '120px',
      },
      borderRadius: {
        'card': '16px',
        'stat-card': '16px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'stat': '0 4px 20px rgba(0, 0, 0, 0.2)',
      },
      transitionDuration: {
        'sidebar': '300ms',
      },
    },
  },
  plugins: [],
}

export default config
