import type { scoringConfig } from '../config/scoringConfig';

type ScoreConfig = typeof scoringConfig;

export class ScoreManager {
  value = 0;

  constructor(private readonly config: ScoreConfig) {}

  addRegularBox(): void {
    this.value += this.config.regularBox;
  }

  addCorrectPick(combo: number): void {
    this.value += this.config.correctPick * Math.max(1, combo);
  }

  addUnload(): void {
    this.value += this.config.unload;
  }

  addCompletionBonus(remainingSeconds: number): void {
    this.value += this.config.completedTicket + Math.max(0, remainingSeconds) * this.config.remainingSecond;
  }

  addWrongPickPenalty(): void {
    this.value = Math.max(0, this.value - this.config.wrongPickPenalty);
  }
}
