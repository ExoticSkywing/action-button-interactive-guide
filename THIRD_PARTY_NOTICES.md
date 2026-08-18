# Third-party notices

## Apple product bezel

- Asset: transparent iPhone 17 Pro Cosmic Orange portrait product bezel
- Runtime path: `public/media/bezel/iphone-17-pro-cosmic-orange-portrait.png`
- Source: Apple product-bezel disk image supplied for this tutorial project
- Original dimensions: 1350×2760 RGBA
- Rights holder: Apple Inc.

This first-party product artwork is retained only because the project explicitly requires the official transparent hardware frame. Apple trademarks and product artwork are not licensed by the open-source notices below. Confirm distribution rights before publishing the repository or deploying it outside the authorized project context. The tutorial is an independent implementation and is not affiliated with or endorsed by Apple.

## Stage background photograph

- Work: `Black wavy ribbons with shadows`
- Photographer: Andrew Kliatskyi (`@kirp`)
- Unsplash photo ID: `Cc0VTXEkdxw`
- Canonical page: https://unsplash.com/photos/black-wavy-ribbons-with-shadows-Cc0VTXEkdxw
- License: Unsplash License, https://unsplash.com/license
- Source dimensions used: 2160×3840

The stage ships two darkened, responsive derivative crops from this photograph: a 1200×2133 mobile WebP and a 1600×1262 desktop WebP. The derivatives contain no text, logo, watermark, person, or identifiable brand. They are used as part of the complete tutorial interface, not sold or redistributed as standalone stock media.

## border-beam

- Project: `border-beam` in `Jakubantalik/Libraries`
- Author: Jakub Antalik
- Repository: https://github.com/Jakubantalik/Libraries
- Source commit: `cdbcf43cdcc1703efd7a4c14e217e7ec5c551b7a`
- Package version: `1.4.0`
- License: MIT

The mobile HUD adapts the generated `md`, `dark`, `colorful` CSS engine without shipping React. It preserves the upstream stroke, inner glow, bloom, mask, palette, and hue cycle. Normal motion matches the official Main Large demo: 1.96s travel and strength 1. The HUD supplies its own 24px radius and 1px border. Reduced motion disables rotation and hue shift, hides bloom, and uses a static white/cyan edge.

## metal-fx

- Project: `metal-fx`
- Author: Jakub Antalik
- Repository: https://github.com/Jakubantalik/metal-fx
- Source commit used for offline asset generation: `be1bf89c63056521a4e8224f368768314c9006f7`
- Package version at capture time: `1.0.4`
- License: MIT

The selected tutorial rail material is an offline rendering generated from the project’s original Fragment Shader, `chromatic.dark` preset, and `circle` renderer settings. Its optional dark-mode proximity-reflection pipeline is also adapted offline: explicitly registered adjacent targets (`current ± 1`) use the original `ATTACH_RANGE_PX`, `RANGE_PX`, mirrored source, Fill, Stroke, and Border Highlight paint semantics precomposited into direction-specific top/bottom Animated WebPs. The application does not ship React, the source renderer, Canvas, or WebGL. Runtime delivery consists of one 80×80 selected-ring Animated WebP, two shared 80×80 target-reflection WebPs, and same-source static PNGs for reduced motion. At most two target reflection windows are visible; non-neighbours are hidden. All three animations share the same 8-frame seamless closure.

```text
MIT License

Copyright (c) 2026 Jakub Antalik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
