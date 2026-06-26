import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // 品牌色（详见 [[03-设计系统规范#1.1 品牌色]]）
        primary: {
          DEFAULT: '#FFB6C1',
          50: '#FFF5F7',
          100: '#FFE4E9',
          200: '#FFCDD6',
          300: '#FFB6C1',
          400: '#FF9FAD',
          500: '#FF8898',
          600: '#E66B7E',
          700: '#B8505F',
          800: '#8A3A47',
          900: '#5C2630',
        },
        accent: {
          blue: '#B8C5D6',
          cream: '#E8DCC4',
        },
        // 中性色阶
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#9A9A9A',
          600: '#666666',
          700: '#4A4A4A',
          800: '#2A2A2A',
          900: '#1A1A1A',
          950: '#0A0A0A',
        },
        // 语义色
        semantic: {
          success: '#52C41A',
          warning: '#FAAD14',
          danger: '#FF4D4F',
          info: '#1890FF',
        },
        // iOS 安全区变量（详见设计系统 14A）
        safe: {
          top: 'env(safe-area-inset-top, 0px)',
          bottom: 'env(safe-area-inset-bottom, 0px)',
          left: 'env(safe-area-inset-left, 0px)',
          right: 'env(safe-area-inset-right, 0px)',
        },
        // 阶段 9 Round 2：客户配置驱动的颜色（CSS 变量由 layout.tsx 注入）
        // 使用方式：bg-client-primary / text-client-accent
        'client-primary': 'var(--client-primary)',
        'client-accent': 'var(--client-accent)',
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Microsoft YaHei',
          'Source Han Sans CN',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          'LXGW WenKai',
          '演示夏行楷',
          'STKaiti',
          'KaiTi',
          'serif',
        ],
        display: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        number: ['Inter', 'Bebas Neue', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        h1: ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h2: ['1.5rem', { lineHeight: '1.4' }],
        h3: ['1.25rem', { lineHeight: '1.5' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.5' }],
        tiny: ['0.6875rem', { lineHeight: '1.4' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        DEFAULT: '0 4px 16px rgba(0,0,0,0.08)',
        md: '0 8px 32px rgba(0,0,0,0.12)',
        lg: '0 16px 48px rgba(0,0,0,0.16)',
        'primary-glow': '0 4px 16px rgba(255,182,193,0.32)',
        'inner-border': 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-out': 'fadeOut 300ms ease-in',
        'scale-in': 'scaleIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'slide-left': 'slideLeft 300ms ease-out',
        'slide-right': 'slideRight 300ms ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
        bounce: 'bounce 600ms ease-in-out',
        breath: 'breath 2s ease-in-out infinite',
        typewriter: 'typewriter 30ms steps(1) forwards',
        shake: 'shake 400ms ease-in-out',
        'accordion-down': 'accordionDown 200ms ease-out',
        'accordion-up': 'accordionUp 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        breath: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        accordionDown: {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      backgroundImage: {
        'gradient-nova':
          'linear-gradient(135deg, #FFB6C1 0%, #B8C5D6 50%, #E8DCC4 100%)',
        'gradient-night':
          'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)',
      },
    },
  },
  plugins: [],
}

export default config
