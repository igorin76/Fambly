import pg from 'pg';

const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado para alterar la tabla members...");
    await client.query("ALTER TABLE public.members ADD COLUMN IF NOT EXISTS needed_items TEXT DEFAULT '';");
    console.log("¡Columna needed_items añadida con éxito a public.members!");
  } catch (err) {
    console.error("Error al alterar tabla:", err);
  } finally {
    await client.end();
  }
}

run();
