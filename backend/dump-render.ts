import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://wallcraft_user:YDO1R7GcHJ03Sxlto1TvIeWjuPz0bxzW@dpg-d6t8sc5m5p6s73b7v5k0-a.frankfurt-postgres.render.com/wallcraft?sslmode=require&connection_limit=1&connect_timeout=30'
    }
  }
});

async function main() {
  for (let i = 0; i < 3; i++) {
    try {
      console.log(`Attempt ${i+1}...`);
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT current_database() as db, COUNT(*) as cnt FROM panels`;
      console.log('SUCCESS:', result);
      
      // Now dump all data
      const dump: Record<string, any[]> = {};
      const tables = ['tenants','users','panels','panel_categories','panel_images','panel_sizes',
        'collections','leads','inquiries','hero_slides','blog_posts','gallery_items',
        'designers','dealers','partners','team_members','projects','page_contents'];
      
      for (const t of tables) {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${t}"`);
        dump[t] = rows as any[];
        console.log(`  ${t}: ${(rows as any[]).length} rows`);
      }
      
      fs.writeFileSync('D:/Wallcraft/wallcraft-data-dump.json', JSON.stringify(dump, null, 2));
      console.log('\nDUMP COMPLETE!');
      return;
    } catch(e: any) {
      console.log(`Attempt ${i+1} failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main().catch(e => console.error('FATAL:', e.message))
  .finally(() => prisma.$disconnect());
