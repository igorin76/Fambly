const TOKEN = 'sbp_v0_e144d1aa44cde560444e96bdeb222284b1382142';
const REF = 'mwzxggqwzmuzzoqsxufo';

async function fetchEndpoint(path) {
  const url = `https://api.supabase.com/v1/projects/${REF}/${path}`;
  console.log(`Fetching: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error fetching ${path}:`, err.message);
  }
}

async function run() {
  await fetchEndpoint('config/database/pgbouncer');
  await fetchEndpoint('config/database/pooler');
  await fetchEndpoint('config/database/pooling');
  await fetchEndpoint('config/database');
}

run();
