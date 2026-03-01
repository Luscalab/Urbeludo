
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Dinâmica para detecção de heróis locais.
 * Varre public/assets/avatars e retorna todos os arquivos de imagem.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  // Em ambientes Next.js, process.cwd() aponta para a raiz do projeto
  const avatarsDir = path.join(process.cwd(), 'public', 'assets', 'avatars');
  
  try {
    // Garante que a pasta exista para evitar erros de leitura
    if (!fs.existsSync(avatarsDir)) {
      console.warn(`Diretório não encontrado: ${avatarsDir}. Criando diretório...`);
      fs.mkdirSync(avatarsDir, { recursive: true });
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Filtra apenas arquivos de imagem válidos, independente do nome
    const images = files.filter(file => {
      const isHidden = file.startsWith('.');
      const isImage = /\.(png|jpe?g|svg|webp|avif|bmp|gif)$/i.test(file);
      return !isHidden && isImage;
    });
    
    // Ordenação alfabética para consistência no seletor
    images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Falha na varredura de avatares:', error);
    return NextResponse.json([]);
  }
}
