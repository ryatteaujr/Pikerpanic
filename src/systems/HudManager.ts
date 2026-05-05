import type { WarehouseLevelConfig } from '../config/levelConfig';
import { pickTruckConfig } from '../config/vehicleConfig';
import type { TicketManager } from './TicketManager';
import { formatTimer, getLoadPerformancePerHour } from './TimerManager';

interface HudState {
  remainingSeconds: number;
  elapsedSeconds: number;
  lives: number;
  score: number;
  combo: number;
  message: string;
  ticket: TicketManager;
  level: WarehouseLevelConfig;
}

export class HudManager {
  private readonly root = document.querySelector<HTMLDivElement>('#hud-root');

  render(state: HudState): void {
    if (!this.root) {
      return;
    }

    const isDanger = state.remainingSeconds <= 30;
    const dangerClass = isDanger ? ' hud-danger' : '';
    const completedPercent = Math.min(100, Math.round((state.ticket.completedCount / state.ticket.totalRequired) * 100));
    const carriedPercent = Math.min(100, Math.round((state.ticket.carriedCount / pickTruckConfig.capacity) * 100));
    const accuracyPercent = state.ticket.accuracyPercent;
    const lph = getLoadPerformancePerHour(state.ticket.completedCount, state.elapsedSeconds);
    const combo = Math.max(1, state.combo);
    const lines = state.ticket
      .getLines()
      .map(
        (line) =>
          `<div class="ticket-line">
            <span>${line.type}</span>
            <strong class="seven-seg">${line.completed + line.carried}/${line.quantity}</strong>
          </div>`,
      )
      .join('');

    this.root.innerHTML = `
      <div class="cabinet-hud${dangerClass}">
        <section class="ops-board" aria-label="Warehouse status board">
          <div class="status-module logo-module">
            <span class="module-kicker">HOUSE-HASSON</span>
            <strong>HARDWARE</strong>
          </div>
          <div class="status-module level-module">
            <span>CURRENT LEVEL</span>
            <strong class="seven-seg">${String(state.level.level).padStart(2, '0')}</strong>
          </div>
          <div class="status-module timer-module">
            <span>TRUCK LOAD</span>
            <strong class="seven-seg">${formatTimer(state.remainingSeconds)}</strong>
            <div class="meter"><i style="width: ${Math.max(0, (state.remainingSeconds / state.level.timerSeconds) * 100)}%"></i></div>
          </div>
          <div class="status-module picks-module">
            <span>PICKS DONE</span>
            <strong class="seven-seg">${String(state.ticket.completedCount).padStart(2, '0')}</strong>
          </div>
          <div class="status-module total-module">
            <span>TOTAL PICKS</span>
            <strong class="seven-seg">${String(state.ticket.totalRequired).padStart(2, '0')}</strong>
          </div>
          <div class="status-module lph-module">
            <span>LPH RATE</span>
            <strong class="seven-seg">${String(lph).padStart(3, '0')}</strong>
          </div>
          <div class="status-module vehicle-module">
            <span>VEHICLE</span>
            <strong>${pickTruckConfig.name}</strong>
          </div>
          <div class="status-module chute-module">
            <span>CHUTE</span>
            <strong class="seven-seg">${state.level.chute}</strong>
          </div>
          <div class="status-module accuracy-module">
            <span>ACCURACY</span>
            <strong class="seven-seg">${String(accuracyPercent).padStart(3, '0')}%</strong>
          </div>
          <div class="status-module combo-module">
            <span>COMBO</span>
            <strong class="seven-seg">x${String(combo).padStart(2, '0')}</strong>
          </div>
          <div class="status-module lives-module">
            <span>LIVES</span>
            <strong class="seven-seg">${String(state.lives).padStart(2, '0')}</strong>
          </div>
          <div class="status-module score-module">
            <span>SCORE</span>
            <strong class="seven-seg">${String(state.score).padStart(6, '0')}</strong>
          </div>
        </section>

        <aside class="left-rail cabinet-rail">
          <section class="mezzanine-panel hud-panel">
            <span class="panel-label">MEZZANINE ACCESS</span>
            <strong>STAIR A-12</strong>
            <p>DECORATIVE PANEL</p>
            <div class="access-slats"><i></i><i></i><i></i></div>
          </section>
          <section class="ticket-panel hud-panel">
            <span class="panel-label">CURRENT ORDER</span>
            <strong>PICK TICKET #${state.level.ticketNumber}</strong>
            ${lines}
            <div class="capacity">
              <span>TRUCK BAY</span>
              <strong class="seven-seg">${state.ticket.carriedCount}/${pickTruckConfig.capacity}</strong>
            </div>
          </section>
        </aside>

        <aside class="right-rail cabinet-rail">
          <section class="vehicle-stats hud-panel">
            <span class="panel-label">VEHICLE STATS</span>
            <div class="stat-meter"><span>CAPACITY</span><b><i style="width: ${carriedPercent}%"></i></b></div>
            <div class="stat-meter"><span>ORDER</span><b><i style="width: ${completedPercent}%"></i></b></div>
            <div class="stat-meter"><span>ACCURACY</span><b><i style="width: ${accuracyPercent}%"></i></b></div>
          </section>
          <section class="controls-panel hud-panel">
            <span class="panel-label">CONTROLS</span>
            <div class="control-row"><kbd>L</kbd><span>MOVE</span></div>
            <div class="control-row"><kbd>A</kbd><span>PICK</span></div>
            <div class="control-row"><kbd>B</kbd><span>UNLOAD</span></div>
            <div class="control-row"><kbd>START</kbd><span>PAUSE</span></div>
          </section>
        </aside>

        <section class="bottom-bar">
          <div><span>SCORE</span><strong class="seven-seg">${String(state.score).padStart(6, '0')}</strong></div>
          <div><span>HIGH</span><strong class="seven-seg">${String(Math.max(state.score, 0)).padStart(6, '0')}</strong></div>
          <p>${state.message}</p>
          <div><span>LEVEL</span><strong>${state.level.level}: ${state.level.name}</strong></div>
          <div class="safety-warning">SAFETY: WATCH FOR CROSS TRAFFIC</div>
        </section>
      </div>
    `;
  }

  clear(): void {
    if (this.root) {
      this.root.innerHTML = '';
    }
  }
}
