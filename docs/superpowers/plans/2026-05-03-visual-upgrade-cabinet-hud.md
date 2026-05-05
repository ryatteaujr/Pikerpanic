# Cabinet HUD Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Warehouse Picker Panic from placeholder rectangles into a polished retro warehouse arcade cabinet view matching the supplied reference image.

**Architecture:** Keep Phaser responsible for the warehouse floor, racks, vehicles, pickups, power-up markers, and movement feedback. Keep the dense status panels, current order, controls, score, safety message, and warehouse status as DOM UI so text remains crisp and easy to iterate.

**Tech Stack:** Phaser 3, TypeScript, CSS variables, DOM HUD panels, lightweight generated pixel-style shapes and sprites.

---

### Task 1: Visual System Foundation

**Files:**
- Modify: `src/styles.css`
- Modify: `src/config/levelConfig.ts`
- Modify: `src/scenes/GameScene.ts`

- [ ] Add CSS theme variables for arcade metal, amber trim, warning yellow, scanner blue, chute purple, success green, danger red, and panel shadow.
- [ ] Convert the current HUD into a cabinet-frame layout: top status bar, left sidebar, right sidebar, bottom ticker/status bar, and central playfield.
- [ ] Reserve stable dimensions so panels do not resize when timer, score, accuracy, or combo values change.
- [ ] Keep the center playfield clear and leave warehouse lanes unobscured.

### Task 2: Top Operations Board

**Files:**
- Modify: `src/systems/HudManager.ts`
- Modify: `src/styles.css`

- [ ] Replace the simple text ops board with individual bordered modules:
  - logo/title module
  - truck load timer with progress bar
  - picks completed
  - total picks
  - LPH gauge
  - vehicle tile
  - chute tile
  - accuracy tile
  - combo tile
  - lives tile
- [ ] Use large seven-segment-style numeric treatment for timer, picks, LPH, accuracy, combo, and lives.
- [ ] Add danger styling when timer is under 30 seconds.
- [ ] Add compact icon-like elements using CSS/Phaser shapes, not external art dependencies.

### Task 3: Warehouse Playfield Art Pass

**Files:**
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/objects/PlayerTruck.ts`
- Modify: `src/objects/ForkliftHazard.ts`
- Modify: `src/objects/Pickup.ts`
- Modify: `src/objects/TicketItem.ts`
- Modify: `src/objects/Chute.ts`

- [ ] Replace flat racks with layered rack sprites built from rectangles: blue uprights, orange carton stacks, dark shelf shadows, and yellow floor outlines.
- [ ] Add aisle labels A-L above rack bays.
- [ ] Add dashed yellow lane markings and directional floor arrows.
- [ ] Redraw the pick truck as a small multi-part top-down vehicle with cab, forks/load bed, wheels, and highlight.
- [ ] Redraw the forklift hazard as a readable orange vehicle with forks, cabin, wheels, and red warning glow.
- [ ] Redraw the chute as a purple dock bay with rails, bollards, and downward arrow.
- [ ] Make regular boxes look like small cartons with highlight and shadow.
- [ ] Make required items look like glowing action tiles placed near racks.

### Task 4: Side Panels

**Files:**
- Modify: `src/systems/HudManager.ts`
- Modify: `src/styles.css`

- [ ] Add left top “Mezzanine Access” flavor panel with ramp/stairs visual treatment. It is decorative in V1 and must not imply interactable gameplay.
- [ ] Upgrade current order panel to look like a paper pick ticket clipped inside the cabinet.
- [ ] Add item icons for hammers, tape, and drill bits using CSS/emoji-free inline visual blocks or simple DOM shapes.
- [ ] Add right vehicle stats panel with speed, battery, and capacity meters.
- [ ] Add right controls panel with controller-button rows.
- [ ] Keep permanent controls compact enough that the playfield remains dominant.

### Task 5: Bottom Arcade Bar

**Files:**
- Modify: `src/systems/HudManager.ts`
- Modify: `src/styles.css`

- [ ] Add bottom score and high score panel.
- [ ] Add announcer/status strip with short rotating warehouse messages.
- [ ] Add warehouse status tile showing shift and zone.
- [ ] Add safety warning tile.
- [ ] Ensure the bottom bar does not cover the chute interaction zone.

### Task 6: Feedback and Motion Polish

**Files:**
- Modify: `src/scenes/GameScene.ts`
- Modify: `src/styles.css`

- [ ] Add brief pickup flash/pop feedback for regular boxes.
- [ ] Add glow pulse around nearby ticket item or chute when action is available.
- [ ] Add collision flash and short camera shake when forklift hits the player.
- [ ] Add level-complete and game-over screen styling consistent with the cabinet UI.
- [ ] Respect reduced motion for non-essential DOM animation.

### Task 7: Verification

**Files:**
- Modify: `README.md`

- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run serve` and open `http://127.0.0.1:5173`.
- [ ] Manual check desktop viewport:
  - start screen readable
  - top HUD values fit
  - playfield lanes visible
  - ticket panel readable
  - chute and forklift readable
  - win and lose screens work
- [ ] Manual check smaller viewport:
  - panels scale or collapse without text overlap
  - canvas remains playable
- [ ] Update README with the visual-upgrade notes and known remaining art limitations.

