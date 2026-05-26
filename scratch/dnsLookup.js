import dns from 'dns';

const host = 'aws-0-eu-central-1.pooler.supabase.com';

dns.resolve(host, 'A', (err, addresses) => {
  if (err) {
    console.error("A record resolution failed:", err.message);
  } else {
    console.log("A records:", addresses);
  }
});

dns.resolve(host, 'AAAA', (err, addresses) => {
  if (err) {
    console.error("AAAA record resolution failed:", err.message);
  } else {
    console.log("AAAA records:", addresses);
  }
});

dns.lookup(host, (err, address, family) => {
  if (err) {
    console.error("General lookup failed:", err.message);
  } else {
    console.log(`General lookup: ${address} (family: ${family})`);
  }
});
