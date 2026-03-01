import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API para listar dinamicamente todos os arquivos de imagem na pasta de avatares.
 * Caminho absoluto: public/assets/avatars
 */
export async function GET() {
  const avatarsDir = path.join(process.cwd(), 'public', 'assets', 'avatars');
  
  try {
    // Garante que o diretório existe
    if (!fs.existsSync(avatarsDir)) {
      console.warn(`Diretório não encontrado: ${avatarsDir}. Criando...`);
      fs.mkdirSync(avatarsDir, { recursive: true });
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Filtra arquivos de imagem válidos (qualquer extensão de imagem comum)
    const images = files.filter(file => 
      !file.startsWith('.') && /\.(png|jpe?g|svg|webp|avif|bmp|gif)$/i.test(file)
    );
    
    // Ordenação natural para manter consistência no seletor
    images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Erro na varredura de avatares:', error);
    return NextResponse.json([]);
  }
}
