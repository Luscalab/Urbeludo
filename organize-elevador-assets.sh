#!/bin/bash

# Script para organizar os arquivos do jogo Elevador
# Uso: bash organize-elevador-assets.sh

set -e

echo "================================"
echo "  Organizando Arquivos Elevador"
echo "================================"

SOURCE_GAMES="./public/games/elevador"
SOURCE_ENTRADA="./ENTRADA"
TARGET_ASSETS="./public/assets/elevador"

# Criar diretório de destino
mkdir -p "$TARGET_ASSETS"
echo "✓ Diretório criado/verificado: $TARGET_ASSETS"

# Copiar imagens numeradas (1-7) de /public/games/elevador para /public/assets/elevador
echo ""
echo "Copiando imagens numeradas (1-7)..."
for i in {1..7}; do
    src="$SOURCE_GAMES/$i.png"
    dst="$TARGET_ASSETS/$i.png"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo "  ✓ Copiado: $i.png"
    else
        echo "  ✗ Não encontrado: $src"
    fi
done

# Copiar arquivos especiais da pasta ENTRADA
echo ""
echo "Copiando arquivos especiais da ENTRADA..."

# cabine.png
if [ -f "$SOURCE_ENTRADA/cabine.png" ]; then
    cp "$SOURCE_ENTRADA/cabine.png" "$TARGET_ASSETS/cabine.png"
    echo "  ✓ Copiado: cabine.png"
else
    echo "  ✗ Não encontrado: cabine.png"
fi

# tela inical.png
if [ -f "$SOURCE_ENTRADA/tela inical.png" ]; then
    cp "$SOURCE_ENTRADA/tela inical.png" "$TARGET_ASSETS/tela inical.png"
    echo "  ✓ Copiado: tela inical.png"
else
    echo "  ✗ Não encontrado: tela inical.png"
fi

# spreedsheet.png
if [ -f "$SOURCE_ENTRADA/spreedsheet.png" ]; then
    cp "$SOURCE_ENTRADA/spreedsheet.png" "$TARGET_ASSETS/spreedsheet.png"
    echo "  ✓ Copiado: spreedsheet.png"
else
    echo "  ✗ Não encontrado: spreedsheet.png"
fi

echo ""
echo "================================"
echo "  Organização Concluída!"
echo "================================"
echo ""
echo "Arquivos em $TARGET_ASSETS:"
ls -lh "$TARGET_ASSETS"
