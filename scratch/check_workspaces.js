import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log("=== WORKSPACES ===");
    const wsRes = await client.query("SELECT * FROM public.workspaces;");
    console.log(wsRes.rows);

    console.log("=== ADMIN MEMBERS ===");
    const memRes = await client.query("SELECT id, workspace_id, first_name, last_name, email, is_admin, is_primary_admin FROM public.members WHERE is_admin = true;");
    console.log(memRes.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
