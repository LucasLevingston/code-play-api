#!/bin/bash

# Setup script para banco de testes da CodePlay API
# Inicia MongoDB de teste e executa testes

set -e

echo "🚀 Iniciando setup de testes..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Iniciar MongoDB de teste
echo "📦 Iniciando MongoDB de teste..."
docker-compose -f docker-compose.test.yml up -d

# Aguardar MongoDB estar pronto
echo "⏳ Aguardando MongoDB ficar pronto..."
for i in {1..30}; do
    if docker exec mongodb_test mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB pronto!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MongoDB não ficou pronto em tempo hábil"
        exit 1
    fi
    sleep 1
done

# Populate test database
echo "🌱 Populando banco de testes..."
npm run seed:test

echo ""
echo "✅ Setup completo! Você pode rodar os testes com:"
echo "   npm test              # Rodar testes uma vez"
echo "   npm run test:watch    # Watch mode"
echo "   npm run test:coverage # Com coverage"
echo ""
echo "Para parar o MongoDB de teste:"
echo "   npm run test:db:down"
