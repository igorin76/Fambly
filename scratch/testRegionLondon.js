import pg from 'pg';

async function run() {
  const host = 'aws-0-eu-west-2.pooler.supabase.com';
  console.log("Intentando conectar a Londres (eu-west-2)...");
  const client = new pg.Client({
    user: 'postgres.mwzxggqwzmuzzoqsxufo',
    host: host,
    database: 'postgres',
    password: 'HomeHubPassword2026!',
    port: 6543,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("¡Conectado a eu-west-2 con éxito!");
    const res = await client.query("SELECT NOW();");
    console.log("Resultado:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Error en eu-west-2:", err.message);
    try {
      await client.end();
    } catch(e) {}
  }
}

run();
