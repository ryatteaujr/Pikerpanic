# Warehouse Picker Panic V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable browser MVP where a pick truck collects boxes, picks required ticket items, unloads at a chute, avoids a forklift, and wins or loses against timer and lives.

**Architecture:** Phaser owns rendering, physics, scenes, and arcade collision. Plain TypeScript systems own scoring, ticket progress, timer formatting, accuracy, capacity, and grading so the core loop is testable without a browser.

**Tech Stack:** Vite, TypeScript, Phaser 3, Vitest, browser Gamepad API, DOM overlay HUD.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`

- [ ] Create the Vite and TypeScript project files.
- [ ] Install dependencies with `npm install`.
- [ ] Run `npm run build` and confirm Vite can compile the empty shell.

### Task 2: Testable Core Systems

**Files:**
- Create: `src/config/scoringConfig.ts`
- Create: `src/config/vehicleConfig.ts`
- Create: `src/config/levelConfig.ts`
- Create: `src/systems/ScoreManager.ts`
- Create: `src/systems/TicketManager.ts`
- Create: `src/systems/TimerManager.ts`
- Create: `src/systems/GradeManager.ts`
- Create: `src/systems/__tests__/systems.test.ts`

- [ ] Write failing Vitest tests for ticket picking, capacity, unloading, accuracy, timer formatting, LPH, and grade thresholds.
- [ ] Run `npm run test` and confirm the tests fail because systems do not exist.
- [ ] Implement the smallest systems needed to pass those tests.
- [ ] Run `npm run test` and confirm the tests pass.

### Task 3: Phaser Scenes and Objects

**Files:**
- Create: `src/config/gameConfig.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/StartScene.ts`
- Create: `src/scenes/GameScene.ts`
- Create: `src/scenes/GameOverScene.ts`
- Create: `src/scenes/LevelCompleteScene.ts`
- Create: `src/objects/PlayerTruck.ts`
- Create: `src/objects/ForkliftHazard.ts`
- Create: `src/objects/Pickup.ts`
- Create: `src/objects/TicketItem.ts`
- Create: `src/objects/Chute.ts`
- Create: `src/systems/InputManager.ts`
- Create: `src/systems/GamepadManager.ts`
- Create: `src/systems/HudManager.ts`

- [ ] Create Phaser scenes for start, gameplay, win, and loss.
- [ ] Add a fixed warehouse map with rack wall bodies, travel lanes, box pickups, ticket items, chute, player, and forklift patrol.
- [ ] Wire keyboard and gamepad controls for move, pick, unload, pause, and restart.
- [ ] Connect HUD updates to the testable systems.

### Task 4: Documentation and Verification

**Files:**
- Create: `README.md`
- Modify: `package.json`

- [ ] Document installation, running, controls, V1 features, limitations, and V2 roadmap.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Start the local dev server with `npm run dev -- --host 127.0.0.1`.

