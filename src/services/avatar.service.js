import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'avatars';
const MAX_SIZE = 5 * 1024 * 1024;

async function compressImage(file, maxDim = 512) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob || file), 'image/webp', 0.85);
  });
}

export async function uploadAvatar(userId, file) {
  if (!userId) throw new Error('userId required');
  if (file.size > MAX_SIZE) throw new Error('Imagem muito grande (máx. 5MB)');

  const compressed = await compressImage(file);
  const path = `${userId}/avatar.webp`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '3600',
  });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?t=${Date.now()}`;

  await supabase.from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', userId);
  await supabase.auth.updateUser({ data: { avatar_url: url } });

  return url;
}

export async function removeAvatar(userId) {
  const path = `${userId}/avatar.webp`;
  await supabase.storage.from(BUCKET).remove([path]);
  await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
}

export async function uploadEntityAvatar(folder, entityId, file) {
  const compressed = await compressImage(file);
  const path = `${folder}/${entityId}/avatar.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    upsert: true,
    contentType: 'image/webp',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
