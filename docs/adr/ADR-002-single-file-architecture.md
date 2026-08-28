# ADR-002: Single-File Architecture (App.jsx)

**Status:** Accepted  
**Date:** 2026-08-27

## Context
During early development, should we split the app into many component files immediately or keep everything in one App.jsx?

## Decision
Keep everything in a single src/App.jsx for now. All components (FlipCard, GraphBox, ServiceRow, SlimCalendarCard, etc.) live as functions in that file.

## Consequences
- Easier to work on collaboratively with an AI agent (fewer context switches)
- Fine for a dashboard of this scale
- When data integration begins (Netdata, Sonarr APIs), a refactor into /components and /hooks folders should be considered
