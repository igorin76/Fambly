import pg from 'pg';
import fs from 'fs';

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

    console.log("Leyendo archivo de migración SQL...");
    const sqlPath = "./supabase_migration.sql";
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Ejecutando sentencias SQL de migración...");
    await client.query(sql);
    console.log("¡Migración de base de datos completada con éxito!");
  } catch (err) {
    console.error("Error ejecutando la migración de base de datos:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
