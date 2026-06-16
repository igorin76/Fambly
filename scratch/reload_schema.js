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

    console.log("Enviando señal de recarga de esquema a PostgREST...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Señal enviada con éxito.");
  } catch (err) {
    console.error("Error al enviar la señal:", err);
  } finally {
    await client.end();
  }
}

run();
