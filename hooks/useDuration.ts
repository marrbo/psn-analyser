import { ParsedDuration, parseISODuration } from "@/utils/iso8601Duration";
import { useEffect, useState } from "react";

/**
 * Hook React para usar durações ISO 8601
 */
export function useISODuration(durationString: string | null) {
  const [parsed, setParsed] = useState<ParsedDuration | null>(null);

  useEffect(() => {
    if (durationString) {
      const result = parseISODuration(durationString);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [durationString]);

  return parsed;
}