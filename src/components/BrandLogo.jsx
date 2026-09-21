import { Sprout } from 'lucide-react';

const SIZES = {
  sm: { icon: 24, text: '13px', badge: '44px' },
  md: { icon: 32, text: '16px', badge: '56px' },
  lg: { icon: 40, text: '20px', badge: '72px' },
};

export default function BrandLogo({
  size = 'md',
  showSubtitle = false,
  variant = 'light',
  className = '',
  style = {},
}) {
  const s = SIZES[size] || SIZES.md;
  const isDark = variant === 'dark';
  const textColor = isDark ? '#4A3423' : '#FFFFFF';
  const badgeBg = isDark ? '#F0EAD6' : 'rgba(255,255,255,0.15)';
  const badgeBorder = isDark ? '#BCAAA4' : 'rgba(255,255,255,0.3)';
  const iconColor = isDark ? '#8B4513' : '#FFFFFF';

  return (
    <div className={`flex flex-col items-center ${className}`} style={style}>
      <div
        className="rounded-full flex items-center justify-center border-2 shrink-0"
        style={{
          width: s.badge,
          height: s.badge,
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
        }}
      >
        <Sprout size={s.icon} color={iconColor} strokeWidth={2} />
      </div>
      <span
        style={{
          fontSize: s.text,
          fontWeight: 700,
          color: textColor,
          marginTop: 8,
          letterSpacing: 1,
        }}
      >
        FARM FMIS
      </span>
      {showSubtitle && (
        <span
          style={{
            fontSize: '11px',
            color: isDark ? '#795548' : 'rgba(255,255,255,0.85)',
            marginTop: 4,
          }}
        >
          Coffee Value Chain
        </span>
      )}
    </div>
  );
}
