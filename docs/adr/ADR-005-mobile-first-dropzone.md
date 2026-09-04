# ADR-005: Mobile-First Architecture for Homelab Dropzone

**Status:** Accepted  
**Date:** 2026-09-04

## Context
Feature 1 (Homelab Dropzone) introduces ephemeral file transfer and AirDrop-like staging into the Command Center. Because homelab monitoring and file transfers are heavily performed from handheld devices (such as the Galaxy S24 Ultra daily driver and S20 FE node), designing desktop-first modals risks cramped touch targets, poor thumb reach, and awkward scaling on smaller viewports.

## Decision
Design and implement the Dropzone interface using a strict **Mobile-First Responsive Morphing Strategy**:

1. **Mobile (< 640px / Phone)**:
   - **Bottom Sheet Drawer**: Replaces the desktop centered window with an ergonomic bottom drawer sliding up from the screen bottom (`translate-y-full` to `translate-y-0`), matching the mobile UX already established by the Scheduled Releases Calendar.
   - **Thumb Ergonomics**: 44px+ minimum touch targets for tabs (`STAGE DROP` / `ACTIVE DROPS`), segmented TTL pills (`1h`, `24h`, `7d`, `Keep`), and action buttons.
   - **Camera-Optimized QR Card**: High-contrast, centered QR code sized for quick scanning from second-screen devices.
   - **Mobile File Picker**: Large tap-to-browse target utilizing the native mobile file chooser.

2. **Tablet (640px – 1024px)**:
   - The bottom drawer morphs into an elevated, centered modal card with rounded corners, backdrop blur, and dual touch/pointer support.
   - Active Drops table transitions from a vertical card list into a 2-column grid.

3. **Desktop (> 1024px / PC)**:
   - **Global Drag-and-Drop Radar Overlay**: Detects window drag events anywhere in the viewport with a cyber radar sweep animation.
   - **Sidebar Integration**: Primary desktop trigger located in the fixed left sidebar.
   - **Keyboard Ergonomics**: `Escape` key dismiss and clipboard paste staging.

4. **Typography & Styling**:
   - Maintain 100% aesthetic consistency with existing self-hosted fonts ([ADR-004](ADR-004-self-hosted-fonts.md)): `VT323` for cyber headings, `Silkscreen` for technical labels/badges, and standard system pixel font for body.
   - Cyberpunk palette: Neon Cyan (`#38bdf8`), Neon Purple (`#a78bfa`), Neon Green (`#22c55e`), and Neon Red (`#f43f5e`).

## Consequences
- Guarantees flawless mobile experience for primary daily-driver use on phones before scaling up to larger viewports.
- Eliminates layout breaks and horizontal overflow issues on narrow screens.
- Completely preserves visual parity and styling conventions across all cluster nodes.
