export interface InboundReceivingBay {
  x: number;
  y: number;
  label: string;
  color: number;
}

export interface InboundHazard {
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
  label: string;
}

export interface InboundLevelConfig {
  name: string;
  targetPallets: number;
  spawn: { x: number; y: number };
  truckDoor: { x: number; y: number; label: string };
  receivingBays: InboundReceivingBay[];
  hazards: InboundHazard[];
  musicKeys: string[];
}

export const inboundTrainingConfig = {
  name: 'Inbound Delivery Training',
  targetPallets: 6,
  spawn: { x: 180, y: 520 },
  truckDoor: { x: 132, y: 326, label: 'TRUCK DOOR' },
  musicKeys: ['music-expedite-load', 'music-warehouse-gridlock'],
  receivingBays: [
    { x: 680, y: 190, label: 'RECEIVING A', color: 0x68f39a },
    { x: 700, y: 326, label: 'RECEIVING B', color: 0xf0c44c },
    { x: 680, y: 462, label: 'RECEIVING C', color: 0x6fd2ff },
  ],
  hazards: [
    { x: 420, y: 258, minX: 270, maxX: 570, speed: 92, label: 'FORK' },
    { x: 520, y: 414, minX: 320, maxX: 650, speed: -78, label: 'PALLET' },
  ],
} satisfies InboundLevelConfig;

export function getInboundTrainingConfig(): InboundLevelConfig {
  return inboundTrainingConfig;
}
