// components/DurationDisplay.tsx
"use client";

import { parseISODuration, toHHMMSS, toHumanReadable, ParsedDuration } from "@/utils/iso8601Duration";
import { useState, useEffect } from "react";

interface DurationDisplayProps {
  isoDuration: string;
  format?: "hhmmss" | "human" | "compact" | "full" | "hours";
  className?: string;
}

export default function DurationDisplay({ 
  isoDuration, 
  format = "hhmmss",
  className = ""
}: DurationDisplayProps) {
  const [duration, setDuration] = useState<ReturnType<typeof parseISODuration>>(null);

  useEffect(() => {
    const parsed = parseISODuration(isoDuration);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDuration(parsed);
  }, [isoDuration]);

  if (!duration) {
    return <span className={className}>--:--:--</span>;
  }

  const renderContent = () => {
    switch (format) {
      case "hhmmss":
        return toHHMMSS(duration);
      case "human":
        return toHumanReadable(duration);
      case "compact":
        return `${Math.floor(duration.totalHours)}h ${duration.minutes}m ${duration.seconds}s`;
      case "hours":
        return `${Math.floor(duration.totalHours)}h`;
      case "full":
        return (
          <div className="flex flex-col">
            <span>{toHHMMSS(duration)}</span>
            <span className="text-xs text-gray-500">
              {toHumanReadable(duration)}
            </span>
          </div>
        );
      default:
        return toHHMMSS(duration);
    }
  };

  return (
    <span className={className}>
      {renderContent()}
    </span>
  );
}

// Componente para tempo total de jogo acumulado
export function GameTimeDisplay({ durations }: { durations: string[] }) {
  const [totalDuration, setTotalDuration] = useState<ParsedDuration | null>(null);

  useEffect(() => {
    let totalMs = 0;
    
    durations.forEach(duration => {
      const parsed = parseISODuration(duration);
      if (parsed) {
        totalMs += parsed.totalMilliseconds;
      }
    });

    // Converter milissegundos de volta para ParsedDuration
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const remainingMs = totalMs % (1000 * 60 * 60 * 24);
    const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMs2 = remainingMs % (1000 * 60 * 60);
    const totalMinutes = Math.floor(remainingMs2 / (1000 * 60));
    const remainingMs3 = remainingMs2 % (1000 * 60);
    const totalSeconds = Math.floor(remainingMs3 / 1000);
    const milliseconds = remainingMs3 % 1000;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalDuration({
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
    });
  }, [durations]);

  if (!totalDuration) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">Tempo Total:</span>
      <DurationDisplay 
        isoDuration={`PT${Math.floor(totalDuration.totalHours)}H${totalDuration.minutes}M${totalDuration.seconds}S`}
        format="human"
      />
      <span className="text-sm text-gray-500">
        ({toHHMMSS(totalDuration)})
      </span>
    </div>
  );
}