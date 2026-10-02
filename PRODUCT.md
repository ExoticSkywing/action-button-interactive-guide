# PRODUCT

## Product truth
A nontechnical-user tutorial gateway. The root page asks which operating system the person is using and exposes only destinations that have a real tutorial URL. The local `#ios` destination opens the existing seven-step Apple ID / Media & Purchases tutorial without altering its verified state machine, screenshots, HUD copy, or rail behavior.

## Priority
1. Task completion
2. State certainty
3. Error recovery
4. Reading burden
5. Decoration

## User outcome
Choose the operating system of the device being operated, enter the matching tutorial when one is available, and complete the task without technical assistance.

## Gateway contract
- The root route is the operating-system selector.
- `#ios` opens the local iOS / iPadOS tutorial.
- Android, HarmonyOS, Windows, and macOS remain visible but natively disabled until a real destination URL is configured.
- Browser history, refresh, and the tutorial’s “选择设备” control preserve a recoverable route between the gateway and iOS tutorial.
- Hidden route layers are both `hidden` and `inert`; route changes move focus to the destination heading.

## Canonical flow
1. Open Settings from the Home Screen.
2. Open the Apple account from Settings.
3. Open Media & Purchases.
4. Sign out of Media & Purchases.
5. Confirm sign-out when the optional confirmation appears.
6. Return to the Apple account and open Media & Purchases again.
7. Choose the second identity option to sign in with another Apple ID.

The numbered “1,2,3” actions shown in step 6 belong to the supplied screenshot’s own annotations. They are not references to the external seven-step tutorial rail. The confirmed step-6 HUD copy intentionally mirrors those on-screen annotation numbers.

## Recovery
Direct step selection from the single external rail by click/tap, mouse wheel, vertical drag, or rail-scoped keyboard arrows; restart; close/reopen; local step persistence; reduced-motion support. Closing is a stable transaction boundary: queued navigation is cancelled, the current step and screen are settled, hidden controls become inert, and focus moves to the visible restore control. The bottom HUD is read-only and never duplicates navigation.

## Completion evidence
The final phone screen shows the identity-choice dialog, with the second option visibly targeted; the HUD tells the user to use another Apple ID account.

## Technical contract
- Apple official transparent Product Bezel is the hardware foreground.
- Seven screenshot-backed screen states render beneath the transparent display hole.
- Separate mobile and desktop static stage images provide atmosphere without following or sampling screen content.
- No Lotus, Three.js, WebGL, canvas, perspective patches, or flattened-screen masks.
- No runtime video, React, or persistent background renderer.
- External interaction shell follows the supplied Apple Action Button reference.
