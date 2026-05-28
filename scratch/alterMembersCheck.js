import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log("Altering members table in Supabase...");
    await client.query("ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;");
    await client.query("ALTER TABLE members ADD COLUMN IF NOT EXISTS associated_member_ids JSONB DEFAULT '[]'::jsonb;");
    
    console.log("Table members altered successfully.");
    
    // Optional: Let's default Padre and Madre to is_admin = true just to make setup smoother
    console.log("Setting default is_admin = true for role Padre/Madre...");
    await client.query("UPDATE members SET is_admin = true WHERE role IN ('Padre', 'Madre');");
    
    console.log("Done.");
  } catch (err) {
    console.error("Error altering database table:", err);
  } finally {
    await client.end();
  }
}

run();
