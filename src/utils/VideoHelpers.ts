// src/utils/videoHelpers.ts

function parseTimeStringToSeconds(timeString: string): number {
    const parts = timeString.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      // HH:MM:SS
      const [hh, mm, ss] = parts;
      return hh * 3600 + mm * 60 + ss;
    } else if (parts.length === 2) {
      // MM:SS
      const [mm, ss] = parts;
      return mm * 60 + ss;
    } else if (parts.length === 1) {
      // Just seconds
      return parts[0];
    }
    return 0;
  }
  
  export function buildClipUrl(baseUrl: string, rawTimestamp: string): string {
    if (!baseUrl) return "";
    const lowerUrl = baseUrl.toLowerCase();
  
    // Veo => #t=RAW
    if (lowerUrl.includes("veo")) {
      return `${baseUrl}#t=${rawTimestamp}`;
    }
  
    // YouTube or Google Drive => parse to seconds => ?t=XX or &t=XX
    if (
      lowerUrl.includes("youtube") ||
      lowerUrl.includes("youtu.be") ||
      lowerUrl.includes("drive.google.com")
    ) {
      const totalSeconds = parseTimeStringToSeconds(rawTimestamp);
      if (totalSeconds <= 0) return baseUrl;
      const sep = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${sep}t=${totalSeconds}`;
    }
  
    // Fallback
    return baseUrl;
  }
  