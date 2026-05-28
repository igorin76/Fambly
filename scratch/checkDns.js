import dns from 'dns';

dns.resolve('db.mwzxggqwzmuzzoqsxufo.supabase.co', (err, addresses) => {
  if (err) {
    console.error("Error resolviendo DNS:", err);
  } else {
    console.log("Direcciones IP resueltas:", addresses);
  }
});
