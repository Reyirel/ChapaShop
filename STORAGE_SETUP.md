# Configuración de Storage y Permisos para ChapaShop

## 🚨 Problemas Detectados

1. **Bucket 'business-images' no existe** - Error 400 (Bad Request)
2. **Permisos denegados para tabla 'products'** - Error 403 (Forbidden)

## 🔧 Soluciones

### 1. Crear Bucket de Storage para Imágenes

En tu dashboard de Supabase:

1. **Ve a Storage** en el menú lateral
2. **Haz clic en "New bucket"**
3. **Nombre del bucket:** `business-images`
4. **Marca como público:** ✅ Public bucket
5. **Haz clic en "Create bucket"**

### 2. Configurar Políticas de Storage

Una vez creado el bucket, ve a **Storage > Policies** y ejecuta estas políticas:

```sql
-- Política para lectura pública de imágenes
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'business-images');

-- Política para subida de archivos (usuarios autenticados)
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'business-images' AND 
    auth.role() = 'authenticated'
);

-- Política para eliminación de archivos (solo el propietario)
CREATE POLICY "Users can delete own files" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'business-images' AND 
    auth.uid()::text = owner
);
```

### 3. Arreglar Permisos de la Tabla Products

En el **SQL Editor** de Supabase, ejecuta:

```sql
-- Habilitar RLS en la tabla products si no está habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para que los propietarios de negocios puedan crear productos
CREATE POLICY "Business owners can create products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = products.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Política para que todos puedan ver productos de negocios aprobados
CREATE POLICY "Everyone can view products of approved businesses" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = products.business_id 
            AND businesses.status = 'approved'
        )
    );

-- Política para que los propietarios puedan editar sus productos
CREATE POLICY "Business owners can update their products" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = products.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Política para que los propietarios puedan eliminar sus productos
CREATE POLICY "Business owners can delete their products" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = products.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Política para que los admins tengan control total
CREATE POLICY "Admins can do everything with products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### 4. Verificar Tabla business_images

También asegúrate de que la tabla `business_images` existe:

```sql
-- Crear tabla business_images si no existe
CREATE TABLE IF NOT EXISTS business_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;

-- Políticas para business_images
CREATE POLICY "Everyone can view images of approved businesses" ON business_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_images.business_id 
            AND (businesses.status = 'approved' OR businesses.owner_id = auth.uid())
        )
    );

CREATE POLICY "Business owners can manage their images" ON business_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_images.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all images" ON business_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## ✅ Verificación

Después de ejecutar todos los comandos:

1. **Revisa que el bucket `business-images` aparezca en Storage**
2. **Verifica que las políticas estén activas en Storage > Policies**
3. **Comprueba que las políticas RLS estén habilitadas en Database > Tables**
4. **Prueba crear un negocio con imágenes y productos**

## 🚀 Próximos Pasos

Una vez completada la configuración:

1. **Reinicia tu aplicación:** `npm run dev`
2. **Ve al Dashboard de Negocios**
3. **Crea un nuevo negocio**
4. **Sube imágenes en el paso 5**
5. **Agrega productos**
6. **¡Disfruta de la funcionalidad completa!**

---

> **Nota:** Si sigues teniendo problemas, verifica que tus variables de entorno en `.env` sean correctas y que hayas reiniciado la aplicación después de los cambios.
