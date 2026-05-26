-- ==========================================
-- ESQUEMA DE BASE DE DATOS PARA HOMEHUB
-- Copia y pega este script en el SQL Editor de Supabase
-- ==========================================

-- 1. Tabla de Tareas
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    scope TEXT NOT NULL CHECK (scope IN ('individual', 'matrimonial', 'ninos')),
    assignee TEXT NOT NULL,
    children TEXT[] DEFAULT '{}',
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Eventos y Cumpleaños
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cumpleanos', 'escolar', 'hito')),
    target TEXT NOT NULL,
    description TEXT
);

-- 3. Tabla de Productos del Supermercado
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Frescos', 'Despensa', 'Limpieza')),
    completed BOOLEAN DEFAULT false
);

-- 4. Tabla de Logística de Ropa de Niños
CREATE TABLE IF NOT EXISTS public.clothing_logistics (
    id TEXT PRIMARY KEY,
    child_name TEXT NOT NULL UNIQUE,
    current_size TEXT NOT NULL,
    needed_items TEXT
);

-- 5. Tabla de Presupuestos
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL UNIQUE,
    limit_amount NUMERIC NOT NULL,
    spent NUMERIC DEFAULT 0
);

-- 6. Tabla de Recibos Recurrentes
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    period TEXT NOT NULL,
    next_due_date DATE NOT NULL,
    paid BOOLEAN DEFAULT false
);

-- 7. Tabla de Trámites y Certificados
CREATE TABLE IF NOT EXISTS public.procedures (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    notes TEXT
);

-- Habilitar lectura/escritura pública temporal para el MVP (Sin RLS estricto)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_logistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- REGISTRO INICIAL DE HIJOS (TALLAS VACÍAS)
-- ==========================================
INSERT INTO public.clothing_logistics (id, child_name, current_size, needed_items)
VALUES
('cloth-1', 'Valentina', '', ''),
('cloth-2', 'Rodrigo', '', ''),
('cloth-3', 'Martin', '', '')
ON CONFLICT (child_name) DO NOTHING;
