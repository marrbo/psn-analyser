// utils/iso8601Duration.ts
export interface ParsedDuration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalMilliseconds: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
}

/**
 * Converte uma string ISO 8601 Duration para objeto ParsedDuration
 * Suporta formatos: PnYnMnDTnHnMnS, PnW, PTnHnMnS, etc.
 */
export function parseISODuration(duration: string): ParsedDuration | null {
  if (!duration || typeof duration !== 'string') {
    return null;
  }

  const regex = /^(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?$/i;
  const matches = duration.match(regex);

  if (!matches) {
    console.warn(`Formato de duração ISO 8601 inválido: ${duration}`);
    return null;
  }

  // Extrair valores dos grupos (índices 2-8)
  const [
    ,
    sign, // Grupo 1: sinal negativo
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds
  ] = matches;

  const isNegative = sign === '-';
  const multiplier = isNegative ? -1 : 1;

  // Função auxiliar para converter string para número
  const parseNumber = (value: string | undefined): number => {
    if (!value) return 0;
    // Substitui vírgula por ponto para parseFloat
    return parseFloat(value.replace(',', '.')) * multiplier;
  };

  const parsedValues = {
    years: parseNumber(years),
    months: parseNumber(months),
    weeks: parseNumber(weeks),
    days: parseNumber(days),
    hours: parseNumber(hours),
    minutes: parseNumber(minutes),
    seconds: parseNumber(seconds)
  };

  // Calcular milissegundos totais
  // Nota: Mês e ano são ambíguos (diferentes números de dias), usamos aproximações
  const daysFromYears = parsedValues.years * 365.25; // Ano juliano médio
  const daysFromMonths = parsedValues.months * 30.4375; // Mês médio
  const totalDays = 
    daysFromYears + 
    daysFromMonths + 
    parsedValues.weeks * 7 + 
    parsedValues.days;

  const totalMilliseconds = 
    totalDays * 24 * 60 * 60 * 1000 +
    parsedValues.hours * 60 * 60 * 1000 +
    parsedValues.minutes * 60 * 1000 +
    parsedValues.seconds * 1000;

  // Separar segundos inteiros da parte fracionária
  const secondsInt = Math.floor(Math.abs(parsedValues.seconds));
  const milliseconds = Math.round((Math.abs(parsedValues.seconds) - secondsInt) * 1000);

  return {
    years: Math.abs(parsedValues.years),
    months: Math.abs(parsedValues.months),
    weeks: Math.abs(parsedValues.weeks),
    days: Math.abs(parsedValues.days),
    hours: Math.abs(parsedValues.hours),
    minutes: Math.abs(parsedValues.minutes),
    seconds: secondsInt,
    milliseconds,
    totalMilliseconds: Math.abs(totalMilliseconds),
    totalSeconds: Math.abs(totalMilliseconds) / 1000,
    totalMinutes: Math.abs(totalMilliseconds) / (1000 * 60),
    totalHours: Math.abs(totalMilliseconds) / (1000 * 60 * 60),
    totalDays: Math.abs(totalMilliseconds) / (1000 * 60 * 60 * 24),
  };
}

/**
 * Formata uma duração para string legível
 */
export function formatDuration(
  duration: ParsedDuration, 
  options?: {
    includeDays?: boolean;
    includeHours?: boolean;
    includeMinutes?: boolean;
    includeSeconds?: boolean;
    compact?: boolean;
  }
): string {
  const {
    includeDays = true,
    includeHours = true,
    includeMinutes = true,
    includeSeconds = true,
    compact = false
  } = options || {};

  const parts: string[] = [];

  if (includeDays && duration.days > 0) {
    parts.push(compact ? `${duration.days}d` : `${duration.days} dia${duration.days !== 1 ? 's' : ''}`);
  }

  if (includeHours && duration.hours > 0) {
    parts.push(compact ? `${duration.hours}h` : `${duration.hours} hora${duration.hours !== 1 ? 's' : ''}`);
  }

  if (includeMinutes && duration.minutes > 0) {
    parts.push(compact ? `${duration.minutes}m` : `${duration.minutes} minuto${duration.minutes !== 1 ? 's' : ''}`);
  }

  if (includeSeconds && (duration.seconds > 0 || parts.length === 0)) {
    const secondsPart = duration.milliseconds > 0 
      ? `${duration.seconds}.${duration.milliseconds.toString().padStart(3, '0')}`
      : `${duration.seconds}`;
    parts.push(compact ? `${secondsPart}s` : `${secondsPart} segundo${duration.seconds !== 1 ? 's' : ''}`);
  }

  return parts.join(compact ? ' ' : ', ');
}

/**
 * Converte para formato HH:MM:SS
 */
export function toHHMMSS(duration: ParsedDuration): string {
  const totalSeconds = Math.floor(duration.totalSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Converte para formato humano (ex: "9 dias, 12 horas, 56 minutos, 33 segundos")
 */
export function toHumanReadable(duration: ParsedDuration): string {
  return formatDuration(duration, { compact: false });
}