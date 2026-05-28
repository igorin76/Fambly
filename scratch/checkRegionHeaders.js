async function run() {
  const url = 'https://mwzxggqwzmuzzoqsxufo.supabase.co/rest/v1/';
  console.log(`Haciendo petición a ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13enhnZ3F3em11enpvcXN4dWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjI2OTUsImV4cCI6MjA5NTI5ODY5NX0.SkuR8S55QIQP9LGWVuI5613h8Ra-bYdq88y1HBNC89o'
      }
    });
    console.log("Status:", res.status);
    console.log("Headers:");
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (err) {
    console.error("Error en fetch:", err);
  }
}

run();
