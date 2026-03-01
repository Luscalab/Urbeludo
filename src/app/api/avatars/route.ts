
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API para listar dinamicamente todos os arquivos de imagem na pasta de avatares.
 * Caminho atualizado: public/assets/avatars
 */
export async function GET() {
  const avatarsDir = path.join(process.cwd(), 'public/assets/avatars');
  
  try {
    if (!fs.existsSync(avatarsDir)) {
      console.warn('Diretório de avatares não encontrado em:', avatarsDir);
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    // Filtra apenas arquivos de imagem comuns e ignora arquivos ocultos
    const images = files.filter(file => 
      !file.startsWith('.') && /\.(png|jpe?g|svg|webp)$/i.test(file)
    );
    
    // Ordenação alfabética ou numérica para consistência
    images.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      if (numA && numB) return numA - numB;
      return a.localeCompare(b);
    });
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Erro crítico ao ler diretório de avatares:', error);
    return NextResponse.json([]);
  }
}
