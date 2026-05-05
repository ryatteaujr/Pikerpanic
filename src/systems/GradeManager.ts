interface GradeInput {
  accuracy: number;
  lives: number;
  remainingSeconds: number;
}

export function getGrade({ accuracy, lives, remainingSeconds }: GradeInput): string {
  if (accuracy === 100 && lives === 3 && remainingSeconds >= 60) {
    return 'S: Perfect Picker';
  }
  if (accuracy >= 95 && remainingSeconds >= 20) {
    return 'A: Load Boss';
  }
  if (accuracy >= 80) {
    return 'B: Solid Shift';
  }
  if (accuracy >= 60) {
    return 'C: Needs Coaching';
  }
  return 'F: Truck Left Without You';
}
