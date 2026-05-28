import pg from 'pg';

const connectionString = "postgresql://postgres.mwzxggqwzmuzzoqsxufo:HomeHubPassword2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

async function run() {
  console.log("Conectando a Supabase a través de aws-1-eu-central-1.pooler.supabase.com...");
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("¡Conectado con éxito a la base de datos de Supabase!");
    
    console.log("Ejecutando ALTER TABLE para modificar las categorías en shopping_items...");
    
    // 1. Eliminar restricción CHECK vieja si existe
    await client.query("ALTER TABLE public.shopping_items DROP CONSTRAINT IF EXISTS shopping_items_category_check;");
    console.log("Restricción vieja eliminada.");
    
    // 2. Crear la restricción CHECK nueva
    await client.query(`
      ALTER TABLE public.shopping_items 
      ADD CONSTRAINT shopping_items_category_check 
      CHECK (category IN ('Frescos', 'Lácteos', 'Lacteos', 'Refrigerados', 'Despensa', 'Congelados', 'Limpieza', 'Higiene'));
    `);
    console.log("¡Nueva restricción CHECK añadida correctamente con las 7 categorías!");
  } catch (err) {
    console.error("Error ejecutando la alteración de base de datos:", err);
  } finally {
    await client.end();
  }
}

run();
