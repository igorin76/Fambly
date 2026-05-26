import pg from 'pg';
import fs from 'fs';

// Probar múltiples estrategias de conexión para el Pooler IPv4
const connectionStrings = [
  // Estrategia 1: Formato estándar usuario.proyecto
  "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres",
  // Estrategia 2: Formato estándar con opción de proyecto
  "postgresql://postgres:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?options=project%3Dmwzxggqwzmuzzoqsxufo",
  // Estrategia 3: Puerto 5432 en el pooler (Session mode)
  "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
];

async function tryConnect(connectionString) {
  console.log(`Intentando conexión con: ${connectionString.split('@')[1]}`);
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.error(`Fallo en esta conexión: ${err.message}`);
    return null;
  }
}

async function run() {
  let client = null;
  
  for (const connStr of connectionStrings) {
    client = await tryConnect(connStr);
    if (client) {
      console.log("¡Conectado con éxito!");
      break;
    }
  }

  if (!client) {
    console.error("No se pudo conectar a la base de datos usando ninguna estrategia del pooler. Es posible que el pooler aún se esté inicializando en el servidor de Supabase (suele tardar 3-5 minutos en proyectos nuevos).");
    process.exit(1);
  }

  try {
    console.log("Leyendo esquema SQL...");
    const sqlPath = "./supabase_schema.sql";
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Ejecutando sentencias SQL de inicialización...");
    await client.query(sql);
    console.log("¡Base de datos inicializada correctamente con tablas y datos semilla!");
  } catch (err) {
    console.error("Error ejecutando el script de base de datos:", err);
  } finally {
    await client.end();
  }
}

run();
