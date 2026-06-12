import pg from 'pg';
const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Create a mock large base64 string
    const largeBase64 = "data:image/png;base64," + "A".repeat(50000); // 50KB base64
    
    const task = {
      id: `task-test-${Date.now()}`,
      title: "Test Task base64",
      description: "Test description",
      scope: "individual",
      assignee: "Todos",
      children: [],
      due_date: null,
      completed: false,
      workspace_id: "ws-default-1",
      category: "GENERAL",
      priority: "MEDIA",
      assigned_member_ids: [],
      is_accepted: true,
      attachments: JSON.stringify([
        {
          id: "att-1",
          type: "image",
          fileUrl: largeBase64,
          fileName: "test.png"
        }
      ])
    };

    console.log("Trying to insert task...");
    const res = await client.query(`
      INSERT INTO tasks (
        id, title, description, scope, assignee, children, due_date, completed, 
        workspace_id, category, priority, assigned_member_ids, is_accepted, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      task.id, task.title, task.description, task.scope, task.assignee, task.children,
      task.due_date, task.completed, task.workspace_id, task.category, task.priority,
      task.assigned_member_ids, task.is_accepted, task.attachments
    ]);
    
    console.log("Insert success:", res.rowCount);
    
    // Clean up
    await client.query("DELETE FROM tasks WHERE id = $1", [task.id]);
    console.log("Cleaned up.");
    
  } catch (err) {
    console.error("Insert failed with error:", err);
  } finally {
    await client.end();
  }
}

run();
