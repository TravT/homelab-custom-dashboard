# ADR-003: Mobile Stack vs Desktop Grid for Active Services

**Status:** Accepted  
**Date:** 2026-08-27

## Context
The 25-service homelab stack needs to be presented in a compact, navigable way on both mobile and wide desktop screens.

## Decision
- **Mobile / Tablet (< xl breakpoint):** Tinder-style stacked cards. Touch swipe left/right to cycle pages. Z-index driven, infinitely looping.
- **Desktop (>= xl breakpoint):** The stack disappears and is replaced by a CSS Grid (xl:grid-cols-2, 2xl:grid-cols-3) rendering all 5 pages side-by-side.

## Consequences
- No onWheel handlers on desktop — native page scroll is preserved
- Mobile gets a high-quality gesture-driven UX without needing a library
- The stackSequence array is 50 items (5 pages * 10) to allow many swipe cycles before resetting
