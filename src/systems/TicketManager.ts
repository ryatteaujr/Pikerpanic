import type { RequiredTicketLine, TicketItemType } from '../config/levelConfig';

export type PickResultReason = 'picked' | 'wrong' | 'full' | 'complete';

export interface PickResult {
  ok: boolean;
  reason: PickResultReason;
}

export interface UnloadResult {
  unloaded: number;
  completed: boolean;
}

export class TicketManager {
  readonly required: RequiredTicketLine[];
  readonly capacity: number;
  readonly carried = new Map<TicketItemType, number>();
  readonly completed = new Map<TicketItemType, number>();
  correctAttempts = 0;
  totalAttempts = 0;

  constructor(required: RequiredTicketLine[], capacity: number) {
    this.required = required.map((line) => ({ ...line }));
    this.capacity = capacity;
    for (const line of required) {
      this.carried.set(line.type, 0);
      this.completed.set(line.type, 0);
    }
  }

  pick(type: TicketItemType): PickResult {
    this.totalAttempts += 1;

    if (!this.isRequiredType(type) || this.remainingFor(type) <= 0) {
      return { ok: false, reason: 'wrong' };
    }

    if (this.carriedCount >= this.capacity) {
      this.totalAttempts -= 1;
      return { ok: false, reason: 'full' };
    }

    if (this.isComplete) {
      this.totalAttempts -= 1;
      return { ok: false, reason: 'complete' };
    }

    this.carried.set(type, this.countIn(this.carried, type) + 1);
    this.correctAttempts += 1;
    return { ok: true, reason: 'picked' };
  }

  unload(): UnloadResult {
    let unloaded = 0;

    for (const [type, count] of this.carried) {
      if (count <= 0) {
        continue;
      }
      this.completed.set(type, this.countIn(this.completed, type) + count);
      this.carried.set(type, 0);
      unloaded += count;
    }

    return { unloaded, completed: this.isComplete };
  }

  get carriedCount(): number {
    return [...this.carried.values()].reduce((sum, count) => sum + count, 0);
  }

  get completedCount(): number {
    return [...this.completed.values()].reduce((sum, count) => sum + count, 0);
  }

  get totalRequired(): number {
    return this.required.reduce((sum, line) => sum + line.quantity, 0);
  }

  get isComplete(): boolean {
    return this.completedCount >= this.totalRequired;
  }

  get accuracyPercent(): number {
    if (this.totalAttempts === 0) {
      return 100;
    }
    return Math.round((this.correctAttempts / this.totalAttempts) * 100);
  }

  getLines(): Array<RequiredTicketLine & { completed: number; carried: number }> {
    return this.required.map((line) => ({
      ...line,
      completed: this.countIn(this.completed, line.type),
      carried: this.countIn(this.carried, line.type),
    }));
  }

  private remainingFor(type: TicketItemType): number {
    const line = this.required.find((item) => item.type === type);
    if (!line) {
      return 0;
    }
    return line.quantity - this.countIn(this.completed, type) - this.countIn(this.carried, type);
  }

  private isRequiredType(type: TicketItemType): boolean {
    return this.required.some((line) => line.type === type);
  }

  private countIn(map: Map<TicketItemType, number>, type: TicketItemType): number {
    return map.get(type) ?? 0;
  }
}
