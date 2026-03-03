#!/usr/bin/env pwsh

# Script para copiar arquivos do Elevador
# Execute: pwsh -ExecutionPolicy Bypass -File copy-elevador.ps1

Write-Host "🚀 Iniciando cópia dos arquivos do Elevador..." -ForegroundColor Cyan

$origem = "ENTRADA"
$destino = "public/assets/elevador"

# Criar pasta destino
if (-not (Test-Path $destino)) {
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
    Write-Host "✓ Pasta criada: $destino" -ForegroundColor Green
}

# Copiar imagens 1-7
Write-Host "`nCopiando imagens de estágios..." -ForegroundColor Yellow
for ($i = 1; $i -le 7; $i++) {
    $arquivo = "$i.png"
    $caminho_origem = Join-Path $origem $arquivo
    $caminho_destino = Join-Path $destino $arquivo
    
    if (Test-Path $caminho_origem) {
        Copy-Item -Path $caminho_origem -Destination $caminho_destino -Force
        Write-Host "  ✓ $arquivo copiado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $arquivo NÃO ENCONTRADO" -ForegroundColor Red
    }
}

# Copiar arquivos especiais
Write-Host "`nCopiando arquivos especiais..." -ForegroundColor Yellow
$especiais = @("cabine.png", "spritesheet.png", "tela-inicial.png")

foreach ($arquivo in $especiais) {
    $caminho_origem = Join-Path $origem $arquivo
    $caminho_destino = Join-Path $destino $arquivo
    
    if (Test-Path $caminho_origem) {
        Copy-Item -Path $caminho_origem -Destination $caminho_destino -Force
        Write-Host "  ✓ $arquivo copiado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $arquivo NÃO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host "`n✅ Cópia concluída!" -ForegroundColor Green
Write-Host "`nArquivos em $destino`:" -ForegroundColor Cyan
Get-ChildItem -Path $destino | ForEach-Object { Write-Host "  - $($_.Name)" }
