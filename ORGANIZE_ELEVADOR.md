# Organização de Arquivos do Jogo Elevador

## Status Atual
- **Arquivos no ENTRADA:** 1.png, 2.png, 3.png, 4.png, 5.png, 6.png, 7.png, cabine.png, spreedsheet.png, tela inical.png
- **Arquivos em /public/games/elevador:** 1.png a 10.png
- **Destino:** `/public/assets/elevador/`

## Estrutura de Arquivos Esperada

O jogo **Elevador** usa as seguintes imagens:

```
/public/assets/elevador/
├── 1.png              # Estágio 1 (fundo para nível 1)
├── 2.png              # Estágio 2
├── 3.png              # Estágio 3
├── 4.png              # Estágio 4
├── 5.png              # Estágio 5
├── 6.png              # Estágio 6
├── 7.png              # Estágio 7
├── cabine.png         # Imagem da cabine do elevador
├── spreedsheet.png    # Sprite do robô Aura (IMPORTANTE: usar exatamente este nome com typo)
└── tela inical.png    # Tela inicial (IMPORTANTE: com espaço no nome)
```

## Referências nos Componentes

### elevator-game.tsx
- Referencia os 7 fundos (1.png a 7.png) em: `BACKGROUND_IMAGES[]`
- Referencia cabine: `src="/assets/elevador/cabine.png"`
- Referencia spreedsheet: `style={{ backgroundImage: "url(/assets/elevador/spreedsheet.png)" }}`

### start-screen.tsx
- Referencia tela inicial: `backgroundImage: "url(/assets/elevador/tela%20inical.png)"`
- (Note: espaço é encoded como %20 na URL, mas o arquivo deve ser "tela inical.png")

### elevator-cabin.tsx e outros
- Referencia spreedsheet para animação do Aura

### bio-scan-screen.tsx
- Referencia spreedsheet

### level-complete-modal.tsx, performance-report.tsx
- Referenciam spreedsheet

## Instruções de Organização

### Via VS Code Integrado:

1. **Abra o VS Code** com o workspace Urbeludo
2. **Abra um Terminal Integrado** (Ctrl + `)
3. **Cole um dos comandos abaixo**:

#### Opção A: PowerShell (Windows)
```powershell
$origem = ".\ENTRADA"
$destino = ".\public\assets\elevador"

# Criar diretório de destino
New-Item -ItemType Directory -Path $destino -Force | Out-Null

# Copiar imagens numeradas
for ($i = 1; $i -le 7; $i++) {
    Copy-Item "$origem\$i.png" "$destino\$i.png" -Force
    Write-Host "✓ Copiado: $i.png"
}

# Copiar arquivos especiais
Copy-Item "$origem\cabine.png" "$destino\cabine.png" -Force
Write-Host "✓ Copiado: cabine.png"

Copy-Item "$origem\tela inical.png" "$destino\tela inical.png" -Force
Write-Host "✓ Copiado: tela inical.png"

Copy-Item "$origem\spreedsheet.png" "$destino\spreedsheet.png" -Force
Write-Host "✓ Copiado: spreedsheet.png"

Write-Host "`n✅ Arquivos organizados com sucesso!"
Get-ChildItem $destino | Select-Object Name
```

#### Opção B: Bash/Shell (Linux/Mac/WSL)
```bash
origen="./ENTRADA"
destino="./public/assets/elevador"

mkdir -p "$destino"

for i in {1..7}; do
    cp "$origen/$i.png" "$destino/$i.png"
    echo "✓ Copiado: $i.png"
done

cp "$origen/cabine.png" "$destino/cabine.png"
echo "✓ Copiado: cabine.png"

cp "$origen/tela inical.png" "$destino/tela inical.png"
echo "✓ Copiado: tela inical.png"

cp "$origen/spreedsheet.png" "$destino/spreedsheet.png"
echo "✓ Copiado: spreedsheet.png"

echo "✅ Arquivos organizados com sucesso!"
ls -lh "$destino"
```

### Via Arrastar e Soltar:

Se preferir usar a interface visual do VS Code:

1. **Abra o Explorer** no VS Code (Ctrl + Shift + E)
2. **Navegue para ENTRADA**
3. **Selecione os arquivos:**
   - 1.png a 7.png
   - cabine.png
   - spreedsheet.png
   - tela inical.png
4. **Rode os arquivos para `/public/assets/elevador/`**

### Via Terminal do VS Code (Mais Simples):

Se tiver um terminal Bash/Zsh disponível no VS Code:

```bash
# Navege para o root do projeto
cd "$(pwd)"

# Execute este comando de uma linha
mkdir -p ./public/assets/elevador && for i in {1..7}; do cp "./ENTRADA/$i.png" "./public/assets/elevador/$i.png"; done && cp "./ENTRADA/"{cabine.png,spreedsheet.png,"tela inical.png"} "./public/assets/elevador/" && ls -lh ./public/assets/elevador/
```

## Verificação

Após organizar os arquivos, verifique se os 11 arquivos estão em `/public/assets/elevador/`:

```
cabine.png
spreedsheet.png
tela inical.png
1.png
2.png
3.png
4.png
5.png
6.png
7.png
```

Se todos os arquivo estão lá, o jogo Elevador funcionará corretamente! ✅

## Dicas

- ⚠️ **NÃO mude o nome "spreedsheet.png"** (mesmo que pareça typo, está assim no código)
- ⚠️ **Mantenha o espaço em "tela inical.png"** (mesmo que pareça errado)
- Os arquivos 8.png, 9.png e 10.png em `/public/games/elevador/` não são usados pelo Elevador 2026
- Se precisar limpar depois, pode deletar o conteúdo de `/public/games/elevador/`

## Próximos Passos

Após organizar os arquivos:
1. **Teste o jogo** no modo Playground
2. **Veja o histórico de Aura** para verificar as imagens
3. **Reporte qualquer problema visual** no jogo Elevador
