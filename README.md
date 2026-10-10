# ⚡ Harry Potter: Interactive Spell-Casting Game

An interactive, cinematic 3D web experience where the player commands Harry Potter as he casts iconic magical spells inside a Hogwarts Castle classroom.

---

## 🌟 Key Features

### 1. Recognizable Harry Potter 3D Character
- **Iconic Visual Design**:
  - Distinctive **Round Dark Wire Glasses** with transparent lenses
  - **Lightning Bolt Scar** visible on the right forehead
  - Messy, tousled dark hair tufts
  - Bright emerald green eyes (Lily Potter's eyes)
  - **Hogwarts Uniform**: Black wizard robes with deep crimson Gryffindor lining, Gryffindor house lion crest, diagonal scarlet and gold striped tie, white collared shirt, charcoal sweater vest, and polished wizard shoes.
  - **The Holly Wand**: 11-inch holly wand with textured handle and interactive wand tip emitter.
- **Natural Skeletal & Cloth Animations**:
  - **Idle**: Chest breathing expansion, wand sway, robe cloth motion, head tracking.
  - **Spell Casting**: Unique, authentic wand movements for each spell:
    - *Expelliarmus*: Dueling pullback followed by aggressive forward thrust
    - *Wingardium Leviosa*: The iconic *"Swish and Flick"* gesture with wrist snap
    - *Lumos*: Raising wand high overhead like a beacon
    - *Nox*: Decisive cross-body extinguishing snuff swipe
    - *Alohomora*: Clockwise spiral loop targeting the padlock
    - *Accio*: Summoning yank gesture with left-hand catch snap

---

### 2. Hogwarts Environment & Interactive Targets
- **Atmospheric Architecture**:
  - Flagstone castle floor with procedural stone tiles and mortar lines
  - Gothic stone pillars, ceiling arches, and Hogwarts Gryffindor wall banners
  - Grand Gothic stained-glass cathedral window streaming moonlight
  - **16 Floating Enchanted Candles** gently bobbing with flickering flames and point lights
- **Interactive Props**:
  - **Training Dueling Dummy**: Wears practice vest; hit by *Expelliarmus* to knock its wand spinning across the flagstone floor.
  - **Enchanted Heavy Cauldron**: Cast-iron cauldron with bubbling potion; lifts up to 3.6m and rotates in a glowing cyan particle vortex with *Wingardium Leviosa*.
  - **Ancient Locked Hogwarts Chest**: Brass-banded oak chest; *Alohomora* causes golden sparks to pop the padlock and swing the lid open, revealing the glowing Sorcerer's Relic!
  - **Distant Grimoire**: Ancient spellbook on a high stone pedestal; *Accio* summons it across the room directly into Harry's hand!
  - **Dynamic Chamber Lighting**: *Lumos* ignites a 360° point light casting warm illumination across the chamber; *Nox* snuffs it back out.

---

### 3. Pure Web Audio API Synthesizer (Zero External Audio Files)
All sound effects are 100% procedurally synthesized in real time using the browser's Web Audio API (no risk of 404s, CORS issues, or missing files):
- **Wand Swish**: Resonant bandpass filter sweeps imitating whooshing wood
- **Expelliarmus**: High-energy plasma discharge, crackle, explosive sub-bass impact, and clattering wood on stone
- **Wingardium Leviosa**: Harmonic chime chord (F#4, A#4, C#5, F5) and ethereal levitation drone
- **Lumos**: Radiant crystal bell overtones and shimmering resonance
- **Nox**: Vacuum suction whoosh and extinguishing sub-bass puff
- **Alohomora**: Pentatonic sparkle cascade, dual mechanical tumbler clicks, and creaking oak lid
- **Accio**: Doppler summoning whistle, rushing air whoosh, and solid catch snap
- **Castle Ambience**: Low reverberant sub drone and distant atmospheric draft

---

## 🎮 Controls & Hotkeys

| Action | Control / Key |
|---|---|
| **Cast Expelliarmus** | Click Card or Press `1` |
| **Cast Wingardium Leviosa** | Click Card or Press `2` |
| **Cast Lumos** | Click Card or Press `3` |
| **Cast Nox** | Click Card or Press `4` |
| **Cast Alohomora** | Click Card or Press `5` |
| **Cast Accio** | Click Card or Press `6` |
| **Repeat Current Spell** | Press `Spacebar` |
| **Reset Chamber** | Click Reset Button or Press `R` |
| **Cycle Camera Preset** | Dropdown Menu or Press `C` |
| **Toggle Mute** | Sound Button or Press `M` |
| **Rotate Camera** | Left-Click & Drag |
| **Pan Camera** | Right-Click & Drag |
| **Zoom Camera** | Mouse Scroll Wheel |

---

## 🚀 How to Run the Game

### Method 1: One-Click Windows Launcher
Double-click `start-game.bat` inside the folder `harry-potter-spells`. This will automatically start the server and open your default browser to `http://localhost:8080/index.html`.

### Method 2: Python HTTP Server
```powershell
cd "d:\1 AI Workflows\harry-potter-spells"
python -m http.server 8080
```
Then visit: [http://localhost:8080/index.html](http://localhost:8080/index.html)

### Method 3: Node / npm
```bash
npm start
```

---

## 📁 Project Structure

```
harry-potter-spells/
├── index.html          # Main HTML entry with Hogwarts gothic UI
├── style.css           # Hogwarts theme (midnight blue, gold foil, responsive grid)
├── start-game.bat      # One-click Windows starter script
├── package.json        # NPM run configuration
├── three.min.js        # Vendored Three.js r128 (works offline)
├── OrbitControls.js    # Vendored Three.js OrbitControls
└── js/
    ├── audio.js        # Web Audio API sound synthesizer
    ├── particles.js    # Procedural particle emitters & textures
    ├── character.js    # Harry Potter 3D model & skeletal animation
    ├── environment.js  # Hogwarts classroom, floating candles, interactive targets
    ├── spells.js       # Spell casting orchestration, projectiles, & state
    └── main.js         # Game loop, camera presets, & event handling
```
