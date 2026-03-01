
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API para listar dinamicamente todos os arquivos de imagem na pasta de avatares.
 * Caminho absoluto: public/assets/avatars
 */
export async function GET() {
  // O diretório 'public' é a raiz para assets estáticos no Next.js
  const avatarsDir = path.join(process.cwd(), 'public/assets/avatars');
  
  try {
    // Verifica se o diretório existe
    if (!fs.existsSync(avatarsDir)) {
      console.warn('Diretório de avatares não encontrado em:', avatarsDir);
      // Tenta criar o diretório caso não exista (útil para primeira execução)
      try {
        fs.mkdirSync(avatarsDir, { recursive: true });
      } catch (e) {
        console.error('Falha ao criar diretório de avatares:', e);
      }
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Filtra qualquer arquivo de imagem válido, ignorando arquivos ocultos de sistema (ex: .DS_Store)
    const images = files.filter(file => 
      !file.startsWith('.') && /\.(png|jpe?g|svg|webp)$/i.test(file)
    );
    
    // Ordenação natural (1.png antes de 10.png)
    images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Erro crítico na varredura de avatares:', error);
    return NextResponse.json([]);
  }
}
