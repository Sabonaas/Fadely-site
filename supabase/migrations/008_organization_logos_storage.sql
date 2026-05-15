-- Bucket para logos de estabelecimentos (público leitura, escrita autenticada com RLS)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública
DROP POLICY IF EXISTS "org_logos_public_read" ON storage.objects;
CREATE POLICY "org_logos_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'organization-logos');

-- Upload: owner/admin da org (path = organization_id/...)
DROP POLICY IF EXISTS "org_logos_owner_upload" ON storage.objects;
CREATE POLICY "org_logos_owner_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'organization-logos'
    AND (
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.role IN ('owner', 'admin')
          AND om.organization_id::text = (storage.foldername(name))[1]
      )
      OR EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.owner_id = auth.uid()
          AND b.id::text = (storage.foldername(name))[1]
      )
    )
  );

DROP POLICY IF EXISTS "org_logos_owner_update" ON storage.objects;
CREATE POLICY "org_logos_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'organization-logos'
    AND (
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.role IN ('owner', 'admin')
          AND om.organization_id::text = (storage.foldername(name))[1]
      )
      OR EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.owner_id = auth.uid()
          AND b.id::text = (storage.foldername(name))[1]
      )
    )
  );

DROP POLICY IF EXISTS "org_logos_owner_delete" ON storage.objects;
CREATE POLICY "org_logos_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'organization-logos'
    AND (
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.role IN ('owner', 'admin')
          AND om.organization_id::text = (storage.foldername(name))[1]
      )
      OR EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.owner_id = auth.uid()
          AND b.id::text = (storage.foldername(name))[1]
      )
    )
  );
