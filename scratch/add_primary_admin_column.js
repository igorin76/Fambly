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

    console.log("Añadiendo columna is_primary_admin a la tabla members...");
    await client.query("ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_primary_admin BOOLEAN DEFAULT false;");
    console.log("Columna añadida con éxito.");

    console.log("Marcando al menos un administrador principal para las familias existentes...");
    // Marcar como is_primary_admin = true para uno de los admins de cada workspace_id
    await client.query(`
      UPDATE public.members 
      SET is_primary_admin = true 
      WHERE id IN (
        SELECT DISTINCT ON (workspace_id) id 
        FROM public.members 
        WHERE is_admin = true 
        ORDER BY workspace_id, created_at ASC
      );
    `);
    console.log("Administradores principales inicializados.");

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
