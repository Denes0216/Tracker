/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cool-ink palette with a warm amber accent — dark listening-room feel.
        ink: {
          DEFAULT: '#0a0907',
          50: '#15120e',
          100: '#1b1813',
          200: '#221e17',
          300: '#2a251c',
          400: '#3a3328',
        },
        paper: {
          DEFAULT: '#ede4d3',
          dim: '#a89e8c',
          mute: '#7a7166',
        },
        amber: {
          DEFAULT: '#f5a623',
          warm: '#ffbf57',
          deep: '#c47a14',
        },
        rule: 'rgba(237, 228, 211, 0.12)',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.32em',
      },
      keyframes: {
        // 33⅓ RPM — one rotation in 1.8s
        spin333: {
          to: { transform: 'rotate(360deg)' },
        },
        bar: {
          '0%, 100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        // Clip-path slide for masked text reveal
        unmask: {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to: { clipPath: 'inset(0 0% 0 0)' },
        },
        // Up-from-below fade
        riseIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Very slight rotation/translation per-letter for the wordmark
        breathe: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-1px) rotate(0.3deg)' },
        },
        // Warm amber glow pulse for accent affordances
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,166,35,0.0)' },
          '50%': { boxShadow: '0 0 24px 2px rgba(245,166,35,0.35)' },
        },
        // Page enter
        pageIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        spin333: 'spin333 1.8s linear infinite',
        bar: 'bar 0.9s ease-in-out infinite',
        unmask: 'unmask 720ms cubic-bezier(0.22, 1, 0.36, 1) both',
        riseIn: 'riseIn 480ms ease-out both',
        breathe: 'breathe 5s ease-in-out infinite',
        glow: 'glow 2.4s ease-in-out infinite',
        pageIn: 'pageIn 320ms ease-out both',
      },
    },
  },
  plugins: [],
};
