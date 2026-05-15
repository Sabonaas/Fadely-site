import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadAvatar, removeAvatar } from '@/services/avatar.service';

function initials(name) {
  return (name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AvatarUpload({ userId, currentUrl, name, onUploaded, size = 80 }) {
  const inputRef = useRef(null);
  const [url, setUrl] = useState(currentUrl || '');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    if (!file || !userId) return;
    setLoading(true);
    try {
      const publicUrl = await uploadAvatar(userId, file);
      setUrl(publicUrl);
      onUploaded?.(publicUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await removeAvatar(userId);
      setUrl('');
      onUploaded?.('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative inline-flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="relative rounded-full overflow-hidden ring-2 ring-border hover:ring-primary/50 transition-all focus:outline-none focus-visible:ring-primary"
        style={{ width: size, height: size }}
        aria-label="Alterar foto"
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <motion.div
            className="w-full h-full flex items-center justify-center text-primary-foreground font-bold bg-gradient-to-br from-[#4F8EF7] to-[#7B5EEA]"
            style={{ fontSize: size * 0.32 }}
          >
            {initials(name)}
          </motion.div>
        )}
        <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
          {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
        </span>
      </button>
      {url && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Remover
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </motion.div>
  );
}
