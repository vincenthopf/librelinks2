@echo off
echo 🧹 Clearing Next.js cache for a fresh development start...
cd /d "%~dp0.."
rmdir /s /q .next
echo ✅ Cache cleared! Now you can run dev-start.bat or npm run dev
pause
