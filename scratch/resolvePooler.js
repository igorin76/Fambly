import dns from 'dns';

const regions = [
  'eu-west-3',
  'eu-west-1',
  'eu-central-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1'
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    dns.resolve(host, (err, addresses) => {
      if (err) {
        resolve({ region, host, status: 'error', err: err.code });
      } else {
        resolve({ region, host, status: 'ok', addresses });
      }
    });
  });
}

async function run() {
  console.log("Probando resolución DNS de poolers de Supabase...");
  for (const r of regions) {
    const res = await checkRegion(r);
    console.log(`Región ${res.region}: ${res.status} (${res.status === 'ok' ? res.addresses.join(', ') : res.err})`);
  }
}

run();
