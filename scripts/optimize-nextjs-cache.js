// Next.js cache optimization script
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Optimizing Next.js cache for development performance...');

// Get the CPU count for intelligent cache settings
const cpuCount = os.cpus().length;
const memoryGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
console.log(`💻 System has ${cpuCount} CPU cores and ${memoryGB}GB RAM`);

// Create or update .env.development.local with optimized settings
const envPath = path.join(process.cwd(), '.env.development.local');
const optimizedSettings = `# Next.js Development Optimization Settings
# Generated for system with ${cpuCount} cores and ${memoryGB}GB RAM

# Increase memory limit for Next.js (conservative setting)
NODE_OPTIONS=--max-old-space-size=${Math.min(4096, Math.round(memoryGB * 0.3 * 1024))}

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
`;

try {
  // Create or update the .env.development.local file
  fs.writeFileSync(envPath, optimizedSettings);
  console.log(`✅ Created optimized Next.js development settings at ${envPath}`);

  // Create .swcrc for SWC compiler optimization if it doesn't exist
  const swcrcPath = path.join(process.cwd(), '.swcrc');
  if (!fs.existsSync(swcrcPath)) {
    const swcConfig = {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          dynamicImport: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
        target: 'es2020',
        loose: false,
        externalHelpers: true,
        keepClassNames: true,
      },
      minify: false,
      module: {
        type: 'es6',
        strict: true,
        noInterop: false,
      },
    };

    fs.writeFileSync(swcrcPath, JSON.stringify(swcConfig, null, 2));
    console.log(`✅ Created optimized SWC compiler config at ${swcrcPath}`);
  }

  console.log('✅ Next.js cache optimization complete!');
} catch (error) {
  console.error('❌ Error optimizing Next.js cache:', error.message);
}
