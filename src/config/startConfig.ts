import { isDealerDashLevel } from './dealerDashConfig';
import { isFinaleLevel } from './finaleConfig';
import { isMezzanineLevel } from './mezzanineConfig';
import { isTruckLoadLevel } from './truckLoadConfig';

export const startConfig = {
  scene: 'GameScene',
  level: 1,
} as const;

export function getSceneKeyForLevel(level: number): string {
  if (isDealerDashLevel(level)) {
    return 'DealerDashScene';
  }

  if (isFinaleLevel(level)) {
    return 'FinaleScene';
  }

  if (isTruckLoadLevel(level)) {
    return 'TruckLoadScene';
  }

  if (isMezzanineLevel(level)) {
    return 'MezzanineScene';
  }

  return 'GameScene';
}
