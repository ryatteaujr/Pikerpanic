# Warehouse Picker Panic

Warehouse Picker Panic is a retro 2D arcade warehouse game inspired by Pac-Man. Version 1 is a playable browser MVP: drive a pick truck, collect regular boxes, pick required ticket items, avoid a roaming forklift, unload at Chute 06, and finish before the truck load timer expires.

## Install

```powershell
npm install
```

## Run Locally

```powershell
npm run dev
```

Open the local URL printed by the server. The default is `http://127.0.0.1:5173`.

To serve the most recent production build without rebuilding first, use:

```powershell
npm run serve
```

For Vite's live-reload development server, use:

```powershell
npm run vite
```

## Build and Test

```powershell
npm run test
npm run build
```

## Keyboard Controls

- Move: Arrow keys or WASD
- Pick required item: Space
- Unload at chute: E or B
- Pause: Escape

## Xbox Controller Controls

- Move: Left stick or D-pad
- Pick required item: A
- Unload at chute: B
- Pause: Start/Menu

## Version 1 Features

- Start screen, game over screen, level complete screen, and restart flow
- One fixed top-down warehouse level with rack rows and travel lanes
- Retro arcade cabinet HUD with top operations board, side panels, and bottom status bar
- Layered warehouse art with rack bays, aisle labels, lane markings, vehicle shapes, and chute dock
- Pick truck movement with keyboard and browser Gamepad API support
- Regular box pickups for arcade scoring
- Pick ticket with Hammers, Tape, and Drill Bits
- Truck capacity limit of four required items
- Chute 06 delivery zone with unload action
- Roaming forklift patrol that costs lives on collision
- Truck load countdown timer, lives, score, combo, accuracy, LPH, and grade
- Warehouse operations board HUD and current pick ticket panel

## Known Limitations

- Art is built from Phaser/CSS shapes rather than final hand-drawn pixel sprites.
- Sound hooks are not implemented yet.
- Forklift AI uses a simple patrol.
- The level is fixed-screen and does not scroll.
- On small screens, side and bottom cabinet panels collapse to protect the playable routes.
- Gamepad support depends on browser controller mapping.

## Version 2 Roadmap

- Vehicle selection with playable forklift
- Additional levels including dock loadout and mezzanine concepts
- Power-ups such as Coffee Boost, Safety Vest, Horn Blast, and Route Scanner
- Multiple forklift hazard personalities
- Multiple chutes and wrong-chute penalties
- Better scoring, sound, music, art, settings, and local save data
