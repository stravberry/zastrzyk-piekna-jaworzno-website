
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				pink: {
					50: '#fef1f7',
					100: '#fee5f0',
					200: '#fecce3',
					300: '#ffa2cb',
					400: '#fe68a7',
					500: '#f83c86',
					600: '#e91f64',
					700: '#ca0c45',
					800: '#a70d3a',
					900: '#8b1034',
					950: '#55021a',
				},
				gold: {
					50: '#fbf8ea',
					100: '#f6efc8',
					200: '#eeda92',
					300: '#e5c253',
					400: '#dcae30',
					500: '#cb8a22',
					600: '#b2691c',
					700: '#8e4b1a',
					800: '#763c1c',
					900: '#65331c',
					950: '#3b1b0e',
				},
			},
			fontFamily: {
				'playfair': ['Playfair Display', 'serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideUp: {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				slideDown: {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				slideLeft: {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				slideRight: {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				zoomIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				collapse: {
					'0%': { maxHeight: '500px', opacity: '1' },
					'100%': { maxHeight: '0', opacity: '0' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-15px)' }
				},
				'gentle-bounce': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-5px) scale(1.05)' }
				},
				'slow-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(248, 60, 134, 0.2)' },
					'50%': { boxShadow: '0 0 20px rgba(248, 60, 134, 0.4)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.5s ease-in-out',
				'slide-down': 'slideDown 0.5s ease-in-out',
				'slide-left': 'slideLeft 0.5s ease-in-out',
				'slide-right': 'slideRight 0.5s ease-in-out',
				'zoom-in': 'zoomIn 0.5s ease-in-out',
				'collapse': 'collapse 0.5s ease-in-out',
				'float': 'float 4s ease-in-out infinite',
				'gentle-bounce': 'gentle-bounce 4s ease-in-out infinite',
				'slow-spin': 'slow-spin 8s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'hero-pattern': "linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7)), url('/images/hero-bg.jpg')",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
