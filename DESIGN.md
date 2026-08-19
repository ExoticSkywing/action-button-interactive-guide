# DESIGN

## Direction
Immersive Apple Product Viewer, not a white landing page with a demo component. One near-black atmospheric stage contains the local navigation, official device, functional icon rail, connector, close control, and one tutorial HUD.

## Authority
1. User-supplied Apple Action Button expanded-state screenshot.
2. Apple official iPhone 17 Pro Cosmic Orange Portrait Product Bezel (1350×2760 RGBA).
3. Apple CN Product Viewer interaction behavior and timing.
4. userinterface.wiki and Impeccable craft floor for task-oriented UI quality.

## Visual system
- Stage: static mobile and desktop stage artwork over `#000`. The stage never follows or samples uploaded screen colors. Runtime adds no Canvas, WebGL, JavaScript, animation, filter, or video. See `THIRD_PARTY_NOTICES.md`.
- Primary text: `#f5f5f7`; secondary text remains AA-readable.
- One translucent HUD material with 24px blur and subtle inner stroke.
- Selected material: the focused rail uses offline renderings generated from Jakub Antalik's MIT-licensed `metal-fx` source at commit `be1bf89c63056521a4e8224f368768314c9006f7`. The selected anchor uses the original Fragment Shader, `chromatic.dark` preset, and `circle` renderer settings (`shaderScale 1.3`, 2px ring). Its explicitly registered `current ± 1` rail neighbours also receive the library's optional dark-mode proximity reflection: the official target-side geometry and paint constants (`ATTACH_RANGE_PX 32`, `RANGE_PX 12`, mirrored source, Fill + Stroke + Border Highlight) are precomposited into top/bottom 80×80, 48-frame WebPs. Runtime contains one selected-anchor WebP plus at most two target-clipped reflection windows using two shared URLs; non-neighbours are `visibility:hidden`. Reflections yield while the rail is moving and fade onto the new neighbours after settlement. Same-source static PNGs are selected by `prefers-reduced-motion`. The three 48-frame assets use the same 8-frame seamless overlap at 50ms per frame. See `THIRD_PARTY_NOTICES.md`.
- Navigation: the rail is the only step switcher and supports direct click/tap, mouse wheel, vertical pointer drag, and keyboard arrows.
- HUD: read-only supplementary instruction and completion evidence; it contains no previous/next buttons.
- Discoverability: first-time touch/coarse-pointer users see a right-pointing hand with its fingertip anchored immediately beside the selected rail button and moving vertically in parallel with the rail; fine-pointer desktop users see a mouse 4px beside the rail with its central wheel moving vertically. This is a non-committing practice gate, not tutorial navigation: the first valid drag or wheel input produces a directional 14px rail response and matching Metal transfer, rebounds to button 1, and then records the gesture as learned after the 460ms response settles. Throughout practice the canonical state remains `step 0` (`settings` screen, first button selected, `第 1 步，共 4 步`, persisted progress `0`); direct step clicks and navigation keys are blocked, repeated input is swallowed, while close/Escape remains available. After practice, the second valid gesture performs normal navigation to step 2. While this one-time lesson is active, the phone target and HUD are heavily dimmed/blurred so the rail is the sole focal point. Input modality is touch-first: `maxTouchPoints`, `ontouchstart`, `any-pointer: coarse`, and `pointer: coarse` are ORed; CSS never performs a second pointer-mode decision. Touch capability always overrides a fine-pointer report. Learned states persist independently and retain screen-reader copy that explicitly says the tutorial remains on step 1. Reduced-motion confirms learning immediately without rail/Metal animation and still keeps step 0.
- Motion: each real step uses one direction-aware 460ms Metal transfer. Next and previous are vertical mirrors. The HUD settles once within 120ms, the newly selected rail icon uses one 260ms compositor-only settle, and the final phone-screen completion proof confirms once within 500ms. Four steps use static beam angles `226deg`, `300deg`, `42deg`, and `134deg`; angle changes are discrete and never interpolated. Reduced motion bypasses all of these transitions while preserving the resulting state.
- Rail performance: the 460ms transition has one owner. Repeated input keeps only one latest adjacent intent; it never restarts active Metal motion or skips a tutorial step. Stale screen timers are cancelled, four phone screens are parsed once and reused, and forced layout reads are forbidden.
- Close/reopen: closing cancels active and queued transitions, settles the current screen, makes hidden rail/HUD/close controls inert, and focuses the visible restore control. Reopening restores rail focus. Arrow/Home/End navigation is scoped to the rail, never to unrelated top controls.
- Phone, rail, and connector are one composition group.
- Mobile HUD uses one liquid-glass tray. The task screen owns completion evidence; HUD shows action or reuse guidance.
- HUD edge uses the `border-beam` 1.4.0 `md/dark/colorful` visual engine at strength 1. Stroke, inner glow, and bloom remain visible, but rotation, hue shift, fade, and angle interpolation are disabled so an idle tutorial has no permanent gradient-rasterization loop. Life comes from bounded user-triggered response, never ambient looping. Reduced motion uses a quieter static mono edge.

## Responsive composition
- 390×844 and 590×1280: full-height viewer, complete front device, left vertical rail, bottom HUD.
- 768×900 and 1440×1000: same visual language with larger device and wider HUD.
- No alternate duplicate control systems by breakpoint.

## Evidence
- Current human-review screenshots: `RECON/current/`.
- Current user baseline: `RECON/user-baselines/apple-official-mobile-target.jpg`.
- Executable regression output: `RECON/qa-output/` (ignored; generated by `npm run qa`).
- Historical experiments remain in Git tags and are not production dependencies.

## Refusals
No emoji icons, placeholder blocks, decorative glass, duplicate success cards, looping step arrows, WebGL, 3D replacement, or generic card grid.
