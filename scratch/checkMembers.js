import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, first_name, is_admin, email FROM members;");
    console.log("Members in database:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
