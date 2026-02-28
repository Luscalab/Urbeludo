
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API para listar dinamicamente todos os arquivos de imagem na pasta de avatares.
 * Isso permite que o app aceite qualquer nome de arquivo sem precisar renomear.
 */
export async function GET() {
  const avatarsDir = path.join(process.cwd(), 'public/assets/avatars');
  
  try {
    if (!fs.existsSync(avatarsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    // Filtra apenas arquivos de imagem comuns
    const images = files.filter(file => /\.(png|jpe?g|svg|webp)$/i.test(file));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Erro ao ler diretório de avatares:', error);
    return NextResponse.json([]);
  }
}
