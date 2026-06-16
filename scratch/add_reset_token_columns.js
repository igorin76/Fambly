import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado a Supabase.");

    console.log("Añadiendo columnas reset_token y reset_token_expires_at a la tabla members...");
    await client.query("ALTER TABLE public.members ADD COLUMN IF NOT EXISTS reset_token TEXT;");
    await client.query("ALTER TABLE public.members ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;");
    console.log("Columnas añadidas con éxito.");

    console.log("Enviando señal de recarga de esquema a PostgREST...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Señal de recarga enviada.");

  } catch (err) {
    console.error("Error al modificar la tabla:", err);
  } finally {
    await client.end();
  }
}

run();
