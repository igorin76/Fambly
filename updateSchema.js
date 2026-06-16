import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Add missing columns to announcements
    console.log("Altering announcements...");
    await client.query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS description TEXT;");
    await client.query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;");
    
    console.log("Altering members...");
    await client.query("ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';");
    
    console.log("Altering wishlist...");
    await client.query("ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS category TEXT;");
    await client.query("ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS member_ids JSONB;");
    await client.query("ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS hide_from_target BOOLEAN DEFAULT false;");
    await client.query("ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES public.members(id) ON DELETE SET NULL;");

    console.log("Altering events...");
    await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;");

    console.log("Altering tasks for resolution details...");
    await client.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_successfully BOOLEAN DEFAULT true;");
    await client.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;");

    // Create wishlist_categories table
    console.log("Creating wishlist_categories...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist_categories (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create task_categories table
    console.log("Creating task_categories...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_categories (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
