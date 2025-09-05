-- Script simplificado para agregar nuevas funcionalidades
-- Ejecutar después de fix_permissions_simple.sql

-- PASO 1: Agregar columnas a la tabla businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- PASO 2: Crear tabla para imágenes de negocios
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

-- PASO 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_business_images_business_id ON business_images(business_id);
CREATE INDEX IF NOT EXISTS idx_business_images_primary ON business_images(business_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);

-- PASO 4: Habilitar RLS en business_images
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas para business_images
CREATE POLICY "Everyone can view images of approved businesses" ON business_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_images.business_id 
            AND (businesses.status = 'approved' OR businesses.owner_id = auth.uid())
        )
    );

CREATE POLICY "Owners can manage their business images" ON business_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_images.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all business images" ON business_images
    FOR ALL USING (is_admin_user());

-- PASO 6: Trigger para actualizar updated_at
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

-- PASO 7: Función para obtener imagen principal
CREATE OR REPLACE FUNCTION get_business_primary_image(business_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    primary_image_url TEXT;
BEGIN
    SELECT image_url INTO primary_image_url
    FROM business_images
    WHERE business_id = business_id_param AND is_primary = true
    LIMIT 1;
    
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
