import { ExternalLink } from 'lucide-react';

const SOCIALS = [
  { key: 'social_instagram', label: 'Instagram', prefix: 'instagram.com/', icon: '📸', color: '#E1306C' },
  { key: 'social_youtube', label: 'YouTube', prefix: 'youtube.com/', icon: '▶️', color: '#FF0000' },
  { key: 'social_tiktok', label: 'TikTok', prefix: 'tiktok.com/@', icon: '🎵', color: '#69C9D0' },
  { key: 'social_facebook', label: 'Facebook', prefix: 'facebook.com/', icon: '👥', color: '#1877F2' },
];

export default function SocialInput({ form, onChange }) {
  return (
    <div className="space-y-3">
      {SOCIALS.map(({ key, label, prefix, icon, color }) => {
        const val = form[key] || '';
        const hasValue = val.trim().length > 0;
        return (
          <div key={key} className="flex items-center gap-0 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.09)' }}>
            {/* Prefix */}
            <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0 border-r border-white/[0.07]"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-sm">{icon}</span>
              <span className="text-white/25 text-xs font-mono">{prefix}</span>
            </div>
            {/* Input */}
            <input
              type="text"
              value={val}
              onChange={e => onChange(key, e.target.value)}
              placeholder={label}
              className="flex-1 h-9 px-3 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/20"
            />
            {/* Preview link */}
            {hasValue && (
              <a
                href={`https://${prefix}${val}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 flex items-center justify-center transition-all opacity-40 hover:opacity-80"
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color }} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}