import pg from 'pg';

const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  console.log("Iniciando conexión a Supabase a través del pooler IPv4...");
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("¡Conectado con éxito a la base de datos de Supabase!");

    console.log("Ejecutando ALTER TABLE announcements...");
    await client.query("ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;");
    console.log("¡Columna attachments añadida con éxito a announcements!");
  } catch (err) {
    console.error("Error ejecutando la sentencia SQL:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
