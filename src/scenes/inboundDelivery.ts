export interface InboundUnloadState {
  unloaded: number;
  target: number;
  carrying: boolean;
}

export interface InboundUnloadResult extends InboundUnloadState {
  completed: boolean;
}

export interface InboundTrainingCompletion {
  scene: 'StartScene';
  message: 'TRAINING COMPLETE';
}

export function isNearInboundPoint(
  actor: { x: number; y: number },
  point: { x: number; y: number },
  radius: number,
): boolean {
  return Math.hypot(actor.x - point.x, actor.y - point.y) <= radius;
}

export function advanceInboundUnload(state: InboundUnloadState): InboundUnloadResult {
  if (!state.carrying) {
    return { ...state, completed: state.unloaded >= state.target };
  }

  const unloaded = Math.min(state.target, state.unloaded + 1);
  return {
    unloaded,
    target: state.target,
    carrying: false,
    completed: unloaded >= state.target,
  };
}

export function getInboundTrainingCompletion(): InboundTrainingCompletion {
  return {
    scene: 'StartScene',
    message: 'TRAINING COMPLETE',
  };
}
