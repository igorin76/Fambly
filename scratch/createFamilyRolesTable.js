import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log("Creating family_roles table in Supabase...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_roles (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Checking if roles need initialization...");
    const countRes = await client.query("SELECT COUNT(*) FROM family_roles;");
    const count = parseInt(countRes.rows[0].count);
    
    if (count === 0) {
      console.log("Initializing default family roles...");
      const defaultRoles = [
        { id: 'role-padre', name: 'Padre' },
        { id: 'role-madre', name: 'Madre' },
        { id: 'role-hijo', name: 'Hijo' },
        { id: 'role-hija', name: 'Hija' },
        { id: 'role-abuelo', name: 'Abuelo' },
        { id: 'role-abuela', name: 'Abuela' },
        { id: 'role-mascota', name: 'Mascota' }
      ];
      
      for (const role of defaultRoles) {
        await client.query(
          "INSERT INTO family_roles (id, workspace_id, name) VALUES ($1, $2, $3);",
          [role.id, 'ws-default-1', role.name]
        );
      }
      console.log("Default family roles initialized successfully.");
    } else {
      console.log("family_roles already initialized.");
    }
    
    console.log("Done.");
  } catch (err) {
    console.error("Error creating family_roles table:", err);
  } finally {
    await client.end();
  }
}

run();
