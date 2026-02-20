// Função otimizada para normalizar texto
  export function normalizeText(text: string): string {
    if (!text || text?.length < 1) return '';
    return `${text}`
      .toLowerCase()
      .replace(/ trophies/g,'')
      .replace(/troféus do /g,'')
      .replace(/troféus de /g,'')
      .replace(/ ps4™ e ps5™/g,'')
      .replace(/ trophy set/g,'')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/™/g,'')
      .replace(/®/g,'')
      .replace(/\/n/g,'')
      .trim();
  }