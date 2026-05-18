import Phaser from 'phaser';
import { getNextLevelNumber } from '../config/levelConfig';
import { getTruckLoadLevelConfig, type TruckLoadLevelConfig } from '../config/truckLoadConfig';
import { GamepadManager } from '../systems/GamepadManager';
import { playSoundEffect } from '../systems/SoundEffectManager';
import { registerSoundToggle } from '../systems/SoundToggle';
import {
  canPlacePiece,
  clearFullCargoRows,
  createTruckLoadGrid,
  getCargoFillPercent,
  getHardDropY,
  getPieceCells,
  mergePiece,
  rotatePiece,
  truckLoadPieces,
  type TruckLoadGrid,
  type TruckLoadPiece,
} from './truckLoadPuzzle';

const CELL_SIZE = 30;
const BOARD_X = 330;
const BOARD_Y = 104;
const HUD_X = 814;
const MOVE_REPEAT_MS = 130;
const DROP_REPEAT_MS = 55;
const LINE_SCORE = [0, 100, 300, 700, 1200];

export class TruckLoadScene extends Phaser.Scene {
  private level!: TruckLoadLevelConfig;
  private grid: TruckLoadGrid = createTruckLoadGrid(10, 14);
  private activePiece!: TruckLoadPiece;
  private nextPiece!: TruckLoadPiece;
  private activeX = 3;
  private activeY = 0;
  private score = 0;
  private lines = 0;
  private remainingSeconds = 100;
  private fallElapsed = 0;
  private lastHorizontalMoveAt = -MOVE_REPEAT_MS;
  private lastSoftDropAt = -DROP_REPEAT_MS;
  private boardLayer?: Phaser.GameObjects.Container;
  private hudLayer?: Phaser.GameObjects.Container;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly gamepad = new GamepadManager();
  private gamepadSnapshot = this.gamepad.snapshot();
  private currentMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super('TruckLoadScene');
  }

  create(data: { level?: number } = {}): void {
    registerSoundToggle(this);
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    const level = getTruckLoadLevelConfig(data.level ?? 10);
    if (!level) {
      this.scene.start('GameScene', { level: 1 });
      return;
    }

    this.level = level;
    this.grid = createTruckLoadGrid(level.width, level.height);
    this.score = 0;
    this.lines = 0;
    this.remainingSeconds = level.timerSeconds;
    this.fallElapsed = 0;
    this.lastHorizontalMoveAt = -MOVE_REPEAT_MS;
    this.lastSoftDropAt = -DROP_REPEAT_MS;
    this.activePiece = this.pickPiece();
    this.nextPiece = this.pickPiece();
    this.spawnPiece();

    this.input.keyboard?.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'A', 'D', 'S', 'W', 'E', 'B']);
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,SPACE,E,B') as Record<string, Phaser.Input.Keyboard.Key>;

    this.drawWorld();
    this.drawBoard();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tickTimer() });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusic());
    this.startMusic();
  }

  update(_time: number, delta: number): void {
    this.gamepadSnapshot = this.gamepad.snapshot();
    this.handleInput();
    this.fallElapsed += delta;
    if (this.fallElapsed >= this.level.fallDelayMs) {
      this.fallElapsed = 0;
      this.tryMove(0, 1) || this.lockPiece();
    }
  }

  private handleInput(): void {
    const now = this.time.now;
    const leftDown = Boolean(this.cursors?.left.isDown || this.keys.A?.isDown || this.gamepadSnapshot.x < -0.25);
    const rightDown = Boolean(this.cursors?.right.isDown || this.keys.D?.isDown || this.gamepadSnapshot.x > 0.25);
    const downDown = Boolean(this.cursors?.down.isDown || this.keys.S?.isDown || this.gamepadSnapshot.y > 0.25);

    if (leftDown && now - this.lastHorizontalMoveAt >= MOVE_REPEAT_MS) {
      this.tryMove(-1, 0);
      this.lastHorizontalMoveAt = now;
    } else if (rightDown && now - this.lastHorizontalMoveAt >= MOVE_REPEAT_MS) {
      this.tryMove(1, 0);
      this.lastHorizontalMoveAt = now;
    }

    if (downDown && now - this.lastSoftDropAt >= DROP_REPEAT_MS) {
      this.tryMove(0, 1) || this.lockPiece();
      this.lastSoftDropAt = now;
      this.fallElapsed = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors!.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.gamepadSnapshot.pickPressed) {
      this.tryRotate();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.B) || this.gamepadSnapshot.unloadPressed) {
      this.activeY = getHardDropY(this.grid, this.activePiece, this.activeX, this.activeY);
      this.lockPiece();
    }
  }

  private tryMove(dx: number, dy: number): boolean {
    if (!canPlacePiece(this.grid, this.activePiece, this.activeX + dx, this.activeY + dy)) {
      return false;
    }

    this.activeX += dx;
    this.activeY += dy;
    this.drawBoard();
    return true;
  }

  private tryRotate(): void {
    const rotated = rotatePiece(this.activePiece);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (canPlacePiece(this.grid, rotated, this.activeX + kick, this.activeY)) {
        this.activePiece = rotated;
        this.activeX += kick;
        this.drawBoard();
        return;
      }
    }
  }

  private lockPiece(): void {
    this.grid = mergePiece(this.grid, this.activePiece, this.activeX, this.activeY);
    const result = clearFullCargoRows(this.grid);
    this.grid = result.grid;
    this.lines += result.cleared;
    this.score += 50 + (LINE_SCORE[result.cleared] ?? result.cleared * 400);
    if (result.cleared > 0) {
      playSoundEffect('dropoff');
      this.cameras.main.flash(90, 104, 243, 154, false);
    }

    if (this.lines >= this.level.targetLines) {
      this.completeLevel();
      return;
    }

    this.activePiece = this.nextPiece;
    this.nextPiece = this.pickPiece();
    this.spawnPiece();
    this.drawBoard();
  }

  private spawnPiece(): void {
    this.activeX = Math.floor(this.level.width / 2) - 2;
    this.activeY = 0;
    if (!canPlacePiece(this.grid, this.activePiece, this.activeX, this.activeY)) {
      this.gameOver('The trailer filled to the roof.');
    }
  }

  private pickPiece(): TruckLoadPiece {
    return truckLoadPieces[Phaser.Math.Between(0, truckLoadPieces.length - 1)];
  }

  private drawWorld(): void {
    this.add.rectangle(480, 320, 960, 640, 0x05070a);
    this.add.text(480, 36, 'TRUCK LOAD', {
      color: '#ffdf61',
      fontFamily: 'Arial Black, Arial',
      fontSize: '54px',
      stroke: '#0638cc',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.drawHelpPanel();
    this.add.rectangle(480, 610, 360, 28, 0x29323a).setStrokeStyle(2, 0xf7efd0);
    this.add.text(480, 610, 'LOAD UP!', {
      color: '#d9e4ff',
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
    }).setOrigin(0.5);
  }

  private drawHelpPanel(): void {
    this.add.rectangle(92, 238, 142, 316, 0x071019, 0.95).setStrokeStyle(2, 0xf0c44c);
    this.add.text(92, 112, 'HOW TO PLAY', {
      color: '#ffdf61',
      fontFamily: 'Arial Black, Arial',
      fontSize: '14px',
    }).setOrigin(0.5);
    this.add.text(36, 142, "STACK CARGO\nTO FILL THE\nTRUCK!\n\nCOMPLETE LINES\nFOR BONUS.\n\nDON'T WASTE\nSPACE!", {
      color: '#f7efd0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
      lineSpacing: 4,
    });
    this.add.text(36, 332, 'MOVE  D-PAD\nROTATE  A\nDROP  B', {
      color: '#68f39a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
      lineSpacing: 4,
    });
  }

  private drawBoard(): void {
    this.boardLayer?.destroy();
    this.hudLayer?.destroy();

    this.boardLayer = this.add.container(0, 0).setDepth(20);
    this.hudLayer = this.add.container(0, 0).setDepth(30);
    this.drawTrailerFrame();
    this.drawGrid();
    this.drawActivePiece();
    this.drawHud();
  }

  private drawTrailerFrame(): void {
    const boardWidth = this.level.width * CELL_SIZE;
    const boardHeight = this.level.height * CELL_SIZE;
    const x = BOARD_X + boardWidth / 2;
    const y = BOARD_Y + boardHeight / 2;
    this.boardLayer!.add(this.add.rectangle(x, y, boardWidth + 58, boardHeight + 50, 0x1a2027).setStrokeStyle(4, 0xa8b0b6));
    this.boardLayer!.add(this.add.rectangle(x, y, boardWidth + 20, boardHeight + 18, 0x0b0f14).setStrokeStyle(3, 0x4d5964));
    for (let i = 0; i < 7; i += 1) {
      this.boardLayer!.add(this.add.line(0, 0, BOARD_X - 24 + i * 58, BOARD_Y - 18, BOARD_X + i * 24, BOARD_Y + boardHeight, 0x2d3741, 0.45).setOrigin(0));
      this.boardLayer!.add(this.add.line(0, 0, BOARD_X + boardWidth + 24 - i * 58, BOARD_Y - 18, BOARD_X + boardWidth - i * 24, BOARD_Y + boardHeight, 0x2d3741, 0.45).setOrigin(0));
    }
  }

  private drawGrid(): void {
    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const px = BOARD_X + x * CELL_SIZE + CELL_SIZE / 2;
        const py = BOARD_Y + y * CELL_SIZE + CELL_SIZE / 2;
        this.boardLayer!.add(this.add.rectangle(px, py, CELL_SIZE - 1, CELL_SIZE - 1, 0x0f151b).setStrokeStyle(1, 0x202a34, 0.7));
        const cell = this.grid[y][x];
        if (cell) {
          this.drawCargoBlock(this.boardLayer!, px, py, cell.color, cell.label);
        }
      }
    }
  }

  private drawActivePiece(): void {
    for (const cell of getPieceCells(this.activePiece, this.activeX, this.activeY)) {
      const px = BOARD_X + cell.x * CELL_SIZE + CELL_SIZE / 2;
      const py = BOARD_Y + cell.y * CELL_SIZE + CELL_SIZE / 2;
      this.drawCargoBlock(this.boardLayer!, px, py, this.activePiece.color, this.activePiece.label);
    }
  }

  private drawCargoBlock(layer: Phaser.GameObjects.Container, x: number, y: number, color: number, label: string): void {
    layer.add(this.add.rectangle(x, y, CELL_SIZE - 3, CELL_SIZE - 3, color).setStrokeStyle(2, 0xf7efd0, 0.75));
    layer.add(this.add.rectangle(x, y - 7, CELL_SIZE - 10, 3, 0xffffff, 0.22));
    if (label.length <= 4) {
      layer.add(this.add.text(x, y, label, {
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '7px',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5));
    }
  }

  private drawHud(): void {
    const meterPercent = Math.max(0, Math.min(100, Math.round((this.lines / this.level.targetLines) * 100)));
    this.hudLayer!.add(this.add.rectangle(HUD_X, 320, 142, 492, 0x071019, 0.95).setStrokeStyle(2, 0x2f74d8));
    this.hudLayer!.add(this.add.text(HUD_X, 92, `SCORE\n${String(this.score).padStart(6, '0')}`, this.hudText('#f7efd0', 17)).setOrigin(0.5));
    this.hudLayer!.add(this.add.text(HUD_X, 158, `LEVEL\n${String(this.level.level).padStart(2, '0')}`, this.hudText('#ffdf61', 18)).setOrigin(0.5));
    this.hudLayer!.add(this.add.text(HUD_X, 220, 'NEXT PIECE', this.hudText('#68f39a', 12)).setOrigin(0.5));
    this.drawNextPiece(HUD_X, 274);
    this.hudLayer!.add(this.add.text(HUD_X, 350, `TIME\n${this.formatTime(this.remainingSeconds)}`, this.hudText('#f7efd0', 18)).setOrigin(0.5));
    this.hudLayer!.add(this.add.text(HUD_X, 424, 'CARGO METER', this.hudText('#ffdf61', 11)).setOrigin(0.5));
    this.hudLayer!.add(this.add.rectangle(HUD_X, 454, 104, 18, 0x1b2832).setStrokeStyle(2, 0xf7efd0));
    this.hudLayer!.add(this.add.rectangle(HUD_X - 52 + meterPercent * 0.52, 454, meterPercent * 1.04, 16, meterPercent >= 100 ? 0x68f39a : 0xf0c44c).setOrigin(0, 0.5));
    this.hudLayer!.add(this.add.text(HUD_X, 494, `${meterPercent}%`, this.hudText('#68f39a', 23)).setOrigin(0.5));
    this.hudLayer!.add(this.add.text(HUD_X, 544, `LINES ${this.lines}/${this.level.targetLines}\nFILL ${getCargoFillPercent(this.grid)}%`, this.hudText('#d9e4ff', 11)).setOrigin(0.5));
  }

  private drawNextPiece(centerX: number, centerY: number): void {
    const previewSize = 16;
    this.hudLayer!.add(this.add.rectangle(centerX, centerY, 98, 72, 0x05070a).setStrokeStyle(2, 0xf7efd0));
    for (const cell of this.nextPiece.cells) {
      this.hudLayer!.add(this.add.rectangle(centerX - 24 + cell.x * previewSize, centerY - 18 + cell.y * previewSize, previewSize - 2, previewSize - 2, this.nextPiece.color).setStrokeStyle(1, 0xf7efd0));
    }
  }

  private hudText(color: string, fontSize: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      align: 'center',
      color,
      fontFamily: 'Arial Black, Arial',
      fontSize: `${fontSize}px`,
      lineSpacing: 3,
      stroke: '#000000',
      strokeThickness: 4,
    };
  }

  private tickTimer(): void {
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
    this.drawBoard();
    if (this.remainingSeconds <= 0) {
      this.gameOver('The loading clock hit zero.');
    }
  }

  private completeLevel(): void {
    const nextLevel = getNextLevelNumber(this.level.level);
    this.scene.start('LevelCompleteScene', {
      level: this.level.level,
      nextLevel,
      score: this.score,
      remainingSeconds: this.remainingSeconds,
      accuracy: 100,
      lph: this.lines,
      lives: 1,
      grade: this.remainingSeconds > 30 ? 'A: Load Master' : 'B: Trailer Stacker',
    });
  }

  private gameOver(reason: string): void {
    playSoundEffect('crash');
    this.scene.start('GameOverScene', {
      score: this.score,
      picks: `${this.lines} / ${this.level.targetLines}`,
      accuracy: 100,
      reason,
    });
  }

  private formatTime(seconds: number): string {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  private startMusic(): void {
    this.stopMusic();
    const key = this.level.musicKeys[0];
    this.currentMusic = this.sound.add(key, { volume: 0.5, loop: true });
    this.currentMusic.play();
  }

  private stopMusic(): void {
    for (const key of this.level.musicKeys) {
      this.sound.stopByKey(key);
    }
    this.currentMusic?.destroy();
    this.currentMusic = undefined;
  }
}
