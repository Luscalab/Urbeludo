#!/usr/bin/env node

/**
 * Script para organizar arquivos do jogo Elevador
 * Uso: node organize-elevador-assets.js
 *       npm run organize:elevador (se você adicionar o script ao package.json)
 */

const fs = require('fs');
const path = require('path');

const SOURCE_GAMES = path.join(__dirname, 'public', 'games', 'elevador');
const SOURCE_ENTRADA = path.join(__dirname, 'ENTRADA');
const TARGET_ASSETS = path.join(__dirname, 'public', 'assets', 'elevador');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✓ Diretório criado: ${dir}`, 'green');
  } else {
    log(`✓ Diretório existe: ${dir}`, 'green');
  }
}

function copyFile(source, dest, filename) {
  try {
    if (!fs.existsSync(source)) {
      log(`✗ Arquivo não encontrado: ${filename}`, 'red');
      return false;
    }
    fs.copyFileSync(source, dest);
    log(`  ✓ ${filename}`, 'green');
    return true;
  } catch (err) {
    log(`  ✗ Erro ao copiar ${filename}: ${err.message}`, 'red');
    return false;
  }
}

// Main
async function organize() {
  console.log('');
  log('================================', 'cyan');
  log('  Organizando Arquivos Elevador', 'cyan');
  log('================================', 'cyan');
  console.log('');

  // Criar diretório destino
  ensureDirectory(TARGET_ASSETS);
  console.log('');

  // Copiar imagens numeradas (1-7)
  log('Copiando imagens de estágios (1-7)...', 'cyan');
  let count = 0;

  // Tentar de /public/games/elevador
  for (let i = 1; i <= 7; i++) {
    const filename = `${i}.png`;
    const source = path.join(SOURCE_GAMES, filename);
    const dest = path.join(TARGET_ASSETS, filename);
    if (copyFile(source, dest, filename)) {
      count++;
    }
  }

  // Se não encontrou em games, tenta em ENTRADA
  if (count < 7) {
    log('Algumas imagens não encontradas em /public/games/elevador', 'yellow');
    log('Tentando copiar de ENTRADA...', 'yellow');
    for (let i = 1; i <= 7; i++) {
      const filename = `${i}.png`;
      // Verificar se já foi copiado
      const dest = path.join(TARGET_ASSETS, filename);
      if (fs.existsSync(dest)) {
        continue; // Já copiado
      }
      const source = path.join(SOURCE_ENTRADA, filename);
      if (copyFile(source, dest, filename)) {
        count++;
      }
    }
  }

  console.log('');
  log('Copiando arquivos especiais de ENTRADA...', 'cyan');

  // cabine.png
  copyFile(
    path.join(SOURCE_ENTRADA, 'cabine.png'),
    path.join(TARGET_ASSETS, 'cabine.png'),
    'cabine.png'
  );

  // tela inical.png (com espaço)
  copyFile(
    path.join(SOURCE_ENTRADA, 'tela inical.png'),
    path.join(TARGET_ASSETS, 'tela inical.png'),
    'tela inical.png'
  );

  // spreedsheet.png
  copyFile(
    path.join(SOURCE_ENTRADA, 'spreedsheet.png'),
    path.join(TARGET_ASSETS, 'spreedsheet.png'),
    'spreedsheet.png'
  );

  console.log('');
  log('================================', 'cyan');
  log('  Organização Concluída!', 'cyan');
  log('================================', 'cyan');
  console.log('');

  // Listar arquivos finais
  log(`Arquivos em ${TARGET_ASSETS}:`, 'cyan');
  try {
    const files = fs.readdirSync(TARGET_ASSETS);
    files.forEach((file) => {
      const stat = fs.statSync(path.join(TARGET_ASSETS, file));
      const sizeKB = (stat.size / 1024).toFixed(1);
      log(`  ${file} (${sizeKB}KB)`, 'green');
    });
    log(`\n✅ Total: ${files.length} arquivos`, 'green');
  } catch (err) {
    log(`Erro ao listar diretório: ${err.message}`, 'red');
  }
}

organize().catch((err) => {
  log(`Erro fatal: ${err.message}`, 'red');
  process.exit(1);
});
