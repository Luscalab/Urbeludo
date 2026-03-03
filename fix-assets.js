const fs = require('fs');
const path = require('path');

const entradaDir = path.join(__dirname, 'ENTRADA');

// Mapa de correções: "Nome Errado" => "Nome Correto"
const renames = {
    'spreedsheet.png': 'spritesheet.png',
    'tela inical.png': 'tela-inicial.png'
};

console.log('🔄 Verificando arquivos na pasta ENTRADA...');

if (!fs.existsSync(entradaDir)) {
    console.error('❌ Pasta ENTRADA não encontrada!');
    process.exit(1);
}

Object.keys(renames).forEach(oldName => {
    const oldPath = path.join(entradaDir, oldName);
    const newPath = path.join(entradaDir, renames[oldName]);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renomeado: "${oldName}" -> "${renames[oldName]}"`);
    } else if (fs.existsSync(newPath)) {
        console.log(`👍 Já está correto: "${renames[oldName]}"`);
    } else {
        console.log(`⚠️ Arquivo não encontrado: "${oldName}" (Verifique se já foi movido ou renomeado)`);
    }
});

// Tentar corrigir referências no código (busca simples)
console.log('\n🔄 Buscando referências antigas no código...');
const srcDir = path.join(__dirname, 'src');

function searchAndReplace(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir, { recursive: true });
    
    // Nota: Implementação simplificada. Para um replace completo em todo o projeto,
    // recomenda-se usar o "Find & Replace" do VS Code (Ctrl+Shift+H).
    console.log('ℹ️  Para corrigir o código, use o "Find & Replace" do VS Code:');
    console.log('   1. Buscar: "spreedsheet.png" -> Substituir: "spritesheet.png"');
    console.log('   2. Buscar: "tela inical.png" -> Substituir: "tela-inicial.png"');
}

searchAndReplace(srcDir);