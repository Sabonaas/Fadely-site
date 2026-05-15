import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'organization-logos';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

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
    canvas.toBlob((blob) => resolve(blob || file), 'image/webp', 0.88);
  });
}

function validateFile(file) {
  if (!file) throw new Error('Nenhum arquivo selecionado');
  if (file.size > MAX_SIZE) throw new Error('Imagem muito grande (máx. 5MB)');
  if (!ALLOWED.includes(file.type)) throw new Error('Use PNG, JPG ou WebP');
}

export async function uploadOrganizationLogo(organizationId, businessId, file) {
  if (!organizationId && !businessId) throw new Error('organizationId ou businessId obrigatório');
  validateFile(file);

  const compressed = await compressImage(file);
  const folder = organizationId || businessId;
  const path = `${folder}/logo.webp`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '3600',
  });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?t=${Date.now()}`;

  if (businessId) {
    await supabase
      .from('businesses')
      .update({ logo_url: url, updated_at: new Date().toISOString() })
      .eq('id', businessId);
  }
  if (organizationId) {
    await supabase
      .from('organizations')
      .update({ logo_url: url, updated_at: new Date().toISOString() })
      .eq('id', organizationId);
  }

  return url;
}

export async function removeOrganizationLogo(organizationId, businessId) {
  const folder = organizationId || businessId;
  if (!folder) return;
  const path = `${folder}/logo.webp`;
  await supabase.storage.from(BUCKET).remove([path]);

  if (businessId) {
    await supabase.from('businesses').update({ logo_url: null }).eq('id', businessId);
  }
  if (organizationId) {
    await supabase.from('organizations').update({ logo_url: null }).eq('id', organizationId);
  }
}
