-- Script para agregar funcionalidades faltantes al schema de la base de datos

-- 1. Modificar tabla businesses para agregar coordenadas y horarios
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- 2. Crear tabla para almacenar imágenes de negocios
CREATE TABLE IF NOT EXISTS business_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_business_images_business_id ON business_images(business_id);
CREATE INDEX IF NOT EXISTS idx_business_images_primary ON business_images(business_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);

-- 4. Crear bucket de storage para imágenes de negocios (esto debe ejecutarse desde el dashboard de Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- 5. Políticas RLS para business_images
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;

-- Permitir que todos vean las imágenes de negocios aprobados
CREATE POLICY "Everyone can view images of approved businesses" ON business_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_images.business_id 
            AND (businesses.status = 'approved' OR businesses.owner_id = auth.uid())
        )
    );

-- Permitir que los propietarios gestionen las imágenes de sus negocios
CREATE POLICY "Owners can manage their business images" ON business_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_images.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Permitir que los admins gestionen todas las imágenes
CREATE POLICY "Admins can manage all business images" ON business_images
    FOR ALL USING (is_admin_user());

-- 6. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_images_updated_at 
    BEFORE UPDATE ON business_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Función para obtener la imagen principal de un negocio
CREATE OR REPLACE FUNCTION get_business_primary_image(business_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    primary_image_url TEXT;
BEGIN
    SELECT image_url INTO primary_image_url
    FROM business_images
    WHERE business_id = business_id_param AND is_primary = true
    LIMIT 1;
    
    -- Si no hay imagen principal, tomar la primera disponible
    IF primary_image_url IS NULL THEN
        SELECT image_url INTO primary_image_url
        FROM business_images
        WHERE business_id = business_id_param
        ORDER BY order_index ASC, created_at ASC
        LIMIT 1;
    END IF;
    
    RETURN primary_image_url;
END;
$$ LANGUAGE plpgsql;

-- 8. Verificar que el bucket de storage existe y las políticas de storage
-- Nota: Estas políticas deben configurarse desde el dashboard de Supabase Storage

-- Política de storage para permitir lectura pública
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'business-images');

-- Política de storage para permitir subida a propietarios
-- CREATE POLICY "Business owners can upload" ON storage.objects FOR INSERT WITH CHECK (
--     bucket_id = 'business-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );

COMMIT;
