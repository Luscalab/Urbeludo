
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API de Varredura Dinâmica de Identidades.
 * Faz a leitura física da pasta public/assets/avatars no servidor.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const avatarsDir = path.join(process.cwd(), 'public', 'assets', 'avatars');
  
  try {
    // Garante que o diretório exista
    if (!fs.existsSync(avatarsDir)) {
      console.warn(`Diretório não encontrado: ${avatarsDir}. Criando...`);
      fs.mkdirSync(avatarsDir, { recursive: true });
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Filtra apenas imagens válidas, independente do nome ou caixa da extensão
    const images = files.filter(file => {
      const isHidden = file.startsWith('.');
      const isImage = /\.(png|jpe?g|svg|webp|avif|bmp|gif)$/i.test(file);
      return !isHidden && isImage;
    });
    
    // Ordenação natural para evitar saltos na interface
    images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Falha crítica na varredura de avatares:', error);
    return NextResponse.json([]);
  }
}
