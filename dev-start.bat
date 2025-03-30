@echo off
echo 🚀 Starting LibreLinks with Cluster + SWC optimization...
echo 💻 System: 16 CPU cores (Intel i7-10700K)
echo ⚡ Using 4 cluster workers (processes)
echo 🌐 Your app will be available at: http://localhost:3000
cd /d "%~dp0.."
node scripts/dev-cluster.js
