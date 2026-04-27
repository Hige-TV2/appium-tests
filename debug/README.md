# Debug Utilities

This folder contains on-demand debugging tools for selector discovery.

## Files

- `podcast.debug.spec.js`:
  Manual debug spec that navigates to the Podcast tab and captures snapshots.
- `selectorDebugHelper.js`:
  Helper used by the debug spec to generate XML/JSON artifacts from page source.

## Usage

1. Start Appium in one terminal:

```bash
appium
```

2. Run debug capture from project root:

```bash
npm run test:podcast:debug
```

3. Generated artifacts are written into this folder with timestamped names:

- `podcast-landing-<timestamp>-source.xml`
- `podcast-landing-<timestamp>-visible-texts.json`
- `podcast-landing-<timestamp>-selectors.json`
- `podcast-carousel-left-<timestamp>-source.xml`
- `podcast-carousel-left-<timestamp>-visible-texts.json`
- `podcast-carousel-left-<timestamp>-selectors.json`
- `podcast-episodes-<timestamp>-source.xml`
- `podcast-episodes-<timestamp>-visible-texts.json`
- `podcast-episodes-<timestamp>-selectors.json`

## Cleanup

Generated `podcast-*.xml` and `podcast-*.json` files are disposable and can be deleted anytime.
They are ignored by git via the root `.gitignore`.
