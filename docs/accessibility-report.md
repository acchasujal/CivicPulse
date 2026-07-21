# Accessibility Report

## Implemented baseline

The frontend has semantic components, keyboard-sized controls, a skip link, reduced-motion/accessibility providers, and list-oriented alternatives in the product architecture. Typecheck and lint pass.

## Required release validation

Run keyboard-only navigation, NVDA/JAWS, VoiceOver/TalkBack, 200% zoom, high contrast, reduced motion, color-vision simulation, 320px width, and slow 3G against every production route. Validate map/list parity and focus restoration for dialogs and sheets.

## Current limitation

No automated axe/browser suite is installed. Manual and browser-based validation remain release gates, especially for the legacy component tree that still emits hook-dependency and fast-refresh warnings.
