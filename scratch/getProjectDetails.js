// Use native fetch

const TOKEN = 'sbp_v0_e144d1aa44cde560444e96bdeb222284b1382142';

async function run() {
  try {
    const res = await fetch('https://api.supabase.com/v1/projects', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      const text = await res.text();
      console.error(text);
      return;
    }
    
    const projects = await res.json();
    console.log("Proyectos encontrados:");
    console.log(JSON.stringify(projects, null, 2));
  } catch (err) {
    console.error("Error calling Supabase API:", err);
  }
}

run();
