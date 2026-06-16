import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado a la base de datos de Supabase.");

    console.log("Añadiendo columna workspace_id a la tabla events...");
    await client.query("ALTER TABLE public.events ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'ws-default-1';");

    console.log("Añadiendo columna workspace_id a la tabla shopping_items...");
    await client.query("ALTER TABLE public.shopping_items ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'ws-default-1';");

    console.log("Añadiendo columna workspace_id a la tabla budgets...");
    await client.query("ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'ws-default-1';");

    console.log("Añadiendo columna workspace_id a la tabla receipts...");
    await client.query("ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'ws-default-1';");

    console.log("Añadiendo columna workspace_id a la tabla procedures...");
    await client.query("ALTER TABLE public.procedures ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'ws-default-1';");

    console.log("Añadiendo columna workspace_id a la tabla family_roles...");
    await client.query("ALTER TABLE public.family_roles ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'ws-default-1';");

    console.log("Eliminando restricción budgets_category_key si existe...");
    await client.query("ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_category_key;");

    console.log("Migración completada con éxito.");
  } catch (err) {
    console.error("Error al ejecutar la migración:", err);
  } finally {
    await client.end();
  }
}

run();
