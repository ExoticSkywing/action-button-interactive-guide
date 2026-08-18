# RECON evidence policy

## Current evidence

`current/` contains only the present design's human-review material:

- compact mobile viewport;
- tall mobile viewport;
- desktop and wide-desktop viewports;
- Chromium and Firefox contact sheets;
- white / saturated-green / near-black screen-content matrix.

`user-baselines/` contains the still-relevant user-supplied visual baseline.

## Automated output

`scripts/qa.ts` writes to `qa-output/` by default. The directory is ignored because Animated WebP capture phase can change PNG bytes between valid runs. Test validity comes from executable assertions and process exit status, not from committing a new screenshot on every run.

Use a custom directory when a review needs retained evidence:

```bash
QA_OUTPUT_DIR=/absolute/review/path npm run qa
```

## Historical evidence

Old v1/v2/v3 layouts, official-video experiments, wallpaper composites, Border Beam development phases, and intermediate Metal FX frames remain recoverable from Git history and the `preview/official-bezel-tutorial-*` tags. They are intentionally absent from the current branch so obsolete assets cannot be mistaken for production dependencies.

## Local reference material

`reference-only/` is ignored and must never enter `public/` or `dist/`. It may contain first-party research material that is not licensed for redistribution.
