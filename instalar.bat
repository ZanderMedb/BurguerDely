@echo off
echo 🍔 Burguer Dely - Instalacao automatica
echo ========================================

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ Node.js nao encontrado. Instale em: https://nodejs.org/
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo ✅ Node.js %NODE_VER% encontrado

where bun >nul 2>nul
if %errorlevel% == 0 (
  for /f "tokens=*" %%i in ('bun -v') do set BUN_VER=%%i
  echo ✅ Bun %BUN_VER% encontrado
  echo 📦 Instalando dependencias com Bun...
  bun install
  echo.
  echo ✅ Pronto! Para rodar o projeto:
  echo    bun dev
) else (
  echo ⚠️  Bun nao encontrado, usando npm...
  npm install
  echo.
  echo ✅ Pronto! Para rodar o projeto:
  echo    npm run dev
)

echo.
echo 🌐 Acesse: http://localhost:8080
pause
