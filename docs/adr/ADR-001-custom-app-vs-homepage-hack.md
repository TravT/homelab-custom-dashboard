# ADR-001: Custom Dashboard vs Hacking gethomepage/homepage

**Status:** Accepted  
**Date:** 2026-08-27

## Context
The initial approach was to inject custom CSS/JS into the official gethomepage/homepage Next.js app. This was fragile and difficult to maintain.

## Decision
Build a custom React + Vite + Tailwind v4 dashboard from scratch.

## Consequences
- Full control over layout, animations, and UX
- No dependency on the upstream homepage project's build system
- Requires us to implement our own service status checks instead of relying on homepage's built-in pinging
- More work upfront, but far more flexible and maintainable
