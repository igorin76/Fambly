import pg from 'pg';

const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado para verificar datos...");

    const tables = [
      'tasks',
      'events',
      'shopping_items',
      'clothing_logistics',
      'budgets',
      'receipts',
      'procedures'
    ];

    for (const table of tables) {
      const res = await client.query(`SELECT * FROM public.${table}`);
      console.log(`Tabla ${table}: ${res.rowCount} filas.`);
      if (res.rowCount > 0) {
        console.log(res.rows);
      }
    }
  } catch (err) {
    console.error("Error al verificar:", err);
  } finally {
    await client.end();
  }
}

run();
