
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API para listar dinamicamente todos os arquivos de imagem na pasta de avatares.
 * Caminho: public/assets/avatars
 */
export async function GET() {
  const avatarsDir = path.join(process.cwd(), 'public/assets/avatars');
  
  try {
    // Verifica se o diretório existe, se não existir cria ou retorna vazio
    if (!fs.existsSync(avatarsDir)) {
      console.warn('Diretório de avatares não encontrado. Criando pasta vazia para referência.');
      // fs.mkdirSync(avatarsDir, { recursive: true }); // Omitido para evitar escrita no server-side em ambientes restritos
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Filtra qualquer arquivo de imagem, ignorando arquivos ocultos (ex: .DS_Store)
    const images = files.filter(file => 
      !file.startsWith('.') && /\.(png|jpe?g|svg|webp)$/i.test(file)
    );
    
    // Ordenação natural para manter consistência visual
    images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Erro ao ler diretório de avatares:', error);
    return NextResponse.json([]);
  }
}
