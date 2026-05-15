#!/bin/bash

# Setup Git Hooks para CodePlay
# Instala pre-commit para rodar testes automaticamente

echo "🔧 Configurando Git Hooks..."

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

# Criar diretório se não existir
mkdir -p $HOOK_DIR

# Copiar hook
cp scripts/pre-commit $HOOK_FILE

# Dar permissão de execução
chmod +x $HOOK_FILE

echo "✅ Hook instalado em $HOOK_FILE"
echo ""
echo "📋 O que vai acontecer:"
echo "  - Antes de cada commit, testes serão executados"
echo "  - Se testes falharem, commit é bloqueado"
echo "  - Use 'git commit --no-verify' para pular (não recomendado)"
echo ""
echo "Você pode testar com:"
echo "  git commit -m 'test: commit com verificação'"
