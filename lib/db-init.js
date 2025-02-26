import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

let prisma;

async function ensureSchemaSync() {
  try {
    // Try to query the Template model to check if it exists
    await prisma.template.findFirst({
      select: { id: true },
      take: 1,
    });
  } catch (error) {
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      console.log(
        'Schema out of sync, attempting automatic synchronization...'
      );
      try {
        // Run prisma generate and db push
        const prismaPath = path.join(process.cwd(), 'node_modules/.bin/prisma');
        execSync(`${prismaPath} generate`, { stdio: 'inherit' });
        execSync(`${prismaPath} db push --accept-data-loss`, {
          stdio: 'inherit',
        });

        // Recreate the client after schema update
        await prisma.$disconnect();
        prisma = new PrismaClient();
        await prisma.$connect();

        console.log('Schema synchronized successfully');
      } catch (syncError) {
        console.error('Failed to synchronize schema:', syncError);
        throw syncError;
      }
    } else {
      throw error;
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  prisma = global.__db;
}

// Initialize schema on first import
ensureSchemaSync().catch(console.error);

export { prisma as db, ensureSchemaSync };
