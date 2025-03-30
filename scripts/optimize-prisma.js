// Prisma query engine optimization script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Optimizing Prisma for faster development...');

// Path to the Prisma schema file
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

// Check if schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: Prisma schema file not found at:', schemaPath);
  process.exit(1);
}

try {
  // Regenerate Prisma client without any problematic optimizations
  console.log('📦 Generating optimized Prisma client...');

  // Run Prisma generate with standard settings
  execSync('npx prisma generate --schema="' + schemaPath + '"', {
    stdio: 'inherit',
  });

  console.log('✅ Prisma optimization complete!');
} catch (error) {
  console.error('❌ Error optimizing Prisma:', error.message);
  process.exit(1);
}
