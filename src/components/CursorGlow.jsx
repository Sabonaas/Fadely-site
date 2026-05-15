import { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/ThemeContext';

export default function CursorGlow() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const glowRef = useRef(null);
  const pos = useRef({ x: -400, y: -400 });
  const current = useRef({ x: -400, y: -400 });
  const raf = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Smooth lerp
      current.current.x += (pos.current.x - current.current.x) * 0.08;
      current.current.y += (pos.current.y - current.current.y) * 0.08;

      el.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`;
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(79,142,247,0.045) 0%, rgba(123,94,234,0.02) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(79,142,247,0.035) 0%, rgba(123,94,234,0.012) 50%, transparent 70%)',
          willChange: 'transform',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}