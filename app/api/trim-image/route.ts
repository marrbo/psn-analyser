// app/api/process-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, padding = 30, quality = 90 } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Baixar a imagem
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Falha ao buscar imagem: ${imageResponse.status}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Processar com Sharp
    let sharpInstance = sharp(buffer);
    
    // Obter metadados primeiro
    const metadata = await sharpInstance.metadata();
    
    // Aplicar corte de transparência
    sharpInstance = sharpInstance
    .trim({
        threshold: 30, // Ajuste o limiar conforme necessário
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparente,
    });
    
    // Se padding for especificado, adicionar
    if (padding > 0) {
      sharpInstance = sharpInstance.extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparente
      });
    }

    // Converter para PNG para manter transparência
    const processedBuffer = await sharpInstance
      .png({ quality: Math.min(100, Math.max(1, quality)) })
      .toBuffer();

    // Obter novas dimensões
    const newMetadata = await sharp(processedBuffer).metadata();

    // Converter para base64
    const base64Image = processedBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      imageData: dataUrl,
      width: newMetadata.width || metadata.width || 400,
      height: newMetadata.height || metadata.height || 400,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      format: 'png',
    });

  } catch (error) {
    console.error('Erro no processamento de imagem:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        suggestion: 'Verifique se a URL da imagem é acessível e se contém transparência'
      },
      { status: 500 }
    );
  }
}