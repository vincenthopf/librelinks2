const cluster = require('cluster');
const os = require('os');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Get CPU count and configure workers
const numCPUs = os.cpus().length;
// Limit to a maximum of 4 workers for stability
const MAX_CLUSTER_WORKERS = Math.min(4, numCPUs - 1);
const BASE_PORT = 3000;

// Calculate memory for master and workers (aim for ~70% total usage)
const totalMemoryGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
const totalMemoryToUseMB = totalMemoryGB * 1024 * 0.7;
const masterMemoryMB = Math.max(1024, Math.floor(totalMemoryToUseMB * 0.2)); // Master gets ~20% or 1GB min
const memoryPerWorkerMB = Math.max(
  1024,
  Math.floor((totalMemoryToUseMB - masterMemoryMB) / MAX_CLUSTER_WORKERS)
); // Workers share the rest

// Use clustering to take advantage of multiple cores
if (cluster.isMaster) {
  console.log(`🚀 Master process running with PID ${process.pid}`);
  console.log(`💻 System has ${numCPUs} cores, using ${MAX_CLUSTER_WORKERS} worker processes`);
  console.log(
    `   - Master memory limit: ~${Math.round((masterMemoryMB / 1024) * 10) / 10}GB (via NODE_OPTIONS)`
  );
  console.log(
    `   - Memory limit per worker: ~${Math.round((memoryPerWorkerMB / 1024) * 10) / 10}GB`
  );

  console.log(`\n🌐 Your app will be available at: http://localhost:${BASE_PORT}\n`);

  // Fork workers with assigned ports and memory limits
  for (let i = 0; i < MAX_CLUSTER_WORKERS; i++) {
    const port = BASE_PORT + i;
    const workerEnv = {
      ...process.env, // Inherit parent env (including master NODE_OPTIONS)
      NODE_OPTIONS: `--max-old-space-size=${memoryPerWorkerMB}`,
      NEXT_WORKER_ID: i + 1,
      PORT: port,
    };
    const worker = cluster.fork(workerEnv);
    console.log(`👷 Worker ${i + 1} starting with PID ${worker.process.pid} on port ${port}`);
  }

  // Log active workers
  Object.keys(cluster.workers).forEach(id => {
    console.log(`✅ Worker running with ID: ${cluster.workers[id].process.pid}`);
  });

  // Handle worker exit and restart them if they die
  cluster.on('exit', (worker, code, signal) => {
    const workerId = worker.process.env.NEXT_WORKER_ID || 'unknown';
    const port = worker.process.env.PORT || BASE_PORT;
    console.log(
      `❌ Worker ${workerId} (PID: ${worker.process.pid}) died with code ${code} and signal ${signal || 'none'}`
    );
    console.log(`🔄 Starting a new worker to replace it...`);

    // Restart the worker with the same environment
    const workerEnv = {
      ...process.env,
      NODE_OPTIONS: `--max-old-space-size=${memoryPerWorkerMB}`,
      NEXT_WORKER_ID: workerId,
      PORT: port,
    };
    const newWorker = cluster.fork(workerEnv);
    console.log(
      `👷 New worker ${workerId} started with PID ${newWorker.process.pid} on port ${port}`
    );
  });

  // Handle SIGINT to gracefully shut down workers
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT. Shutting down all workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });
} else {
  // Worker process - run Next.js
  const workerId = process.env.NEXT_WORKER_ID || 1;
  const port = process.env.PORT || BASE_PORT;

  try {
    console.log(`🔥 Worker ${workerId} running Next.js development server on port ${port}`);

    // Run Next.js dev with specific port
    execSync(`next dev -p ${port}`, {
      stdio: 'inherit',
      // Environment variables (including NODE_OPTIONS) are already set by cluster.fork
      env: process.env,
    });
  } catch (error) {
    console.error(`💥 Worker ${workerId} encountered an error:`, error.message);
    process.exit(1);
  }
}
