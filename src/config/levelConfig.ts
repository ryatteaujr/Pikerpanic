export type TicketItemType = 'Hammers' | 'Tape' | 'Drill Bits';

export interface RequiredTicketLine {
  type: TicketItemType;
  quantity: number;
}

export const levelConfig = {
  width: 960,
  height: 640,
  hudHeight: 104,
  timerSeconds: 300,
  lives: 3,
  chute: '06',
  ticketNumber: '7824',
  requiredItems: [
    { type: 'Hammers', quantity: 3 },
    { type: 'Tape', quantity: 2 },
    { type: 'Drill Bits', quantity: 1 },
  ] satisfies RequiredTicketLine[],
};
