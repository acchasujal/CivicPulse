# Performance Report

## Current evidence

The production build completes successfully. The largest emitted assets are the React vendor chunk (~316 kB raw), home page chunk (~136 kB raw), and query chunk (~47 kB raw). Maps, galleries, and non-critical routes are lazy-loaded through the router.

## Required release checks

- Measure LCP, INP, CLS, and total transfer on a low-end Android profile over slow 3G.
- Confirm the public landing content renders before map tiles.
- Verify responsive image sizing and that failed images retain useful text alternatives.
- Set a documented budget for initial JS, route JS, image bytes, and upload size.
- Run the production build with the real API origin and no development fallback.

## Known limitation

No automated browser performance budget is currently configured. This is a release follow-up, not evidence of failure or success.
