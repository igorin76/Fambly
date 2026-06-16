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

    console.log("Añadiendo columna password_hash a la tabla members...");
    await client.query("ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';");
    console.log("Columna añadida con éxito.");

    console.log("Enviando señal de recarga de esquema a PostgREST...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Señal enviada con éxito.");
  } catch (err) {
    console.error("Error al modificar la tabla:", err);
  } finally {
    await client.end();
  }
}

run();
