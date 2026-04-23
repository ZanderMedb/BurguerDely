#!/bin/bash
# Script de instalação - Burguer Dely
echo "🍔 Burguer Dely - Instalação automática"
echo "========================================"

# Verifica se tem Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Instale em: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Prefere Bun, senão usa npm
if command -v bun &> /dev/null; then
  echo "✅ Bun $(bun -v) encontrado"
  echo "📦 Instalando dependências com Bun..."
  bun install
  echo ""
  echo "✅ Pronto! Para rodar o projeto:"
  echo "   bun dev"
else
  echo "⚠️  Bun não encontrado, usando npm..."
  npm install
  echo ""
  echo "✅ Pronto! Para rodar o projeto:"
  echo "   npm run dev"
fi

echo ""
echo "🌐 Acesse: http://localhost:8080"
