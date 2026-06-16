import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  'https://mwzxggqwzmuzzoqsxufo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13enhnZ3F3em11enpvcXN4dWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjI2OTUsImV4cCI6MjA5NTI5ODY5NX0.SkuR8S55QIQP9LGWVuI5613h8Ra-bYdq88y1HBNC89o'
);

async function main() {
  // 1. Intentar leer con password_hash
  const { data: members, error } = await supabase.from('members').select('id,first_name,is_admin,email,password_hash');
  
  if (error) {
    console.log('Error al consultar miembros:', error.message);
    console.log('');
    console.log('>>> NECESITAS ejecutar este SQL en el SQL Editor de Supabase:');
    console.log("ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';");
    
    const { data: m2 } = await supabase.from('members').select('id,first_name,is_admin,email');
    if (m2) {
      console.log('\nMiembros actuales:');
      console.log(JSON.stringify(m2, null, 2));
    }
    return;
  }
  
  console.log('Miembros actuales:');
  console.log(JSON.stringify(members, null, 2));
  
  // 2. Generar hash y actualizar admins sin contraseña
  const defaultHash = await bcrypt.hash('12345', 10);
  console.log('\nHash generado:', defaultHash);
  
  const admins = members.filter(m => m.is_admin === true && (!m.password_hash || m.password_hash === ''));
  console.log(`Admins sin contraseña: ${admins.length}`);
  
  for (const admin of admins) {
    const { error: updateError } = await supabase
      .from('members')
      .update({ password_hash: defaultHash })
      .eq('id', admin.id);
    
    if (updateError) {
      console.log(`Error actualizando ${admin.first_name}:`, updateError.message);
    } else {
      console.log(`✅ ${admin.first_name} (${admin.email}) → contraseña por defecto establecida`);
    }
  }
  
  console.log('\n✅ Proceso completado');
}

main().catch(console.error);
