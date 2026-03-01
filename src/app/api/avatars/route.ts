import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API para listar dinamicamente todos os arquivos de imagem na pasta de avatares.
 * Caminho: public/assets/avatars
 * Forçamos a rota a ser dinâmica para detectar novos arquivos em tempo real.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const avatarsDir = path.join(process.cwd(), 'public', 'assets', 'avatars');
  
  try {
    // Garante que o diretório existe fisicamente
    if (!fs.existsSync(avatarsDir)) {
      console.warn(`Diretório não encontrado: ${avatarsDir}. Criando...`);
      fs.mkdirSync(avatarsDir, { recursive: true });
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Aceita qualquer extensão de imagem comum e ignora arquivos ocultos
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
