import pg from 'pg';

const connectionString = "postgresql://postgres:HomeHubPassword2026!@db.mwzxggqwzmuzzoqsxufo.supabase.co:5432/postgres";

async function run() {
  console.log("Conectando a la base de datos de Supabase...");
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado con éxito. Verificando columna 'created_by' en tabla 'tasks'...");
    
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'created_by';
    `);

    if (checkRes.rowCount === 0) {
      console.log("La columna 'created_by' no existe. Añadiéndola...");
      await client.query("ALTER TABLE public.tasks ADD COLUMN created_by TEXT;");
      console.log("¡Columna 'created_by' añadida con éxito!");
    } else {
      console.log("La columna 'created_by' ya existe en la tabla 'tasks'.");
    }
  } catch (err) {
    console.error("Error ejecutando el script de alteración de base de datos:", err);
  } finally {
    await client.end();
  }
}

run();
