@echo off
cd /d "%~dp0.."
echo Starting BlueHazy FM (API on :8080 + site on :8081)...
pnpm dev
