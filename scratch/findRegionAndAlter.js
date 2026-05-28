import pg from 'pg';

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

async function tryRegionAndAlter(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Intentando conectar en región: ${region}...`);
  
  const client = new pg.Client({
    user: 'postgres.mwzxggqwzmuzzoqsxufo',
    host: host,
    database: 'postgres',
    password: 'HomeHubPassword2026!',
    port: 6543, // Puerto del pooler de Supabase
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`¡Conectado con éxito a la región: ${region}!`);
    
    console.log("Ejecutando ALTER TABLE para modificar las categorías...");
    // 1. Eliminar restricción CHECK vieja si existe
    await client.query("ALTER TABLE public.shopping_items DROP CONSTRAINT IF EXISTS shopping_items_category_check;");
    console.log("Restricción vieja eliminada.");
    
    // 2. Crear la restricción CHECK nueva
    await client.query(`
      ALTER TABLE public.shopping_items 
      ADD CONSTRAINT shopping_items_category_check 
      CHECK (category IN ('Frescos', 'Lácteos', 'Lacteos', 'Refrigerados', 'Despensa', 'Congelados', 'Limpieza', 'Higiene'));
    `);
    console.log("Nueva restricción CHECK añadida correctamente con las 7 categorías.");
    
    await client.end();
    return true;
  } catch (err) {
    console.error(`Error en región ${region}:`, err.message);
    try {
      await client.end();
    } catch(e) {}
    return false;
  }
}

async function run() {
  for (const r of regions) {
    const success = await tryRegionAndAlter(r);
    if (success) {
      console.log("¡Operación completada con éxito!");
      break;
    }
  }
}

run();
