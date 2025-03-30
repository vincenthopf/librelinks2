// Main optimization script for development environment
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const numCPUs = os.cpus().length;
const totalMemoryGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
// Keep cluster workers at 4 for stability
const MAX_CLUSTER_WORKERS = Math.min(4, numCPUs - 1);
// Calculate memory for master and workers (aim for ~70% total usage)
const totalMemoryToUseMB = totalMemoryGB * 1024 * 0.7;
const masterMemoryMB = Math.max(1024, Math.floor(totalMemoryToUseMB * 0.2)); // Master gets ~20% or 1GB min
const memoryPerWorkerMB = Math.max(
  1024,
  Math.floor((totalMemoryToUseMB - masterMemoryMB) / MAX_CLUSTER_WORKERS)
); // Workers share the rest

console.log('🚀 Starting development environment optimization (Cluster + SWC)...');
console.log(`💻 System: ${numCPUs} CPU cores (Intel i7-10700K), ${totalMemoryGB}GB RAM`);
console.log(`   - Using ${MAX_CLUSTER_WORKERS} cluster workers (processes)`);
console.log(`   - Master process memory: ~${Math.round((masterMemoryMB / 1024) * 10) / 10}GB`);
console.log(`   - Memory per worker: ~${Math.round((memoryPerWorkerMB / 1024) * 10) / 10}GB`);
console.log('🧰 Running on Windows 10 Pro (Build 19045)');

// Install required dependencies (cross-env primarily now)
console.log('\n📦 Ensuring required dependencies are installed...');
try {
  execSync('npm list cross-env || npm install --save-dev cross-env', { stdio: 'inherit' });
} catch (error) {
  console.error('⚠️ Non-critical error installing dependencies:', error.message);
}

// Create optimized environment settings
const envPath = path.join(process.cwd(), '.env.development.local');

const envSettings = `# Next.js Development Optimization (Cluster + SWC)
# Generated for ${numCPUs}-core system with ${totalMemoryGB}GB RAM

# Memory limit for MASTER process
NODE_OPTIONS=--max-old-space-size=${masterMemoryMB}

# Enable default webpack caching
NEXT_WEBPACK_FILESYSTEM_CACHE=true

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
`;

try {
  fs.writeFileSync(envPath, envSettings);
  console.log(`✅ Created optimized development settings at ${envPath}`);
} catch (error) {
  console.error('❌ Error writing environment file:', error.message);
}

// Create dev-start.bat for Windows users
const batchContent = `@echo off
echo 🚀 Starting LibreLinks with Cluster + SWC optimization...
echo 💻 System: ${numCPUs} CPU cores (Intel i7-10700K)
echo ⚡ Using ${MAX_CLUSTER_WORKERS} cluster workers (processes)
echo 🌐 Your app will be available at: http://localhost:3000
cd /d "%~dp0.."
node scripts/dev-cluster.js
`;

const batchPath = path.join(__dirname, '..', 'dev-start.bat');
fs.writeFileSync(batchPath, batchContent);
console.log(`✅ Created ${batchPath} for easy startup`);

console.log('\n✨ Optimization complete! (Cluster + SWC)');
console.log('👉 To start the optimized development server:');
console.log('   1. Run `npm run dev` - Utilizes cluster workers + SWC');
console.log('   2. Run the dev-start.bat file directly');
console.log('\n🌐 Your application will be available at: http://localhost:3000');
console.log('⚡ Your development environment is optimized! ⚡');
