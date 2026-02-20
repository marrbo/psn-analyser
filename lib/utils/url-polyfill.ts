// Polyfill para compatibilidade com APIs de URL

export function safeParseURL(url: string, base?: string): URL {
  try {
    return new URL(url, base);
  } catch (error) {
    // Fallback para URLs malformadas
    console.warn(`URL parsing failed for: ${url}`);
    
    // Tentar corrigir URLs comuns
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return safeParseURL(`https://${url}`, base);
    }
    
    throw error;
  }
}

export function extractCodeFromLocation(location: string): string | null {
  try {
    const url = safeParseURL(location);
    return url.searchParams.get('code');
  } catch {
    // Fallback para regex em caso extremo
    const match = location.match(/[?&]code=([^&]+)/);
    return match ? match[1] : null;
  }
}