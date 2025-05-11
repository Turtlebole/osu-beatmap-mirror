export const theme = {
  colors: {
    primary: '#b49d88', // Faint Maple from Valspar
    secondary: '#2f3542',
    accent: '#b49d88',
    background: '#fcfcfc',
    foreground: '#2f3542',
    muted: '#f0f0f0',
    mutedForeground: '#6c757d',
    border: '#e2e8f0',
    input: '#f8fafc',
    ring: 'rgba(180, 157, 136, 0.3)',
    
    // Card colors
    card: '#ffffff',
    cardForeground: '#1e293b',
    
    // Destructive
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    
    // Dark mode
    dark: {
      primary: '#b49d88',
      secondary: '#334155',
      accent: '#b49d88',
      background: '#1e1e1e',
      foreground: '#e2e8f0',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#334155',
      input: '#1e293b',
      ring: 'rgba(180, 157, 136, 0.3)',
      card: '#1e293b',
      cardForeground: '#e2e8f0',
    }
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
}; 