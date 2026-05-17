import Phaser from 'phaser';
import { getNextLevelNumber } from '../config/levelConfig';
import { MEZZANINE_COLLISION, getSpawnClearance, resolveSpawnSafeX } from '../config/mezzanineCollision';
import { getMezzanineLevelConfig, type MezzanineLevelConfig } from '../config/mezzanineConfig';
import { createWorkerSprite, updateWorkerWalkAnimation } from '../objects/WorkerSprite';
import { GamepadManager } from '../systems/GamepadManager';
import { playSoundEffect } from '../systems/SoundEffectManager';
import { registerSoundToggle } from '../systems/SoundToggle';
import { getMezzanineCollectibleStyle } from './mezzanineCollectibleStyle';
import { getLadderInteractionBounds, getMezzanineInput, getMezzanineMovement, isPlayerOverlappingLadder } from './mezzanineMovement';

interface MovingHazard {
  sprite: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
}

interface WalkingWorker {
  sprite: Phaser.GameObjects.Container;
  visual: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;
  left: number;
  right: number;
}

export class MezzanineScene extends Phaser.Scene {
  private level!: MezzanineLevelConfig;
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly gamepad = new GamepadManager();
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private ladders: Phaser.Geom.Rectangle[] = [];
  private score = 0;
  private remainingSeconds = 90;
  private lives = 3;
  private collected = 0;
  private hazards: MovingHazard[] = [];
  private fallingBoxes: MovingHazard[] = [];
  private workers: WalkingWorker[] = [];
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicIndex = 0;
  private hudContainer?: Phaser.GameObjects.Container;
  private lastHazardHitAt = -2000;

  constructor() {
    super('MezzanineScene');
  }

  create(data: { level?: number } = {}): void {
    registerSoundToggle(this);
    const level = getMezzanineLevelConfig(data.level ?? 4);
    if (!level) {
      this.scene.start('GameScene', { level: 1 });
      return;
    }

    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.level = level;
    this.score = 0;
    this.remainingSeconds = level.timerSeconds;
    this.lives = 3;
    this.collected = 0;
    this.ladders = [];
    this.hazards = [];
    this.fallingBoxes = [];
    this.workers = [];
    this.currentMusicIndex = 0;
    this.lastHazardHitAt = -2000;
    this.hudContainer?.destroy();
    this.hudContainer = undefined;

    this.drawBackwall();
    this.platforms = this.physics.add.staticGroup();
    this.drawPlatforms();
    this.drawLadders();
    this.drawGoal();
    this.createPlayer();
    this.createCollectibles();
    this.createHazards();
    this.createWorkers();
    this.createBoxDropper();
    this.drawHud();
    this.drawControlsGuide();

    this.physics.add.collider(
      this.player,
      this.platforms,
      undefined,
      () => !this.isPlayerOnLadder(),
      this,
    );
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tickTimer() });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusicPlaylist());
    this.startMusicPlaylist();
  }

  update(): void {
    this.handleMovement();
    this.updateHazards();
    this.updateFallingBoxes();
    this.updateWorkers();
    this.checkGoal();
  }

  private createPlayer(): void {
    this.createPlayerAnimations();
    this.player = this.add.container(this.level.spawn.x, this.level.spawn.y).setDepth(30);
    this.playerSprite = this.add.sprite(0, -12, 'player-picker', 0).setScale(0.46).play('player-picker-idle');
    this.player.add(this.playerSprite);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(MEZZANINE_COLLISION.player.body.width, MEZZANINE_COLLISION.player.body.height);
    body.setOffset(MEZZANINE_COLLISION.player.body.offsetX, MEZZANINE_COLLISION.player.body.offsetY);
    body.setCollideWorldBounds(true);
    body.setGravityY(780);

    this.input.keyboard?.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'W', 'A', 'S', 'D']);
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  private createPlayerAnimations(): void {
    if (this.anims.exists('player-picker-idle')) {
      return;
    }

    this.anims.create({
      key: 'player-picker-idle',
      frames: this.anims.generateFrameNumbers('player-picker', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-picker-walk-right',
      frames: this.anims.generateFrameNumbers('player-picker', { frames: [2, 3, 4, 5] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-picker-walk-left',
      frames: this.anims.generateFrameNumbers('player-picker', { frames: [6, 7, 8, 9] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-picker-climb',
      frames: this.anims.generateFrameNumbers('player-picker', { frames: [10, 11] }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-picker-jump',
      frames: this.anims.generateFrameNumbers('player-picker', { frames: [12, 13] }),
      frameRate: 5,
      repeat: -1,
    });
  }

  private handleMovement(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onLadder = this.isPlayerOnLadder();
    const isGrounded = body.blocked.down || body.touching.down;
    const gamepad = this.gamepad.snapshot();
    const movement = getMezzanineMovement({
      input: getMezzanineInput({
        keyboard: {
          left: Boolean(this.cursors?.left.isDown || this.keys.A?.isDown),
          right: Boolean(this.cursors?.right.isDown || this.keys.D?.isDown),
          up: Boolean(this.cursors?.up.isDown || this.keys.W?.isDown),
          down: Boolean(this.cursors?.down.isDown || this.keys.S?.isDown),
          jump: Boolean(this.cursors?.space.isDown || this.keys.SPACE?.isDown),
        },
        gamepad,
      }),
      onLadder,
      isGrounded,
    });

    body.setVelocityX(movement.velocityX);
    body.setAllowGravity(movement.allowGravity);
    if (movement.velocityY !== undefined) {
      body.setVelocityY(movement.velocityY);
    }
    this.updatePlayerAnimation(movement.velocityX, movement.velocityY ?? body.velocity.y, onLadder, isGrounded);
  }

  private updatePlayerAnimation(velocityX: number, velocityY: number, onLadder: boolean, isGrounded: boolean): void {
    if (onLadder && Math.abs(velocityY) > 1) {
      this.playerSprite.play('player-picker-climb', true);
      return;
    }

    if (!isGrounded && Math.abs(velocityY) > 1) {
      this.playerSprite.play('player-picker-jump', true);
      return;
    }

    if (velocityX > 1) {
      this.playerSprite.play('player-picker-walk-right', true);
      return;
    }

    if (velocityX < -1) {
      this.playerSprite.play('player-picker-walk-left', true);
      return;
    }

    this.playerSprite.play('player-picker-idle', true);
  }

  private isPlayerOnLadder(): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    return isPlayerOverlappingLadder({ x: body.x, y: body.y, width: body.width, height: body.height }, this.ladders);
  }

  private drawBackwall(): void {
    this.add.rectangle(480, 320, 960, 640, 0x11171c);
    for (let x = 24; x < 960; x += 70) {
      this.add.rectangle(x, 320, 8, 560, 0x123555).setStrokeStyle(1, 0x1d6b9d).setDepth(1);
    }
    for (let y = 72; y < 610; y += 92) {
      this.add.rectangle(480, y, 900, 5, 0x14466f).setDepth(1);
    }
    this.add.rectangle(132, 108, 156, 78, 0x1b2832, 0.92).setStrokeStyle(2, 0xffdf61).setDepth(2);
    this.add.text(132, 108, `HOUSE-HASSON\nHARDWARE\nMEZZANINE\nLEVEL ${this.level.level}`, {
      color: '#ffdf61',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '11px',
      align: 'center',
      lineSpacing: 3,
      fixedWidth: 146,
    }).setOrigin(0.5).setStroke('#000000', 3).setDepth(3);

    this.add.rectangle(715, 108, 96, 54, 0x1b2832, 0.92).setStrokeStyle(2, 0xf7efd0).setDepth(2);
    this.add.text(715, 108, 'SAFETY\nFIRST', {
      color: '#f7efd0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      align: 'center',
      lineSpacing: 3,
      fixedWidth: 88,
    }).setOrigin(0.5).setStroke('#000000', 3).setDepth(3);

    this.add.rectangle(350, 508, 130, 50, 0xffdf61).setStrokeStyle(3, 0x12151a).setDepth(2);
    this.add.text(350, 508, 'WATCH\nYOUR STEP', {
      color: '#12151a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      lineSpacing: 5,
      fixedWidth: 120,
    }).setOrigin(0.5).setDepth(3);
  }

  private drawPlatforms(): void {
    for (const platform of this.level.platforms) {
      const railY = platform.y - 22;
      this.add.rectangle(platform.x, platform.y, platform.width, 16, 0xf0c44c).setStrokeStyle(2, 0x473107).setDepth(8);
      this.add.rectangle(platform.x, platform.y + 12, platform.width, 14, 0x0f4b77).setStrokeStyle(2, 0x2c83c6).setDepth(7);
      for (let x = platform.x - platform.width / 2 + 16; x < platform.x + platform.width / 2; x += 46) {
        this.add.rectangle(x, railY, 7, 36, 0xffdf61).setDepth(8);
      }
      this.add.rectangle(platform.x, railY, platform.width, 5, 0xffdf61).setDepth(8);
      const body = this.add.rectangle(platform.x, platform.y + 4, platform.width, 18, 0x000000, 0);
      this.physics.add.existing(body, true);
      this.platforms.add(body);
    }
  }

  private drawLadders(): void {
    for (const ladder of this.level.ladders) {
      const bounds = getLadderInteractionBounds(ladder);
      this.ladders.push(new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
      this.add.rectangle(ladder.x - 10, ladder.y, 4, ladder.height, 0xffdf61).setDepth(9);
      this.add.rectangle(ladder.x + 10, ladder.y, 4, ladder.height, 0xffdf61).setDepth(9);
      for (let y = ladder.y - ladder.height / 2 + 12; y < ladder.y + ladder.height / 2; y += 18) {
        this.add.rectangle(ladder.x, y, 24, 3, 0xffdf61).setDepth(9);
      }
    }
  }

  private drawGoal(): void {
    this.add.rectangle(this.level.goal.x, this.level.goal.y, 138, 58, 0x5c2aa6).setStrokeStyle(4, 0xd8b6ff).setDepth(15);
    this.add.text(this.level.goal.x, this.level.goal.y - 8, this.level.goal.label, {
      color: '#f3d7ff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      align: 'center',
      fixedWidth: 122,
      wordWrap: { width: 122, useAdvancedWrap: true },
    }).setOrigin(0.5).setDepth(16);
  }

  private drawControlsGuide(): void {
    const x = 832;
    const y = 510;
    this.add.rectangle(x, y, 172, 104, 0x071019, 0.9).setStrokeStyle(2, 0x68f39a, 0.85).setDepth(40);
    this.add.text(x, y - 38, 'KEYBOARD', {
      color: '#68f39a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      align: 'center',
      fixedWidth: 150,
    }).setOrigin(0.5).setDepth(41);
    this.add.text(x, y + 10, 'MOVE  ARROWS / WASD\nCLIMB  UP / DOWN\nJUMP  SPACE', {
      color: '#f7efd0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      align: 'left',
      fixedWidth: 146,
      lineSpacing: 8,
    }).setOrigin(0.5).setDepth(41);
  }

  private createCollectibles(): void {
    for (const item of this.level.collectibles) {
      const style = getMezzanineCollectibleStyle(item.label);
      const box = this.add.container(item.x, item.y).setDepth(18);
      box.add([
        this.add.ellipse(0, 0, 48, 36, style.glow, 0.18),
        this.add.rectangle(0, 0, 38, 28, style.fill).setStrokeStyle(3, style.stroke),
        this.add.rectangle(0, -8, 28, 4, style.stroke, 0.55),
        this.add.text(0, 0, item.label, {
          color: style.text,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: '8px',
        }).setOrigin(0.5),
      ]);
      this.physics.add.existing(box, true);
      const body = box.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(36, 26);
      body.setOffset(-18, -13);
      this.physics.add.overlap(this.player, box, () => {
        box.destroy();
        this.collected += 1;
        this.score += 250;
        playSoundEffect('pickup');
        this.drawHud();
      });
    }
  }

  private createHazards(): void {
    const spawnClearance = getSpawnClearance(this.level.spawn);
    for (const hazard of this.level.hazards) {
      const x = resolveSpawnSafeX({
        x: hazard.x,
        y: hazard.y,
        body: MEZZANINE_COLLISION.hazard.body,
        blockedArea: spawnClearance,
        minX: 70,
        maxX: 890,
        gap: MEZZANINE_COLLISION.hazard.spawnGap,
      });
      const sprite = this.add.container(x, hazard.y).setDepth(24);
      sprite.add([
        this.add.rectangle(0, 0, 42, 30, 0x9b5b28).setStrokeStyle(2, 0xffb15a),
        this.add.text(0, 0, hazard.label, {
          color: '#fff4bf',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: '9px',
        }).setOrigin(0.5),
      ]);
      this.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(MEZZANINE_COLLISION.hazard.body.width, MEZZANINE_COLLISION.hazard.body.height);
      body.setOffset(MEZZANINE_COLLISION.hazard.body.offsetX, MEZZANINE_COLLISION.hazard.body.offsetY);
      body.setVelocityX(hazard.vx);
      body.setBounce(1, 0);
      body.setCollideWorldBounds(true);
      body.setGravityY(780);
      this.physics.add.collider(sprite, this.platforms);
      this.physics.add.overlap(this.player, sprite, () => this.hitMovingFreight());
      this.hazards.push({ sprite, body });
    }
  }

  private createWorkers(): void {
    const spawnClearance = getSpawnClearance(this.level.spawn);
    for (const worker of this.level.pedestrians) {
      this.drawWorkerZone(worker);
      const x = resolveSpawnSafeX({
        x: worker.x,
        y: worker.y,
        body: MEZZANINE_COLLISION.worker.body,
        blockedArea: spawnClearance,
        minX: worker.left,
        maxX: worker.right,
        gap: MEZZANINE_COLLISION.worker.spawnGap,
      });
      const sprite = this.add.container(x, worker.y).setDepth(25);
      const shadow = this.add.ellipse(0, 10, 18, 6, 0x000000, 0.35);
      const visual = createWorkerSprite(this, 24, 0.3);
      sprite.add([shadow, visual]);
      this.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(20, 24);
      body.setOffset(-10, -22);
      body.setVelocityX(55);
      body.setAllowGravity(false);
      body.setImmovable(true);
      this.physics.add.collider(this.player, sprite);
      this.workers.push({ sprite, visual, body, left: worker.left, right: worker.right });
    }
  }

  private createBoxDropper(): void {
    this.createBossAnimations();
    const topPlatform = this.level.platforms.reduce((top, platform) => (platform.y < top.y ? platform : top), this.level.platforms[0]);
    const bossX = Math.min(topPlatform.x + topPlatform.width / 2 - 54, 830);
    const bossY = topPlatform.y - 15;
    const boss = this.add.sprite(bossX, bossY, 'big-bad-guy', 0)
      .setOrigin(0.5, 1)
      .setScale(0.44)
      .setFlipX(true)
      .setDepth(26)
      .play('big-bad-guy-idle');

    this.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        boss.play('big-bad-guy-throw', true);
        this.time.delayedCall(430, () => this.dropBossBox(bossX - 70, bossY - 78, -150, -185));
        this.time.delayedCall(980, () => boss.play('big-bad-guy-idle', true));
      },
    });
  }

  private createBossAnimations(): void {
    if (this.anims.exists('big-bad-guy-idle')) {
      return;
    }

    this.anims.create({
      key: 'big-bad-guy-idle',
      frames: this.anims.generateFrameNumbers('big-bad-guy', { frames: [0, 1, 2, 3] }),
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: 'big-bad-guy-throw',
      frames: this.anims.generateFrameNumbers('big-bad-guy', { frames: [4, 5, 6, 7] }),
      frameRate: 8,
      repeat: 0,
    });
  }

  private dropBossBox(x: number, y: number, velocityX = -85, velocityY = 0): void {
    const box = this.add.container(x, y).setDepth(27);
    box.add([
      this.add.rectangle(0, 0, 34, 28, 0xd87922).setStrokeStyle(2, 0xffb15a),
      this.add.rectangle(0, -7, 26, 3, 0xffdf61, 0.72),
      this.add.rectangle(0, 0, 3, 26, 0x9b5b28, 0.7),
      this.add.text(0, 3, 'BOX', {
        color: '#fff4bf',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '7px',
      }).setOrigin(0.5),
    ]);
    this.physics.add.existing(box);
    const body = box.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 26);
    body.setOffset(-16, -13);
    body.setGravityY(780);
    body.setVelocity(velocityX, velocityY);
    body.setBounce(0.75, 0.18);
    this.tweens.add({
      targets: box,
      angle: velocityX < 0 ? -18 : 18,
      duration: 260,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
    });
    this.physics.add.collider(box, this.platforms);
    this.physics.add.overlap(this.player, box, () => this.hitMovingFreight());
    this.fallingBoxes.push({ sprite: box, body });
  }

  private drawWorkerZone(worker: MezzanineLevelConfig['pedestrians'][number]): void {
    if (MEZZANINE_COLLISION.worker.zone.collides) {
      return;
    }

    const width = worker.right - worker.left + MEZZANINE_COLLISION.worker.body.width;
    this.add.rectangle(
      (worker.left + worker.right) / 2,
      worker.y + MEZZANINE_COLLISION.worker.zone.yOffset,
      width,
      MEZZANINE_COLLISION.worker.zone.height,
      0x68f39a,
      0.05,
    )
      .setStrokeStyle(1, 0x68f39a, 0.16)
      .setName('mezzanine-worker-marked-zone')
      .setDepth(4);
  }

  private updateHazards(): void {
    for (const hazard of this.hazards) {
      if (hazard.sprite.x < 70 || hazard.sprite.x > 890) {
        hazard.body.setVelocityX(-hazard.body.velocity.x);
      }
    }
  }

  private updateFallingBoxes(): void {
    this.fallingBoxes = this.fallingBoxes.filter((box) => {
      if (box.sprite.y > 680 || box.sprite.x < 40) {
        box.sprite.destroy();
        return false;
      }
      return true;
    });
  }

  private updateWorkers(): void {
    for (const worker of this.workers) {
      if (worker.sprite.x <= worker.left || worker.sprite.x >= worker.right) {
        worker.body.setVelocityX(-worker.body.velocity.x);
      }
      updateWorkerWalkAnimation(worker.visual, worker.body.velocity.x);
    }
  }

  private checkGoal(): void {
    if (
      this.collected >= this.level.collectibles.length &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.level.goal.x, this.level.goal.y) < 58
    ) {
      const nextLevel = getNextLevelNumber(this.level.level);
      this.scene.start('LevelCompleteScene', {
        level: this.level.level,
        nextLevel,
        score: this.score,
        remainingSeconds: this.remainingSeconds,
        accuracy: 100,
        lph: this.collected,
        lives: this.lives,
        grade: this.remainingSeconds > 25 ? 'A: Mezzanine Master' : 'B: Hard Goods Hustler',
      });
    }
  }

  private tickTimer(): void {
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
    this.drawHud();
    if (this.remainingSeconds <= 0) {
      this.gameOver('The mezzanine shift timed out.');
    }
  }

  private drawHud(): void {
    this.hudContainer?.destroy();

    this.hudContainer = this.add.container(0, 0).setDepth(100);
    this.hudContainer.add(this.add.rectangle(480, 20, 960, 40, 0x05070a, 0.86));
    this.hudContainer.add(this.add.text(96, 6, `1UP\n${String(this.score).padStart(6, '0')}`, {
      color: '#ffdf61',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 108,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(480, 6, `LEVEL ${this.level.level}\n${this.level.name.toUpperCase()}`, {
      color: '#ff4e57',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      align: 'center',
      fixedWidth: 300,
      lineSpacing: 1,
    }).setOrigin(0.5, 0));
    this.hudContainer.add(this.add.text(760, 6, `TIME\n${String(this.remainingSeconds).padStart(3, '0')}`, {
      color: '#68f39a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 80,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(852, 6, `LIVES\n${this.lives}`, {
      color: '#ff4e57',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 80,
      lineSpacing: 1,
    }));
  }

  private hitMovingFreight(): void {
    if (this.time.now - this.lastHazardHitAt < 1200) {
      return;
    }

    this.lastHazardHitAt = this.time.now;
    this.lives -= 1;
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 5);
    playSoundEffect('crash');
    this.cameras.main.shake(150, 0.008);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setPosition(this.level.spawn.x, this.level.spawn.y);
    body.setVelocity(0, 0);
    this.drawHud();

    if (this.lives <= 0) {
      this.gameOver('Lives reached zero.');
    }
  }

  private gameOver(reason: string): void {
    playSoundEffect('crash');
    this.scene.start('GameOverScene', {
      score: this.score,
      picks: `${this.collected} / ${this.level.collectibles.length}`,
      accuracy: 100,
      reason,
    });
  }

  private startMusicPlaylist(): void {
    this.stopMusicPlaylist();
    this.playCurrentMusic();
  }

  private playCurrentMusic(): void {
    const key = this.level.musicKeys[this.currentMusicIndex];
    this.currentMusic = this.sound.add(key, { volume: 0.56 });
    this.currentMusic.once('complete', () => {
      this.currentMusic?.destroy();
      this.currentMusicIndex = (this.currentMusicIndex + 1) % this.level.musicKeys.length;
      this.playCurrentMusic();
    });
    this.currentMusic.play();
  }

  private stopMusicPlaylist(): void {
    for (const key of this.level.musicKeys) {
      this.sound.stopByKey(key);
    }
    this.currentMusic?.destroy();
    this.currentMusic = undefined;
  }
}
