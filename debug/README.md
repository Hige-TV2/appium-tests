# Debug Utilities

This folder contains on-demand debugging tools for selector discovery.

## Files

- `podcast.debug.spec.js`:
  Manual debug spec that navigates to the Podcast tab and captures snapshots.
- `video.debug.spec.js`:
  Manual debug spec that navigates to the Video tab, captures state before ad wait,
  waits for ad completion/skip window, then captures state again.
- `selectorDebugHelper.js`:
  Shared helper used by debug specs to generate XML/JSON artifacts from page source.

## Usage

1. Start Appium in one terminal:

```bash
appium
```

2. Run Podcast debug capture from project root:

```bash
npx wdio run wdio.config.js --spec ./debug/podcast.debug.spec.js
```

3. Run Video debug capture from project root:

```bash
npx wdio run wdio.config.js --spec ./debug/video.debug.spec.js
```

4. Generated artifacts are written into this folder with timestamped names.

Podcast artifacts:

- `podcast-landing-<timestamp>-source.xml`
- `podcast-landing-<timestamp>-visible-texts.json`
- `podcast-landing-<timestamp>-selectors.json`
- `podcast-carousel-left-<timestamp>-source.xml`
- `podcast-carousel-left-<timestamp>-visible-texts.json`
- `podcast-carousel-left-<timestamp>-selectors.json`
- `podcast-episodes-<timestamp>-source.xml`
- `podcast-episodes-<timestamp>-visible-texts.json`
- `podcast-episodes-<timestamp>-selectors.json`

Video artifacts:

- `video-initial-<timestamp>-source.xml`
- `video-initial-<timestamp>-visible-texts.json`
- `video-initial-<timestamp>-selectors.json`
- `video-initial-<timestamp>-state.json`
- `video-post-wait-<timestamp>-source.xml`
- `video-post-wait-<timestamp>-visible-texts.json`
- `video-post-wait-<timestamp>-selectors.json`
- `video-post-wait-<timestamp>-state.json`

`*-state.json` includes focused selector diagnostics (exists/displayed/childCount/bounds/text/resourceId) for:

- `exo_ad_overlay`
- `region_dialog`
- `android.widget.SeekBar`
- `TextView[text="Del"]`
- `TextView[text="Lyd"]`
- `exo_content_frame`

## Cleanup

Generated `podcast-*.xml`, `podcast-*.json`, `video-*.xml`, and `video-*.json` files are disposable and can be deleted anytime.
They are ignored by git via the root `.gitignore`.
