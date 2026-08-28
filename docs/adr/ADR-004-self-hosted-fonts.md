# ADR-004: Fonts — Self-Hosted vs Google CDN

**Status:** Accepted  
**Date:** 2026-08-28

## Context
The dashboard uses 4 pixel/cyber fonts: VT323, Press Start 2P, Silkscreen, Pixelify Sans. Originally loaded from Google Fonts CDN.

## Decision
Download all fonts as TTF files into public/fonts/ and declare them via @font-face in src/index.css. Google CDN references removed from index.html.

## Consequences
- Dashboard is fully air-gapped — works with zero internet access
- Fonts are bundled/served alongside the app (negligible size: ~370KB total)
- No privacy concerns from Google tracking font loads
