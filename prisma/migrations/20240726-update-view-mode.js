// This is a migration script to convert stackView boolean to viewMode string enum
// for all users in the database
//
// To run this migration:
// 1. Make sure you've run prisma db push to update the schema with the new viewMode field
// 2. Run this script with: node prisma/migrations/20240726-update-view-mode.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting viewMode migration...');

  // Get all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to update`);

  let successCount = 0;
  let errorCount = 0;

  // Process each user
  for (const user of users) {
    try {
      // Convert stackView boolean to viewMode string
      const viewMode = user.stackView === true ? 'stacked' : 'normal';

      // Initialize empty bentoItems array
      const bentoItems = [];

      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          viewMode,
          bentoItems,
          // We don't remove stackView field here since that requires a schema change
          // The prisma db push command will handle removing the field
        },
      });

      successCount++;
    } catch (error) {
      console.error(`Error updating user ${user.id}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(
    `Migration completed: ${successCount} users updated successfully, ${errorCount} errors`
  );
}

main()
  .catch(e => {
    console.error(`Migration failed: ${e.message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
