import Phaser from 'phaser';
import { getSceneKeyForLevel, startConfig } from '../config/startConfig';
import { GamepadManager } from '../systems/GamepadManager';
import { registerStartAction } from '../systems/StartAction';
import { registerSoundToggle } from '../systems/SoundToggle';
import { drawHouseHassonLogoBadge } from '../ui/BrandBadge';
import { getLevelFromNumberKey, getStageStartLevel, getStartLevelStage, moveSelectedStage, moveSelectedStartLevel, startLevelStages, type StartLevelStage } from './startLevelSelector';

export class StartScene extends Phaser.Scene {
  private selectedStartLevel: number = startConfig.level;
  private coinMenuOpen = false;
  private coinMenu?: Phaser.GameObjects.Container;
  private readonly gamepad = new GamepadManager();
  private lastStageMoveAt = -240;

  constructor() {
    super('StartScene');
  }

  create(): void {
    registerSoundToggle(this);
    this.add.rectangle(480, 320, 960, 640, 0x121923);
    this.add.image(480, 280, 'character-lineup').setDisplaySize(900, 514);
    this.add.rectangle(480, 280, 908, 522, 0x000000, 0).setStrokeStyle(4, 0xf0c44c);
    drawHouseHassonLogoBadge(this);

    this.add
      .text(480, 500, 'PRESS SPACE / A TO START', {
        color: '#8dffb1',
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(480, 626, 'Move: WASD/Arrows | Pick: Space | Unload: E/B | M: Sound', {
        color: '#d9e4ff',
        fontFamily: 'Arial',
        fontSize: '14px',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.drawCoinPrompt();
    this.drawTrainingPrompt();

    this.selectedStartLevel = startConfig.level;
    this.registerCoinMenuControls();
    registerStartAction(this, () => this.scene.start(getSceneKeyForLevel(this.selectedStartLevel), { level: this.selectedStartLevel }));
  }

  update(): void {
    if (!this.coinMenuOpen) {
      this.gamepad.snapshot();
      return;
    }

    const snapshot = this.gamepad.snapshot();
    if (this.time.now - this.lastStageMoveAt < 240) {
      return;
    }

    if (snapshot.x > 0.25 || snapshot.y > 0.25) {
      this.selectedStartLevel = moveSelectedStage(this.selectedStartLevel, 1);
      this.lastStageMoveAt = this.time.now;
      this.drawCoinMenu();
    } else if (snapshot.x < -0.25 || snapshot.y < -0.25) {
      this.selectedStartLevel = moveSelectedStage(this.selectedStartLevel, -1);
      this.lastStageMoveAt = this.time.now;
      this.drawCoinMenu();
    }
  }

  private registerCoinMenuControls(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-C', () => {
      this.coinMenuOpen = !this.coinMenuOpen;
      this.lastStageMoveAt = this.time.now;
      this.drawCoinMenu();
    });
    keyboard.on('keydown-T', () => this.scene.start('InboundTrainingScene'));

    keyboard.on('keydown-UP', () => this.moveCoinMenuStageSelection(-1));
    keyboard.on('keydown-LEFT', () => this.moveCoinMenuStageSelection(-1));
    keyboard.on('keydown-DOWN', () => this.moveCoinMenuStageSelection(1));
    keyboard.on('keydown-RIGHT', () => this.moveCoinMenuStageSelection(1));

    for (const keyName of ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE']) {
      keyboard.on(`keydown-${keyName}`, () => {
        const level = getLevelFromNumberKey(keyName);
        if (this.coinMenuOpen && level) {
          this.selectedStartLevel = level;
          this.drawCoinMenu();
        }
      });
    }
  }

  private drawCoinPrompt(): void {
    const x = 770;
    const y = 570;
    this.add.rectangle(x, y, 280, 54, 0x071019, 0.86).setStrokeStyle(2, 0xf0c44c).setDepth(20);
    this.add.circle(x - 108, y, 18, 0xf0c44c).setStrokeStyle(3, 0xfff0a8).setDepth(21);
    this.add.circle(x - 108, y, 11, 0xd89d24).setDepth(22);
    this.add.text(x - 108, y, 'C', {
      color: '#071019',
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
    }).setOrigin(0.5).setDepth(23);
    this.add.text(x + 26, y - 9, 'SELECT STAGE', {
      color: '#ffdf61',
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(23);
    this.add.text(x + 26, y + 12, 'PRESS C', {
      color: '#8dffb1',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
    }).setOrigin(0.5).setDepth(23);
  }

  private drawTrainingPrompt(): void {
    const x = 190;
    const y = 570;
    const button = this.add.rectangle(x, y, 300, 54, 0x071019, 0.88)
      .setStrokeStyle(2, 0x68f39a)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    button.on('pointerdown', () => this.scene.start('InboundTrainingScene'));
    this.add.rectangle(x - 120, y, 34, 28, 0xd99032).setStrokeStyle(3, 0xffdf61).setDepth(21);
    this.add.rectangle(x - 120, y - 7, 24, 3, 0xfff0a8, 0.75).setDepth(22);
    this.add.text(x + 22, y - 9, 'TRAINING: INBOUND DELIVERY', {
      color: '#8dffb1',
      fontFamily: 'Arial Black, Arial',
      fontSize: '12px',
      stroke: '#000000',
      strokeThickness: 3,
      fixedWidth: 220,
      align: 'center',
    }).setOrigin(0.5).setDepth(23);
    this.add.text(x + 22, y + 12, 'PRESS T OR CLICK', {
      color: '#d9e4ff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '11px',
    }).setOrigin(0.5).setDepth(23);
  }

  private moveCoinMenuSelection(direction: -1 | 1): void {
    if (!this.coinMenuOpen) {
      return;
    }

    this.selectedStartLevel = moveSelectedStartLevel(this.selectedStartLevel, direction);
    this.drawCoinMenu();
  }

  private moveCoinMenuStageSelection(direction: -1 | 1): void {
    if (!this.coinMenuOpen) {
      return;
    }

    this.selectedStartLevel = moveSelectedStage(this.selectedStartLevel, direction);
    this.drawCoinMenu();
  }

  private drawCoinMenu(): void {
    this.coinMenu?.destroy();
    this.coinMenu = undefined;

    if (!this.coinMenuOpen) {
      return;
    }

    const menu = this.add.container(480, 320).setDepth(200);
    menu.add(this.add.rectangle(0, 0, 880, 590, 0x05070a, 0.98).setStrokeStyle(3, 0xffdf61));
    this.drawGridBackdrop(menu);
    menu.add(this.add.text(0, -260, 'SELECT STAGE', {
      color: '#ffdf61',
      fontFamily: 'Arial Black, Arial',
      fontSize: '50px',
      stroke: '#0638cc',
      strokeThickness: 7,
    }).setOrigin(0.5));
    menu.add(this.add.text(0, -218, 'CHOOSE YOUR ROUTE. PICK FAST. DELIVER FAST.', {
      color: '#49dfff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      letterSpacing: 1,
    }).setOrigin(0.5));

    const cardPositions = [
      { x: -280, y: -78 },
      { x: 0, y: -78 },
      { x: 280, y: -78 },
      { x: -140, y: 148 },
      { x: 140, y: 148 },
    ];
    startLevelStages.forEach((stage, index) => this.drawStageCard(menu, stage, cardPositions[index].x, cardPositions[index].y));

    menu.add(this.add.rectangle(-330, 260, 128, 44, 0x071019, 0.95).setStrokeStyle(2, 0x2f74d8));
    menu.add(this.add.text(-330, 260, 'HI SCORE\n012450', {
      align: 'center',
      color: '#49dfff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      lineSpacing: 2,
    }).setOrigin(0.5));
    menu.add(this.add.rectangle(0, 260, 500, 44, 0x071019, 0.95).setStrokeStyle(2, 0xf0c44c));
    menu.add(this.add.text(0, 260, 'MOVE MOUSE OVER A STAGE. CLICK OR PRESS SPACE/A TO SELECT.', {
      color: '#49dfff',
      fontFamily: 'Arial Black, Arial',
      fontSize: '13px',
    }).setOrigin(0.5));
    menu.add(this.add.rectangle(330, 260, 128, 44, 0x071019, 0.95).setStrokeStyle(2, 0x2f74d8));
    menu.add(this.add.text(330, 260, 'CLOSE\nC', {
      align: 'center',
      color: '#ff7be8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      lineSpacing: 2,
    }).setOrigin(0.5));

    this.coinMenu = menu;
  }

  private drawGridBackdrop(menu: Phaser.GameObjects.Container): void {
    for (let x = -420; x <= 420; x += 28) {
      menu.add(this.add.line(0, 0, x, -280, x, 280, 0x123555, 0.28).setOrigin(0));
    }
    for (let y = -280; y <= 280; y += 28) {
      menu.add(this.add.line(0, 0, -420, y, 420, y, 0x123555, 0.28).setOrigin(0));
    }
  }

  private drawStageCard(menu: Phaser.GameObjects.Container, stage: StartLevelStage, x: number, y: number): void {
    const isSelected = getStartLevelStage(this.selectedStartLevel)?.stage === stage.stage;
    const strokeColor = isSelected ? 0x49dfff : 0xffdf61;
    const accentColor = isSelected ? '#49dfff' : '#b979ff';
    const card = this.add.container(x, y);
    const hit = this.add.rectangle(0, 0, 236, 194, 0x071019, 0.94)
      .setStrokeStyle(3, strokeColor)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      const level = getStageStartLevel(stage.stage);
      if (level) {
        this.selectedStartLevel = level;
        this.drawCoinMenu();
      }
    });
    hit.on('pointerdown', () => {
      const level = getStageStartLevel(stage.stage);
      if (level) {
        this.scene.start(getSceneKeyForLevel(level), { level });
      }
    });

    card.add(hit);
    card.add(this.add.rectangle(0, -98, 64, 32, 0x05070a).setStrokeStyle(2, 0xb979ff));
    card.add(this.add.text(0, -98, String(stage.stage).padStart(2, '0'), {
      color: accentColor,
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5));
    this.drawStagePreview(card, stage);
    card.add(this.add.rectangle(0, 63, 210, 60, 0x05070a, 0.9).setStrokeStyle(1, 0x331c70));
    card.add(this.add.text(0, 45, `STAGE ${stage.stage}:`, {
      color: '#f7efd0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
    }).setOrigin(0.5));
    card.add(this.add.text(0, 68, stage.title, {
      color: '#ffdf61',
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5));
    card.add(this.add.text(0, 90, stage.rangeLabel, {
      color: accentColor,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '11px',
    }).setOrigin(0.5));
    menu.add(card);
  }

  private drawStagePreview(card: Phaser.GameObjects.Container, stage: StartLevelStage): void {
    const previewY = -16;
    card.add(this.add.rectangle(0, previewY, 206, 102, 0x0c151d).setStrokeStyle(2, 0x263845));
    if (stage.stage === 1) {
      for (const shelfX of [-80, -24]) {
        card.add(this.add.rectangle(shelfX, previewY - 4, 34, 72, 0x7a4b21).setStrokeStyle(2, 0xd99032));
        for (let i = 0; i < 4; i += 1) {
          card.add(this.add.rectangle(shelfX, previewY - 31 + i * 17, 28, 4, 0xf0c44c));
        }
      }
      card.add(this.add.sprite(28, previewY + 19, 'forklift-driver', 0).setScale(0.22));
      card.add(this.add.rectangle(82, previewY + 12, 42, 42, 0x4b2185).setStrokeStyle(2, 0xf7efd0));
      card.add(this.add.text(82, previewY + 12, 'CHUTE', { color: '#f7efd0', fontSize: '9px', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5));
    } else if (stage.stage === 2) {
      for (const platform of [-34, 10, 48]) {
        card.add(this.add.rectangle(0, previewY + platform, 180, 5, 0xf0c44c));
      }
      card.add(this.add.rectangle(-70, previewY + 12, 5, 80, 0xffdf61));
      card.add(this.add.rectangle(42, previewY - 20, 5, 72, 0xffdf61));
      card.add(this.add.sprite(60, previewY + 43, 'player-picker', 2).setScale(0.28).setOrigin(0.5, 1));
      card.add(this.add.sprite(-36, previewY + 39, 'big-bad-guy', 0).setScale(0.22).setOrigin(0.5, 1));
      card.add(this.add.rectangle(-18, previewY + 26, 24, 18, 0xd94d6a));
    } else if (stage.stage === 3) {
      for (let i = 0; i < 3; i += 1) {
        card.add(this.add.rectangle(-28 + i * 54, previewY - 20, 42, 60, 0x17232c).setStrokeStyle(2, 0xd9e4ff));
        card.add(this.add.text(-28 + i * 54, previewY - 42, `0${i + 1}`, { color: '#f7efd0', fontSize: '11px', fontFamily: 'Arial Black' }).setOrigin(0.5));
      }
      card.add(this.add.rectangle(0, previewY + 42, 172, 12, 0x0f4b77));
      card.add(this.add.rectangle(-62, previewY + 33, 28, 22, 0xd99032));
      card.add(this.add.sprite(76, previewY + 43, 'dock-worker', 2).setScale(0.16).setOrigin(0.5, 1));
      card.add(this.add.rectangle(54, previewY + 34, 48, 18, 0xd87922).setStrokeStyle(2, 0xffdf61));
    } else if (stage.stage === 4) {
      card.add(this.add.rectangle(-48, previewY + 4, 96, 82, 0x0b0f14).setStrokeStyle(3, 0xa8b0b6));
      for (let i = 0; i < 20; i += 1) {
        card.add(this.add.rectangle(-86 + (i % 5) * 18, previewY + 30 - Math.floor(i / 5) * 15, 14, 12, [0xd99032, 0x2f74d8, 0x68a63f, 0xb979ff][i % 4]));
      }
      card.add(this.add.rectangle(-48, previewY + 49, 102, 8, 0x29323a).setStrokeStyle(1, 0xf7efd0));
      card.add(this.add.rectangle(54, previewY + 6, 22, 82, 0x071019).setStrokeStyle(1, 0x68f39a));
      card.add(this.add.rectangle(54, previewY + 36, 16, 44, 0x68f39a));
    } else {
      card.add(this.add.rectangle(0, previewY + 36, 190, 16, 0x282c34));
      card.add(this.add.rectangle(-46, previewY + 14, 86, 42, 0x2f74d8).setStrokeStyle(2, 0xf7efd0));
      card.add(this.add.text(-46, previewY + 14, 'FAST\nFREIGHT', { align: 'center', color: '#f7efd0', fontSize: '10px', fontFamily: 'Arial Black' }).setOrigin(0.5));
      card.add(this.add.rectangle(60, previewY + 25, 34, 16, 0xd94d49));
      card.add(this.add.rectangle(82, previewY - 28, 58, 30, 0x1b2832).setStrokeStyle(2, 0x68f39a));
      card.add(this.add.text(82, previewY - 28, 'DEALER\n3 STOPS', { align: 'center', color: '#f7efd0', fontSize: '9px', fontFamily: 'Arial Black' }).setOrigin(0.5));
    }
  }

  private drawTinyWorker(card: Phaser.GameObjects.Container, x: number, y: number, color: number): void {
    card.add(this.add.circle(x, y - 16, 7, 0xffcf8a));
    card.add(this.add.rectangle(x, y, 18, 24, color));
    card.add(this.add.rectangle(x - 8, y + 18, 5, 18, 0x1b2832));
    card.add(this.add.rectangle(x + 8, y + 18, 5, 18, 0x1b2832));
  }

  private drawTinyForklift(card: Phaser.GameObjects.Container, x: number, y: number): void {
    card.add(this.add.rectangle(x, y, 44, 18, 0xd87922).setStrokeStyle(1, 0xffdf61));
    card.add(this.add.rectangle(x + 26, y - 10, 5, 28, 0xf7efd0));
    card.add(this.add.rectangle(x - 12, y + 12, 12, 12, 0x05070a));
    card.add(this.add.rectangle(x + 12, y + 12, 12, 12, 0x05070a));
  }

}
