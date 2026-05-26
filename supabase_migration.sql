-- ==========================================
-- MIGRACIÓN DE BASE DE DATOS PARA HOMEHUB
-- ==========================================

-- 1. Tabla de Workspaces (Hogares)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Miembros (Perfiles del Hogar)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    gender TEXT CHECK (gender IN ('M', 'F', 'Otro')),
    birth_date DATE,
    role TEXT NOT NULL, -- 'Padre', 'Madre', 'Hijo', 'Hija', 'Mascota', etc.
    confidential_info TEXT, -- Almacena DNI, Seguridad Social, etc.
    shoe_size TEXT DEFAULT '',
    shirt_size TEXT DEFAULT '',
    pants_size TEXT DEFAULT '',
    allergies TEXT[] DEFAULT '{}',
    blood_type TEXT DEFAULT '',
    dietary_restrictions TEXT[] DEFAULT '{}',
    points INTEGER DEFAULT 0, -- Puntos para Modo Niño
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Modificaciones en la Tabla de Tareas (tasks)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'GENERAL';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIA' CHECK (priority IN ('ALTA', 'MEDIA', 'BAJA'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_member_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT true;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 4. Tabla de Wishlist (Ideas de compras/regalos)
CREATE TABLE IF NOT EXISTS public.wishlist (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    url TEXT,
    price NUMERIC DEFAULT 0,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Tablón de Anuncios (Fridge Whiteboard)
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('pdf', 'image', 'text')), 
    file_url TEXT,
    text_content TEXT,
    is_emergency BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de Tienda de Premios (Gamificación)
CREATE TABLE IF NOT EXISTS public.rewards (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    points_required INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deshabilitar RLS temporalmente en las nuevas tablas para el MVP
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- REGISTROS POR DEFECTO PARA EL MVP
-- ==========================================

-- Insertar Hogar por defecto
INSERT INTO public.workspaces (id, name)
VALUES ('ws-default-1', 'Hogar Principal')
ON CONFLICT (id) DO NOTHING;

-- Insertar perfiles familiares por defecto
INSERT INTO public.members (id, workspace_id, first_name, last_name, gender, role, confidential_info, shoe_size, shirt_size, pants_size, points)
VALUES
('mem-igor', 'ws-default-1', 'Igor', '', 'M', 'Padre', 'DNI: 12345678A / SS: 281234567890', '', '', '', 0),
('mem-diana', 'ws-default-1', 'Diana', '', 'F', 'Madre', 'DNI: 87654321B / SS: 280987654321', '', '', '', 0),
('mem-valentina', 'ws-default-1', 'Valentina', '', 'F', 'Hija', 'DNI: 11223344C', 'Z35', 'T10', 'T10', 30),
('mem-rodrigo', 'ws-default-1', 'Rodrigo', '', 'M', 'Hijo', 'DNI: 55667788D', 'Z32', 'T8', 'T8', 15),
('mem-martin', 'ws-default-1', 'Martín', '', 'M', 'Hijo', 'DNI: 99001122E', 'Z28', 'T5', 'T5', 0)
ON CONFLICT (id) DO NOTHING;

-- Asociar tareas existentes (si las hubiera) al workspace por defecto
UPDATE public.tasks SET workspace_id = 'ws-default-1' WHERE workspace_id IS NULL;
