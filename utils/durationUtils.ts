// utils/durationUtils.ts

import { ParsedDuration, parseISODuration } from "./iso8601Duration";


/**
 * Converte duração para minutos arredondados
 */
export function toRoundedMinutes(duration: string): number {
  const parsed = parseISODuration(duration);
  if (!parsed) return 0;
  return Math.round(parsed.totalMinutes);
}

/**
 * Formata duração para horas com decimais
 */
export function toDecimalHours(duration: string): number {
  const parsed = parseISODuration(duration);
  if (!parsed) return 0;
  return Number((parsed.totalHours).toFixed(2));
}



/**
 * Compara duas durações
 */
export function compareDurations(a: string, b: string): number {
  const durationA = parseISODuration(a);
  const durationB = parseISODuration(b);
  
  if (!durationA || !durationB) return 0;
  
  return durationA.totalMilliseconds - durationB.totalMilliseconds;
}

/**
 * Soma múltiplas durações
 */
export function sumDurations(durations: string[]): ParsedDuration | null {
  let totalMs = 0;
  
  for (const duration of durations) {
    const parsed = parseISODuration(duration);
    if (parsed) {
      totalMs += parsed.totalMilliseconds;
    }
  }
  
  // Converter de volta para objeto ParsedDuration
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const remainingMs = totalMs % (1000 * 60 * 60 * 24);
  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMs2 = remainingMs % (1000 * 60 * 60);
  const totalMinutes = Math.floor(remainingMs2 / (1000 * 60));
  const remainingMs3 = remainingMs2 % (1000 * 60);
  const totalSeconds = Math.floor(remainingMs3 / 1000);
  const milliseconds = remainingMs3 % 1000;
  
  return {
    years: 0,
    months: 0,
    weeks: 0,
    days: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds,
    milliseconds,
    totalMilliseconds: totalMs,
    totalSeconds: totalMs / 1000,
    totalMinutes: totalMs / (1000 * 60),
    totalHours: totalMs / (1000 * 60 * 60),
    totalDays: totalMs / (1000 * 60 * 60 * 24),
  };
}