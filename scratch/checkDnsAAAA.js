import dns from 'dns';

dns.resolve6('db.mwzxggqwzmuzzoqsxufo.supabase.co', (err, addresses) => {
  if (err) {
    console.error("Error resolviendo DNS AAAA:", err);
  } else {
    console.log("Direcciones IPv6 resueltas:", addresses);
  }
});
