// Ported from ba091f73d90aff0a2eec1cd9e56be0b4761e8b57's approved CSS keyframes.
// Segment easing mirrors CSSAnimation's normalized keyframes; only transform/opacity is written.
export const metalDuration = 460;
const easing = 'cubic-bezier(.22,1,.36,1)';
export const metalFrames: Record<'next' | 'previous', Keyframe[][]> = {
  next: [
    // metal-flow-core-next
    [
      { offset: 0, easing, transform: 'none' },
      { offset: 0.24, easing, transform: 'translateY(5px) scaleX(.86) scaleY(1.22)' },
      { offset: 0.48, easing, transform: 'translateY(2px) scaleX(.92) scaleY(1.08)' },
      { offset: 0.76, easing, transform: 'translateY(-2px) scale(1.03,.96)' },
      { offset: 1, easing, transform: 'none' },
    ],
    // metal-stream-next
    [
      { offset: 0, easing, opacity: '0', transform: 'translate(-50%,-35%) scale(.25,.08)' },
      { offset: 0.08, easing, opacity: '0', transform: 'translate(-50%,-35%) scale(.25,.08)' },
      { offset: 0.2, easing, opacity: '.54', transform: 'translate(-50%,-14%) scale(.68,.42)' },
      { offset: 0.4, easing, opacity: '.68', transform: 'translate(-50%,-2%) scale(1,1)' },
      { offset: 0.58, easing, opacity: '.12', transform: 'translate(-50%,22%) scale(.52,.3)' },
      { offset: 0.68, easing, opacity: '0', transform: 'translate(-50%,34%) scale(.24,.08)' },
      { offset: 1, easing, opacity: '0', transform: 'translate(-50%,-35%) scale(.25,.08)' },
    ],
    // metal-bead-next
    [
      { offset: 0, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(4px) scale(.2)' },
      { offset: 0.14, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(4px) scale(.2)' },
      { offset: 0.26, easing, opacity: '.58', transform: 'translate(-50%,-50%) translateY(16px) scale(.62)' },
      { offset: 0.44, easing, opacity: '.76', transform: 'translate(-50%,-50%) translateY(34px) scale(.88)' },
      { offset: 0.62, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(19px) scale(.3)' },
      { offset: 1, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(4px) scale(.2)' },
    ],
  ],
  previous: [
    // metal-flow-core-previous
    [
      { offset: 0, easing, transform: 'none' },
      { offset: 0.24, easing, transform: 'translateY(-5px) scaleX(.86) scaleY(1.22)' },
      { offset: 0.48, easing, transform: 'translateY(-2px) scaleX(.92) scaleY(1.08)' },
      { offset: 0.76, easing, transform: 'translateY(2px) scale(1.03,.96)' },
      { offset: 1, easing, transform: 'none' },
    ],
    // metal-stream-previous
    [
      { offset: 0, easing, opacity: '0', transform: 'translate(-50%,-65%) scale(.25,-.08)' },
      { offset: 0.08, easing, opacity: '0', transform: 'translate(-50%,-65%) scale(.25,-.08)' },
      { offset: 0.2, easing, opacity: '.54', transform: 'translate(-50%,-86%) scale(.68,-.42)' },
      { offset: 0.4, easing, opacity: '.68', transform: 'translate(-50%,-98%) scale(1,-1)' },
      { offset: 0.58, easing, opacity: '.12', transform: 'translate(-50%,-122%) scale(.52,-.3)' },
      { offset: 0.68, easing, opacity: '0', transform: 'translate(-50%,-134%) scale(.24,-.08)' },
      { offset: 1, easing, opacity: '0', transform: 'translate(-50%,-65%) scale(.25,-.08)' },
    ],
    // metal-bead-previous
    [
      { offset: 0, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(-4px) scale(.2)' },
      { offset: 0.14, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(-4px) scale(.2)' },
      { offset: 0.26, easing, opacity: '.58', transform: 'translate(-50%,-50%) translateY(-16px) scale(.62)' },
      { offset: 0.44, easing, opacity: '.76', transform: 'translate(-50%,-50%) translateY(-34px) scale(.88)' },
      { offset: 0.62, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(-19px) scale(.3)' },
      { offset: 1, easing, opacity: '0', transform: 'translate(-50%,-50%) translateY(-4px) scale(.2)' },
    ],
  ],
};
