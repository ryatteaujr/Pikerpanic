export function formatTimer(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60).toString().padStart(2, '0');
  const remainder = (clamped % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function getLoadPerformancePerHour(completedPicks: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || completedPicks <= 0) {
    return 0;
  }
  return Math.round((completedPicks / elapsedSeconds) * 3600);
}
