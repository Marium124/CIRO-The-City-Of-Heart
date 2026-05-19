/**
 * Premium Theme for CIRO - The Heart of the City
 * Implements Glassmorphism and Dark Command Center aesthetics
 */

export const Theme = {
  colors: {
    background: '#0A0A0B',
    surface: '#161618',
    primary: '#E91E63', // Vibrant Pink
    secondary: '#2196F3', // Tech Blue
    accent: '#00E5FF', // Cyan
    danger: '#FF3B30',
    warning: '#FFCC00',
    success: '#4CD964',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    glass: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
  },
  glassStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)', // Note: Requires specific RN implementations or mimics
  }
};
