import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, title, is_accepted, due_date, length(description) as desc_len, array_length(assigned_member_ids, 1) as assigned_len, length(attachments::text) as atts_len FROM tasks ORDER BY created_at DESC LIMIT 5;");
    console.log("Last 5 tasks in database:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
