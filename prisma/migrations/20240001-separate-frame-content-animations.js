// This is a migration script to populate the contentAnimation field
// from the existing frameAnimation field for all users
//
// To run this migration:
// 1. Make sure you've run prisma db push to update the schema with the new contentAnimation field
// 2. Run this script with: node prisma/migrations/20240001-separate-frame-content-animations.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting animation migration...');

  // Get all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to update`);

  let successCount = 0;
  let errorCount = 0;

  // Process each user
  for (const user of users) {
    try {
      let frameAnimation = user.frameAnimation;

      // Parse frameAnimation if it's a string
      if (frameAnimation && typeof frameAnimation === 'string') {
        try {
          frameAnimation = JSON.parse(frameAnimation);
        } catch (e) {
          console.error(`Error parsing frameAnimation for user ${user.id}: ${e.message}`);
          frameAnimation = { type: null, enabled: false, config: {} };
        }
      }

      // Create contentAnimation from frameAnimation
      let contentAnimation = {
        type: frameAnimation?.type || null,
        duration: frameAnimation?.duration || 0.5,
        delay: frameAnimation?.delay || 0,
        staggered: frameAnimation?.staggered || false,
        staggerAmount: frameAnimation?.staggerAmount || 0.1,
      };

      // Convert frameAnimation to proper format if needed
      let updatedFrameAnimation = {
        type: frameAnimation?.type || null,
        enabled: frameAnimation?.enabled !== false,
        config: frameAnimation?.config || {},
      };

      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          contentAnimation,
          frameAnimation: updatedFrameAnimation,
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
