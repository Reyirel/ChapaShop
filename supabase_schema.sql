-- ESQUEMA DE BASE DE DATOS PARA CHAPASHOP

-- Tabla de categorías de negocios
CREATE TABLE business_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Nombre del icono (para usar con lucide-react)
    color TEXT DEFAULT '#3ecf8e', -- Color hex para la categoría
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías predeterminadas
INSERT INTO business_categories (name, description, icon, color) VALUES
('Restaurantes', 'Restaurantes, cafeterías, comida rápida', 'UtensilsCrossed', '#f59e0b'),
('Retail', 'Tiendas, boutiques, supermercados', 'Store', '#3b82f6'),
('Servicios', 'Servicios profesionales, consultorías', 'Briefcase', '#10b981'),
('Belleza', 'Salones de belleza, spas, estética', 'Sparkles', '#ec4899'),
('Tecnología', 'Reparación de equipos, servicios IT', 'Laptop', '#6366f1'),
('Salud', 'Clínicas, farmacias, medicina', 'Heart', '#ef4444'),
('Educación', 'Academias, escuelas, cursos', 'GraduationCap', '#8b5cf6'),
('Transporte', 'Taxis, delivery, logística', 'Car', '#14b8a6'),
('Entretenimiento', 'Cines, parques, eventos', 'Music', '#f97316'),
('Hogar', 'Ferretería, decoración, jardinería', 'Home', '#84cc16'),
('Deportes', 'Gimnasios, equipos deportivos', 'Dumbbell', '#06b6d4'),
('Otros', 'Otros servicios no categorizados', 'Package', '#6b7280');

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'person' CHECK (role IN ('person', 'business', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de negocios
CREATE TABLE businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) NOT NULL,
    category_id UUID REFERENCES business_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    facebook TEXT,
    instagram TEXT,
    whatsapp TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de horarios de negocios
CREATE TABLE business_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 6=Sábado
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos/servicios
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reseñas/calificaciones
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id) -- Un usuario solo puede dejar una reseña por negocio
);

-- Tabla de solicitudes de cambios
CREATE TABLE change_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('business_info', 'products', 'hours')),
    current_data JSONB,
    requested_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES profiles(id)
);

-- POLÍTICAS DE SEGURIDAD (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para business_categories
CREATE POLICY "Todos pueden ver categorías activas" ON business_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins pueden gestionar categorías" ON business_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para businesses
CREATE POLICY "Todos pueden ver negocios aprobados" ON businesses
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Propietarios pueden ver sus negocios" ON businesses
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Usuarios business pueden crear negocios" ON businesses
    FOR INSERT WITH CHECK (
        owner_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('business', 'admin')
        )
    );

CREATE POLICY "Propietarios pueden actualizar sus negocios pendientes" ON businesses
    FOR UPDATE USING (
        owner_id = auth.uid() AND status = 'pending'
    );

CREATE POLICY "Admins pueden hacer todo con negocios" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para business_hours
CREATE POLICY "Todos pueden ver horarios de negocios aprobados" ON business_hours
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND status = 'approved'
        )
    );

CREATE POLICY "Propietarios pueden gestionar horarios" ON business_hours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins pueden gestionar todos los horarios" ON business_hours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para products
CREATE POLICY "Todos pueden ver productos de negocios aprobados" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND status = 'approved'
        )
    );

CREATE POLICY "Propietarios pueden gestionar productos" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins pueden gestionar todos los productos" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para reviews
CREATE POLICY "Todos pueden ver reseñas de negocios aprobados" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND status = 'approved'
        )
    );

CREATE POLICY "Usuarios pueden crear reseñas" ON reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND status = 'approved'
        )
    );

CREATE POLICY "Usuarios pueden actualizar sus reseñas" ON reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden eliminar sus reseñas" ON reviews
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins pueden gestionar todas las reseñas" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para change_requests
CREATE POLICY "Propietarios pueden ver solicitudes de sus negocios" ON change_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Propietarios pueden crear solicitudes" ON change_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins pueden gestionar todas las solicitudes" ON change_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- FUNCIONES Y TRIGGERS

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_business_categories_updated_at BEFORE UPDATE ON business_categories 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'person');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX idx_business_categories_active ON business_categories(is_active);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_business_hours_business ON business_hours(business_id);
CREATE INDEX idx_change_requests_business ON change_requests(business_id);
CREATE INDEX idx_change_requests_status ON change_requests(status);
