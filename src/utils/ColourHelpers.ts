// src/utils/videoHelpers.ts

export function getScoreColour(teamScore: number, oppScore: number) {
    if (teamScore < oppScore) return "#e72727"; // red
    if (teamScore === oppScore) return "#dc9934"; // Amber
    return "#28c61d"; // Green
  }