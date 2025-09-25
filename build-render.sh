#!/bin/bash
set -e

echo "🚀 Iniciando build para Render..."

# Instalar dependências de produção primeiro
echo "📦 Instalando dependências de produção..."
npm ci --only=production

# Instalar dependências de desenvolvimento para build
echo "🔧 Instalando dependências de desenvolvimento..."
npm install --include=dev

# Executar build
echo "🏗️ Executando build..."
npm run build

# Remover dependências de desenvolvimento após build
echo "🧹 Limpando dependências de desenvolvimento..."
npm prune --production

echo "✅ Build concluído com sucesso!"
