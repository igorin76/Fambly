import pg from 'pg';

async function run() {
  console.log("Intentando conectar con host directo...");
  const client = new pg.Client({
    user: 'postgres',
    host: 'db.mwzxggqwzmuzzoqsxufo.supabase.co',
    database: 'postgres',
    password: 'HomeHubPassword2026!',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("¡Conexión directa exitosa!");
    const res = await client.query("SELECT NOW();");
    console.log("Resultado query:", res.rows[0]);
  } catch (err) {
    console.error("Error en conexión directa:", err);
    
    console.log("Intentando con IP IPv6 directa...");
    const clientIpv6 = new pg.Client({
      user: 'postgres',
      host: '2a05:d014:700:dc00:afa:699a:d46b:305d',
      database: 'postgres',
      password: 'HomeHubPassword2026!',
      port: 5432,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await clientIpv6.connect();
      console.log("¡Conexión por IP IPv6 exitosa!");
      const res = await clientIpv6.query("SELECT NOW();");
      console.log("Resultado query:", res.rows[0]);
    } catch (err2) {
      console.error("Error en conexión por IP IPv6:", err2);
    }
  }
}

run();
