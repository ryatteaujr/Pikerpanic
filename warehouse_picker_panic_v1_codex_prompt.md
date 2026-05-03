# Warehouse Picker Panic - Version 1 Build Prompt

You are building a retro 2D arcade warehouse game called Warehouse Picker Panic.

## Project Summary

Warehouse Picker Panic is a Pac-Man-inspired warehouse picking game.

The player drives a pick truck through a top-down warehouse map, collects required merchandise from rack aisles, avoids roaming warehouse hazards, and returns merchandise to the correct chute before the truck load timer expires.

The first version should be a playable MVP. Do not build the full game yet. The goal is to prove the core gameplay loop and make it fun.

## Version 1 Goal

Build one complete playable level.

Version 1 should answer this question:

Can the player drive around a warehouse, collect the right boxes, avoid a forklift, return to the chute, and complete the pick ticket before time runs out?

If yes, Version 1 is successful.

## Recommended Tech Stack

Use:

- Phaser 3
- JavaScript or TypeScript
- Browser-playable first
- Keyboard support
- Xbox controller support using the browser Gamepad API

Build it so it can later be wrapped in Electron or integrated into the Box desktop app.

Use placeholder art and simple pixel-art-style shapes if finished art is not available. Prioritize playability over final visuals.

## Core Game Concept

The player controls a pick truck in a warehouse.

The warehouse is laid out like a top-down arcade maze:

- Racks act like maze walls.
- Travel lanes act like paths.
- Small cardboard boxes act like collectible pickups.
- Required order items are special pick ticket items.
- A chute acts as the delivery/return zone.
- A roaming forklift acts as the main hazard.

The game should feel like:

- Pac-Man for movement and collection
- Warehouse picking for theme
- Arcade timer pressure for urgency

## Version 1 Gameplay Loop

1. Start the level.
2. Player sees a pick ticket.
3. Player drives through warehouse aisles.
4. Player collects regular boxes for points.
5. Player picks required ticket items.
6. Player avoids the roaming forklift.
7. Player returns to the chute to unload.
8. Player completes all required picks before the truck load timer reaches zero.
9. Player sees either Level Complete or Game Over.

## Version 1 Required Features

### 1. Start Screen

Create a basic start screen with:

- Game title: Warehouse Picker Panic
- Start option
- Short control hint
- Message: Complete the pick ticket before the truck leaves.

### 2. Single Warehouse Level

Create one top-down warehouse level.

The level should include:

- Rack rows
- Travel lanes
- Box pickups
- One chute
- One roaming forklift hazard
- One player start position
- One safe respawn position

Use a fixed screen layout for Version 1. Do not implement scrolling unless it is easy and does not delay the MVP.

### 3. Player Vehicle - Pick Truck

Version 1 uses only the pick truck as the playable vehicle.

Pick Truck stats:

- Speed: high
- Handling: good
- Capacity: 4 required items
- Can move through narrow aisles
- Cannot move pallets
- Cannot push obstacles

The pick truck should be fun and responsive to drive.

### 4. Regular Box Pickups

Place small regular boxes throughout the warehouse lanes.

Rules:

- Regular boxes are collected automatically when the player drives over them.
- Regular boxes add score.
- Regular boxes are not required to complete the level unless you choose to make them part of the level objective.
- They should give the game the same collection satisfaction as Pac-Man dots.

### 5. Pick Ticket Items

Create a pick ticket with 3 required item types.

Example:

- Hammers x3
- Tape x2
- Drill Bits x1

Rules:

- Required items are placed at specific rack locations.
- Required items should be visually distinct from regular boxes.
- Player must press the pick-up button when near a required item.
- Correct required item adds it to the truck inventory.
- Wrong item causes a time penalty and breaks the combo.
- If the truck is full, the player must return to the chute before picking more required items.

### 6. Truck Capacity

The pick truck has limited capacity.

Version 1 capacity:

- 4 required items

Rules:

- When capacity is full, show a message such as: Truck full - return to chute.
- Player cannot pick additional required items until unloading.
- Regular point boxes can still be collected if you decide that works better for gameplay.

### 7. Chute Delivery Zone

Create one chute delivery zone.

Example:

- Chute 06

Rules:

- Player must drive to the chute and press the unload button.
- Unloading transfers carried required items into completed pick ticket progress.
- The level is complete only when all required ticket items have been picked and unloaded.
- The chute should be clearly marked and easy to recognize.

### 8. Forklift Hazard

Add one roaming forklift hazard.

Version 1 rules:

- Forklift moves through warehouse lanes.
- Forklift should patrol or chase using simple logic.
- If forklift collides with the player:
  - Player loses one life.
  - Player respawns at safe start point.
  - Combo resets.
  - Optional: lose a few seconds from the timer.

Keep the forklift AI simple. A basic patrol is acceptable for Version 1.

### 9. Timer

Add a truck load countdown timer.

Example starting value:

- 5:00

Rules:

- Timer counts down during gameplay.
- If timer reaches zero, show Game Over.
- If timer is below 30 seconds, visually warn the player.
- The timer should appear in the operations board HUD.

### 10. Lives

Add lives.

Example:

- 3 lives

Rules:

- Collision with forklift costs one life.
- If lives reach zero, show Game Over.

### 11. Score

Add arcade scoring.

Recommended Version 1 scoring:

- Regular box: +10
- Correct ticket item picked: +100
- Chute unload: +250
- Completed ticket: +500
- Remaining time bonus: +10 per second remaining
- Perfect accuracy bonus: optional
- Wrong item: -100 or time penalty

### 12. Accuracy

Track pick accuracy.

Simple Version 1 formula:

- Correct required picks / total required pick attempts

Show accuracy as a percentage on the HUD.

If there are no attempts yet, show 100%.

### 13. Combo

Add a simple combo system.

Rules:

- Correct picks increase combo.
- Wrong picks reset combo.
- Forklift collision resets combo.
- Combo can multiply score from required picks.

Keep this simple for Version 1.

### 14. Warehouse Operations Board HUD

The HUD should look like a warehouse operations board across the top of the screen.

Show:

- Truck Load Timer
- Picks Completed
- Total Picks
- LPH
- Vehicle
- Chute
- Accuracy
- Combo
- Lives

Example:

```text
WAREHOUSE OPS BOARD
TRUCK LOAD TIMER: 04:37
PICKS: 3 / 6
LPH: 147
VEHICLE: PICK TRUCK
CHUTE: 06
ACCURACY: 96%
COMBO: x3
LIVES: 2
```

LPH can be a simple calculated game metric. It does not need to be realistic in Version 1.

Suggested simple formula:

```text
LPH = completed picks / elapsed minutes * 60
```

### 15. Current Pick Ticket Panel

Add a pick ticket panel on the side of the screen or below the HUD.

Show:

- Pick ticket number
- Required item types
- Required quantities
- Completed quantities

Example:

```text
PICK TICKET #7824

Hammers     1 / 3
Tape        0 / 2
Drill Bits  0 / 1
```

### 16. Controls Panel

Show basic controls somewhere on the screen, pause menu, or start screen.

## Controls

### Keyboard

- Arrow keys or WASD: Move
- Space: Pick up required item
- E or B: Unload at chute
- H: Horn/stun hazard if implemented
- Shift: Boost if implemented
- Escape: Pause

### Xbox Controller

Use the browser Gamepad API.

Map controls:

- Left stick: Move
- D-pad: Move
- A: Pick up required item
- B: Unload at chute
- X: Horn/stun hazard if implemented
- Right trigger: Boost if implemented
- Start/Menu: Pause

For Version 1, movement, pick up, unload, and pause are required. Horn and boost are optional.

## Version 1 Win Condition

The player wins the level when:

1. All required pick ticket items have been picked.
2. All required items have been unloaded at the chute.
3. The truck load timer has not reached zero.
4. The player still has at least one life.

Show a Level Complete screen with:

- Score
- Time remaining
- Accuracy
- LPH
- Lives remaining
- Grade

Example grades:

- S: Perfect Picker
- A: Load Boss
- B: Solid Shift
- C: Needs Coaching
- F: Truck Left Without You

## Version 1 Lose Conditions

The player loses when:

- Timer reaches zero
- Lives reach zero

Show a Game Over screen with:

- Final score
- Picks completed
- Accuracy
- Restart option

## Visual Style

Use a retro 16-bit arcade style.

Important visual ideas:

- Warehouse racks instead of maze walls
- Cardboard boxes instead of dots
- Chute instead of Pac-Man home base
- Pick truck instead of Pac-Man
- Forklift instead of ghost
- Operations board instead of normal HUD
- Bright, readable, fun arcade look

Placeholder visuals are acceptable, but the layout should make the intended game clear.

## Sound - Version 1

If easy, add simple placeholder sounds:

- Box pickup
- Required item pickup
- Chute unload
- Forklift collision
- Timer warning
- Level complete
- Game over

If sound slows down the MVP, leave hooks/placeholders and document where sounds should be added.

## Code Organization Expectations

Create a clean structure.

Suggested organization:

```text
/src
  /scenes
    BootScene
    StartScene
    GameScene
    GameOverScene
    LevelCompleteScene
  /objects
    PlayerTruck
    ForkliftHazard
    Pickup
    TicketItem
    Chute
  /systems
    InputManager
    GamepadManager
    ScoreManager
    TicketManager
    TimerManager
    HudManager
  /config
    gameConfig
    levelConfig
    vehicleConfig
    scoringConfig
```

Use whatever structure makes sense for the actual framework, but keep logic separated enough that the game can grow.

## README Requirements

Create or update README.md with:

- Project description
- How to install dependencies
- How to run the game locally
- Keyboard controls
- Xbox controller controls
- Current Version 1 features
- Known limitations
- Version 2 roadmap

## Version 1 Acceptance Criteria

Version 1 is done when:

1. The game starts in a browser.
2. The player can start a level.
3. The pick truck can move with keyboard.
4. The pick truck can move with an Xbox controller when connected.
5. The player can collect regular box pickups.
6. The player can pick required ticket items.
7. The player has limited carrying capacity.
8. The player can unload at the chute.
9. The HUD updates during play.
10. The timer counts down.
11. The forklift hazard can cost the player a life.
12. The player can win by completing and unloading all required picks.
13. The player can lose when the timer reaches zero.
14. The player can lose when lives reach zero.
15. Level Complete and Game Over screens work.
16. Restart works.
17. README.md explains how to run and play.

## Do Not Build in Version 1

Do not build these yet unless the MVP is already complete:

- Playable forklift
- Vehicle selection screen
- Multiple levels
- Mezzanine movement
- Multiple floors
- Multiple chutes
- Full campaign
- Online leaderboard
- Complex enemy AI
- Inventory database
- AI-generated levels
- Final pixel art system
- Advanced sound design
- Box desktop integration

The Version 1 priority is a playable, fun core loop.

# Version 2 Future Enhancements

After Version 1 is playable, Version 2 should expand the game into a fuller arcade experience.

## Version 2 Goal

Version 2 should add player choice, stronger warehouse flavor, and more replayability.

Version 2 should answer this question:

Can the game support multiple vehicles, multiple level types, and more interesting warehouse objectives while still feeling simple and fun?

## Version 2 Planned Features

### 1. Vehicle Selection Screen

Add a vehicle selection screen before levels.

Vehicles:

#### Pick Truck

- Fast
- Tight turning
- Low capacity
- Can enter narrow aisles
- Best for fast carton picking

#### Forklift

- Slower
- Wider turning
- Higher capacity
- Can move pallets
- Can push blocked pallets
- Cannot enter narrow aisles
- Best for dock/loadout levels

Display simple stats:

```text
Speed
Handling
Capacity
Heavy Load Ability
```

### 2. Playable Forklift

Make forklift a playable vehicle.

Forklift rules:

- Carries heavier loads
- Moves pallets
- Pushes blocked pallets
- Turns slower
- Has a larger collision box
- Scores bonuses for pallet deliveries

### 3. Level 2 - Forklift Load Out

Create a second level focused on forklift gameplay.

Theme:

- Dock area
- Pallet movement
- Truck loading
- Chute delivery
- Heavier warehouse hazards

Objectives:

- Pick up pallets
- Deliver to correct truck lane or chute
- Avoid dock traffic
- Complete before dispatch timer expires

### 4. Mezzanine Level

Add a multi-level warehouse concept.

Possible mechanics:

- Ramps
- Stairs
- Freight elevator
- Upper rack locations
- Lower floor and upper mezzanine route choices

This should add Donkey Kong-style vertical flavor without making the game too complicated.

### 5. Power-Ups

Add arcade power-ups.

Recommended:

#### Coffee Boost

Temporary speed increase.

#### Safety Vest

Temporary invincibility.

#### Horn Blast

Stuns forklifts.

#### Route Scanner

Highlights next required item.

#### Battery Recharge

Restores vehicle boost energy.

### 6. More Hazards

Add additional warehouse hazards.

Ideas:

- Floor spills
- Blocked pallets
- Conveyor crossings
- Other pickers
- Supervisor warning zone
- Dock door danger zone
- Falling carton area

### 7. Better Forklift AI

Give hazards simple personalities similar to Pac-Man ghosts.

Examples:

- Red forklift: chases player
- Blue forklift: patrols fixed aisles
- Yellow forklift: guards chute
- Green forklift: wanders randomly

### 8. Multiple Chutes

Add more than one chute.

Rules:

- Pick ticket tells the player which chute to deliver to.
- Delivering to the wrong chute causes a penalty.
- Later levels can require multiple chute deliveries.

### 9. Better Scoring and Grades

Improve end-of-level scoring.

Track:

- Time remaining
- Accuracy
- LPH
- Combo streak
- Wrong picks
- Collisions
- Route efficiency
- Chute delivery time

Add fun rank names:

- S: Perfect Picker
- A: Load Boss
- B: Solid Shift
- C: Needs Coaching
- D: Coaching Required
- F: Truck Left Without You

### 10. Sound and Music

Add arcade sound effects and music.

Sounds:

- Pickup pop
- Required item ding
- Chute unload burst
- Forklift horn
- Collision crash
- Timer warning
- Level complete jingle
- Game over sting

Music:

- Retro warehouse beat
- Faster warning music under 30 seconds

### 11. Better Art

Replace placeholder shapes with pixel art.

Art assets:

- Pick truck
- Forklift
- Pallet jack
- Racks
- Cardboard boxes
- Chute
- Dock doors
- Worker avatar
- Power-ups
- Hazard signs
- Operations board

### 12. Box Integration

Later, integrate into the Box desktop assistant.

Possible Box features:

- Box mascot appears as the announcer.
- Box comments on player performance.
- Voice command: Start Picker Panic.
- Voice command: Drop the beat / start level.
- Box gives funny warehouse messages after wins/losses.
- Save high scores into SmartBrain.

### 13. Patterned Level Progression

Possible level progression:

```text
Level 1: Pick Truck Training Run
Level 2: Forklift Load Out
Level 3: Mezzanine Mayhem
Level 4: Rush Order
Level 5: Black Friday Loadout
```

### 14. Save Data

Add local save data.

Save:

- High scores
- Best LPH
- Best accuracy
- Unlocked vehicles
- Completed levels
- Settings

### 15. Settings Menu

Add settings for:

- Volume
- Music
- Sound effects
- Controller sensitivity
- Fullscreen
- Difficulty

## Version 2 Design Rule

Do not make the game too realistic.

The game should stay arcade-simple:

```text
Grab the boxes.
Avoid the forklifts.
Get back to the chute.
Beat the timer.
```

Every new feature should support that loop.

# Development Instruction

Start with Version 1 only.

Do not begin Version 2 until Version 1 acceptance criteria are complete.

When Version 1 is complete, summarize what was built, what files were changed, how to run it, and what Version 2 work is recommended next.
