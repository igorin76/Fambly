import pg from 'pg';

const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function main() {
  console.log("Conectando a base de datos PostgreSQL de Supabase...");
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("¡Conexión establecida!");

    const sql = `
      CREATE TABLE IF NOT EXISTS public.superadmins (
          id TEXT PRIMARY KEY DEFAULT 'superadmin-global',
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          reset_token TEXT DEFAULT NULL,
          reset_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.superadmins DISABLE ROW LEVEL SECURITY;

      INSERT INTO public.superadmins (id, email, password_hash)
      VALUES (
          'superadmin-global',
          'igorjimenez@gmail.com',
          '$2b$10$UKja1jUJbjmMZuPqxWK6uOjagRYtbarF4lXRuPbDV29F5nnsDdu3C'
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log("Ejecutando SQL para crear tabla y sembrar superadmin...");
    await client.query(sql);
    console.log("¡Tabla superadmins creada y sembrada correctamente!");

  } catch (err) {
    console.error("Error al ejecutar SQL:", err);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
