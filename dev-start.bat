@echo off
echo 🚀 Starting LibreLinks with Enhanced Multi-core Optimization...
echo 💻 System: 16 CPU cores / 16GB RAM
echo ⚡ Using 6 cluster workers (processes) for optimal parallelism
echo 🌐 Your app will be available at: http://localhost:3000
cd /d "%~dp0.."
set NEXT_SWC=1
set NEXT_TELEMETRY_DISABLED=1
set NEXT_WEBPACK_FILESYSTEM_CACHE=true
set UV_THREADPOOL_SIZE=16
node scripts/dev-cluster.js
