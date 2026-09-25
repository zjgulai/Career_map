---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces. Use when building web components, pages, or applications to avoid generic AI aesthetics and make memorable UIs.
---

# Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

## Design Direction

Commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve?
- **Tone**: Pick an extreme: brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, soft, industrial
- **Differentiation**: What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute with precision.

## Typography

See [typography reference](reference/typography.md) for scales and pairing.

**DO**: Use a modular type scale with fluid sizing (clamp)
**DO**: Vary font weights and sizes for clear hierarchy
**DON'T**: Use overused fonts—Inter, Roboto, Arial, Open Sans
**DON'T**: Use monospace as lazy shorthand for "technical"

## Color & Theme

See [color reference](reference/color-and-contrast.md) for OKLCH and palettes.

**DO**: Use modern CSS color functions (oklch, color-mix, light-dark)
**DO**: Tint neutrals toward your brand hue
**DON'T**: Use gray text on colored backgrounds
**DON'T**: Use pure black (#000) or pure white (#fff)
**DON'T**: Use the AI palette: cyan-on-dark, purple-to-blue gradients, neon accents

## Layout & Space

See [spatial reference](reference/spatial-design.md) for grids and rhythm.

**DO**: Create visual rhythm through varied spacing
**DO**: Use fluid spacing with clamp()
**DO**: Use asymmetry and break the grid intentionally
**DON'T**: Wrap everything in cards
**DON'T**: Nest cards inside cards
**DON'T**: Center everything

## Visual Details

See [design details reference](reference/design-details.md) for comprehensive polish techniques.

**DO**: Use intentional, purposeful decorative elements
**DO**: Use box shadows instead of borders for separation (softer, more refined)
**DO**: Use background color differences between sections instead of dividers
**DO**: Use spacing to create grouping (Gestalt proximity) instead of wrapping in cards
**DO**: Use tinted neutrals (add 0.01 chroma of brand hue to all grays)
**DO**: De-emphasize secondary content by reducing color/weight, not hiding it
**DON'T**: Use glassmorphism everywhere
**DON'T**: Use rounded rectangles with generic drop shadows
**DON'T**: Use modals unless truly necessary
**DON'T**: Use thick, dark borders for content separation
**DON'T**: Rely solely on font-size for hierarchy—combine size, weight, color, spacing

## Motion & Micro-interactions

See [motion reference](reference/motion-design.md) for timing and easing.
See [design details reference](reference/design-details.md) for micro-interaction patterns.

**DO**: Use motion to convey state changes
**DO**: Use exponential easing (ease-out-quart/quint/expo)
**DO**: Provide immediate visual feedback for every user action (<100ms)
**DO**: Use skeleton screens instead of spinners for content loading
**DO**: Design all 5 states for interactive elements: default, hover, active, focus, disabled
**DO**: Use optimistic UI for low-stakes actions (likes, bookmarks, toggles)
**DON'T**: Animate layout properties (only transform + opacity)
**DON'T**: Use bounce or elastic easing—they feel dated
**DON'T**: Leave empty states blank—use them to educate and encourage action

## Polish Checklist

Before delivering any UI, verify these non-negotiable details:
- Squint test passes (clear visual hierarchy when blurred)
- All interactive elements have hover, active, focus, disabled states
- Empty, loading, and error states are designed with care
- Text contrast meets WCAG AA (4.5:1)
- Touch targets are ≥44px
- Animations respect `prefers-reduced-motion`
- Dark mode properly adapts surfaces, shadows, accents (not just inverted colors)
- Focus ring visible on keyboard navigation
- Spacing uses a consistent 4pt-based scale
- Error messages are human-friendly with clear next steps

## The AI Slop Test

**Critical check**: If someone said "AI made this," would they believe it immediately? If yes, that's the problem.

Review the DON'T guidelines—they are fingerprints of AI-generated work from 2024-2025.

## Implementation

Match complexity to aesthetic vision. Maximalist designs need elaborate code. Minimalist designs need restraint and precision.

Interpret creatively. Make unexpected choices. No design should be the same.
