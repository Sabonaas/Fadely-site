import { useTheme } from '@/lib/ThemeContext';

/**
 * Fadely brand logo — wordmark + geometric icon mark
 * Works on light and dark backgrounds.
 */
export default function FadelyLogo({ size = 'md', showWordmark = true, className = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizes = {
    sm: { icon: 22, text: 'text-base', gap: 'gap-2' },
    md: { icon: 28, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 36, text: 'text-2xl', gap: 'gap-3' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Icon Mark — abstract fluid "F" shape */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fadely-g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F8EF7" />
            <stop offset="100%" stopColor="#9B6DFF" />
          </linearGradient>
          <linearGradient id="fadely-g2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#9B6DFF" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Background pill */}
        <rect x="0" y="0" width="32" height="32" rx="9" fill={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(79,142,247,0.08)'} />

        {/* Abstract "F" — three horizontal bars tapering elegantly */}
        {/* Top bar — full width */}
        <rect x="8" y="8" width="16" height="3" rx="1.5" fill="url(#fadely-g1)" />
        {/* Middle bar — 3/4 width */}
        <rect x="8" y="14.5" width="11" height="3" rx="1.5" fill="url(#fadely-g1)" />
        {/* Vertical stem */}
        <rect x="8" y="8" width="3" height="16" rx="1.5" fill="url(#fadely-g1)" />
        {/* Accent dot — bottom right */}
        <circle cx="22" cy="23" r="2.5" fill="url(#fadely-g1)" opacity="0.7" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`${s.text} font-semibold tracking-[-0.02em] select-none`}
          style={{
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(10,12,20,0.9)',
            letterSpacing: '-0.02em',
          }}
        >
          Fadely
          <span style={{ color: '#4F8EF7', marginLeft: '1px' }}>.</span>
        </span>
      )}
    </div>
  );
}