import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Premium Color System
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // Primary Brand Colors - Signature Teal
        primary: {
          50: 'hsl(240, 100%, 96%)',
          100: 'hsl(178, 84%, 89%)',
          200: 'hsl(180, 84%, 78%)',
          300: 'hsl(180, 86%, 64%)',
          400: 'hsl(180, 84%, 51%)',
          500: 'hsl(173, 80%, 40%)',
          600: 'hsl(172, 83%, 32%)',
          700: 'hsl(172, 79%, 25%)',
          800: 'hsl(172, 69%, 20%)',
          900: 'hsl(172, 61%, 18%)',
          950: 'hsl(172, 84%, 9%)',
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },

        // Secondary/Accent Colors - Warm Orange
        secondary: {
          50: 'hsl(33, 100%, 96%)',
          100: 'hsl(34, 100%, 92%)',
          200: 'hsl(32, 98%, 83%)',
          300: 'hsl(31, 97%, 72%)',
          400: 'hsl(27, 96%, 61%)',
          500: 'hsl(24, 95%, 53%)',
          600: 'hsl(20, 91%, 48%)',
          700: 'hsl(17, 88%, 40%)',
          800: 'hsl(15, 79%, 34%)',
          900: 'hsl(15, 75%, 28%)',
          950: 'hsl(13, 81%, 17%)',
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },

        // Neutral Colors - Warm Gray
        neutral: {
          50: 'hsl(37, 5%, 98%)',
          100: 'hsl(44, 7%, 96%)',
          200: 'hsl(37, 7%, 90%)',
          300: 'hsl(36, 7%, 84%)',
          400: 'hsl(25, 5%, 64%)',
          500: 'hsl(25, 5%, 45%)',
          600: 'hsl(25, 5%, 33%)',
          700: 'hsl(24, 6%, 25%)',
          800: 'hsl(24, 10%, 15%)',
          900: 'hsl(24, 10%, 10%)',
          950: 'hsl(27, 11%, 4%)',
        },

        // Asian-Inspired Accent Colors
        jade: {
          50: 'hsl(151, 55%, 91%)',
          500: 'hsl(160, 84%, 39%)',
          600: 'hsl(158, 95%, 30%)',
        },

        amber: {
          50: 'hsl(48, 100%, 96%)',
          500: 'hsl(43, 96%, 56%)',
          600: 'hsl(37, 92%, 50%)',
        },
        
        // Status Colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          50: 'hsl(142 76% 97%)',
          100: 'hsl(149 80% 90%)',
          200: 'hsl(152 81% 80%)',
          300: 'hsl(156 72% 67%)',
          400: 'hsl(158 64% 52%)',
          500: 'hsl(var(--success))',
          600: 'hsl(160 84% 39%)',
          700: 'hsl(161 94% 30%)',
          800: 'hsl(163 94% 24%)',
          900: 'hsl(164 86% 20%)',
          950: 'hsl(166 91% 11%)',
        },
        
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          50: 'hsl(54 92% 95%)',
          100: 'hsl(54 96% 88%)',
          200: 'hsl(53 98% 77%)',
          300: 'hsl(50 98% 64%)',
          400: 'hsl(48 96% 53%)',
          500: 'hsl(var(--warning))',
          600: 'hsl(43 96% 56%)',
          700: 'hsl(37 92% 50%)',
          800: 'hsl(32 95% 44%)',
          900: 'hsl(28 92% 37%)',
          950: 'hsl(23 83% 20%)',
        },
        
        error: {
          DEFAULT: 'hsl(var(--error))',
          50: 'hsl(0 86% 97%)',
          100: 'hsl(0 93% 94%)',
          200: 'hsl(0 96% 89%)',
          300: 'hsl(0 94% 82%)',
          400: 'hsl(0 91% 71%)',
          500: 'hsl(var(--error))',
          600: 'hsl(0 84% 60%)',
          700: 'hsl(0 70% 50%)',
          800: 'hsl(0 70% 42%)',
          900: 'hsl(0 63% 31%)',
          950: 'hsl(0 75% 15%)',
        },
        
        info: {
          DEFAULT: 'hsl(var(--info))',
          50: 'hsl(204 100% 97%)',
          100: 'hsl(204 94% 94%)',
          200: 'hsl(201 94% 86%)',
          300: 'hsl(199 95% 74%)',
          400: 'hsl(198 93% 60%)',
          500: 'hsl(var(--info))',
          600: 'hsl(200 98% 39%)',
          700: 'hsl(201 96% 32%)',
          800: 'hsl(201 90% 27%)',
          900: 'hsl(202 80% 24%)',
          950: 'hsl(202 80% 16%)',
        },
        
        // Shadcn compatibility colors
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      
      // Premium Typography
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)', 
        mono: 'var(--font-mono)',
      },
      
      fontSize: {
        'display-2xl': ['3rem', { lineHeight: '1.25', letterSpacing: '-0.05em' }],
        'display-xl': ['2.5rem', { lineHeight: '1.25', letterSpacing: '-0.05em' }],
        'display-lg': ['2rem', { lineHeight: '1.375', letterSpacing: '-0.025em' }],
      },
      
      // Premium Border Radius
      borderRadius: {
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        // Maintain shadcn compatibility
        DEFAULT: 'var(--radius)',
      },
      
      // Premium Shadows
      boxShadow: {
        'premium': 'var(--shadow-xl)',
        'float': '0 20px 25px -5px rgba(28, 25, 23, 0.1), 0 10px 10px -5px rgba(28, 25, 23, 0.04)',
        'glass': '0 8px 32px rgba(28, 25, 23, 0.08)',
        'food': '0 10px 25px -5px rgba(20, 184, 166, 0.1), 0 8px 16px -6px rgba(249, 115, 22, 0.05)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
      },
      
      // Premium Animations
      keyframes: {
        // Shadcn animations (maintained for compatibility)
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        
        // Premium animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'scale(1)' },
          '40%, 43%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1.02)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      
      animation: {
        // Shadcn animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        
        // Premium animations
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-gentle': 'bounce-gentle 0.6s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gentle': 'pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Premium Spacing (8pt grid)
      spacing: {
        '4.5': '1.125rem',    // 18px
        '5.5': '1.375rem',    // 22px
        '6.5': '1.625rem',    // 26px
        '7.5': '1.875rem',    // 30px
        '8.5': '2.125rem',    // 34px
        '9.5': '2.375rem',    // 38px
        '11': '2.75rem',      // 44px (touch target)
        '13': '3.25rem',      // 52px
        '15': '3.75rem',      // 60px
        '17': '4.25rem',      // 68px
        '18': '4.5rem',       // 72px
        '19': '4.75rem',      // 76px
        '21': '5.25rem',      // 84px
        '22': '5.5rem',       // 88px
        '84': '21rem',        // 336px
        '88': '22rem',        // 352px
        '92': '23rem',        // 368px
        '100': '25rem',       // 400px
        '104': '26rem',       // 416px
        '108': '27rem',       // 432px
        '112': '28rem',       // 448px
        '116': '29rem',       // 464px
        '120': '30rem',       // 480px
      },
      
      // Premium Backdrop Blur
      backdropBlur: {
        'xs': '2px',
      },
      
      // Premium Z-index scale
      zIndex: {
        'hide': '-1',
        'docked': '10',
        'dropdown': '1000',
        'sticky': '1100', 
        'banner': '1200',
        'overlay': '1300',
        'modal': '1400',
        'popover': '1500',
        'skipLink': '1600',
        'toast': '1700',
        'tooltip': '1800',
      },
      
      // Screen sizes optimized for food delivery apps
      screens: {
        'xs': '375px',        // iPhone SE, small phones
        'sm': '640px',        // Default small
        'md': '768px',        // Tablets
        'lg': '1024px',       // Small desktop
        'xl': '1280px',       // Desktop
        '2xl': '1536px',      // Large desktop
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Add custom plugin for design system utilities
    function({ addUtilities }) {
      const newUtilities = {
        // Touch-friendly utilities
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.touch-target-lg': {
          'min-height': '48px',
          'min-width': '48px',
        },
        
        // Container utilities
        '.container-padding': {
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@media (min-width: 640px)': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
          },
          '@media (min-width: 1024px)': {
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
        },
        
        // Section padding
        '.section-padding': {
          'padding-top': '2rem',
          'padding-bottom': '2rem',
          '@media (min-width: 768px)': {
            'padding-top': '3rem',
            'padding-bottom': '3rem',
          },
          '@media (min-width: 1024px)': {
            'padding-top': '4rem',
            'padding-bottom': '4rem',
          },
        },
        
        // Smooth scrolling
        '.smooth-scroll': {
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
      }
      
      addUtilities(newUtilities)
    },
  ],
} satisfies Config

export default config