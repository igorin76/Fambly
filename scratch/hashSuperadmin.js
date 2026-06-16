import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('R@ssini76', 10);
  console.log('SUPERADMIN_HASH:', hash);
}

main().catch(console.error);
