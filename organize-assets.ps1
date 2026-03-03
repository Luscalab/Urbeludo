# Script para organizar os arquivos do jogo elevador
# As imagens devem estar em /public/assets/elevador/
# Imagens numeradas (1-7) devem ser movidas de /public/games/elevador/ para /public/assets/elevador/
# Imagens especiais da ENTRADA (cabine, tela inicial, spreedsheet) devem ir para /public/assets/elevador/

Write-Host "=== Organizando arquivos do Elevador ===" -ForegroundColor Green

$sourceGames = "./public/games/elevador"
$sourceEntrada = "./ENTRADA"
$targetAssets = "./public/assets/elevador"

# Criar pasta de destino se não existir
if (-not (Test-Path $targetAssets)) {
    New-Item -ItemType Directory -Path $targetAssets -Force
    Write-Host "✓ Pasta criada: $targetAssets" -ForegroundColor Green
}

# Mover imagens numeradas (1-7) de games para assets
Write-Host "`nMovendo imagens numeradas..." -ForegroundColor Cyan
for ($i = 1; $i -le 7; $i++) {
    $imgName = "$i.png"
    $source = Join-Path $sourceGames $imgName
    $target = Join-Path $targetAssets $imgName
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $target -Force
        Write-Host "✓ $imgName copiado para /public/assets/elevador/" -ForegroundColor Green
    }
}

# Copiar arquivos especiais de ENTRADA
Write-Host "`nCopando arquivos especiais da pasta ENTRADA..." -ForegroundColor Cyan

# cabine.png
$cabiSrc = Join-Path $sourceEntrada "cabine.png"
if (Test-Path $cabiSrc) {
    Copy-Item -Path $cabiSrc -Destination "$targetAssets/cabine.png" -Force
    Write-Host "✓ cabine.png copiado" -ForegroundColor Green
}

# tela inical.png -> tela-inicial.png (renomear e normalizar)
$telaSrc = Join-Path $sourceEntrada "tela inical.png"
if (Test-Path $telaSrc) {
    Copy-Item -Path $telaSrc -Destination "$targetAssets/tela inical.png" -Force
    Write-Host "✓ tela inical.png copiado" -ForegroundColor Green
}

# spreedsheet.png
$sprSrc = Join-Path $sourceEntrada "spreedsheet.png"
if (Test-Path $sprSrc) {
    Copy-Item -Path $sprSrc -Destination "$targetAssets/spreedsheet.png" -Force
    Write-Host "✓ spreedsheet.png copiado" -ForegroundColor Green
}

Write-Host "`n=== Organização concluída! ===" -ForegroundColor Green
Write-Host "Verificando arquivos finais em $targetAssets..." -ForegroundColor Cyan
Get-ChildItem -Path $targetAssets | Select-Object Name | Format-Table
