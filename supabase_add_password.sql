-- ================================================================
-- MIGRACIÓN: Añadir sistema de contraseñas a members
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Añadir columna password_hash a la tabla members
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';

-- 2. Verificar que se ha añadido correctamente
SELECT id, first_name, is_admin, email, password_hash FROM members;
