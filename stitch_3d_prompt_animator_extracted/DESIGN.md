---
name: Tech-Noir Investigative System
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3b3742'
  surface-container-lowest: '#0f0d15'
  surface-container-low: '#1d1a23'
  surface-container: '#211e27'
  surface-container-high: '#2c2832'
  surface-container-highest: '#37333d'
  on-surface: '#e7e0ed'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e7e0ed'
  inverse-on-surface: '#322f39'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb869'
  on-tertiary: '#482900'
  tertiary-container: '#ca801e'
  on-tertiary-container: '#3f2300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#15121b'
  on-background: '#e7e0ed'
  surface-variant: '#37333d'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is built upon a "Tech-Noir" investigative aesthetic, evoking the feeling of a high-stakes digital forensics lab. The brand personality is clinical, analytical, and sophisticated, designed for power users who need to dissect complex data with precision.

The visual style merges **Minimalism** with **Glassmorphism**. High-density information is balanced by expansive, deep-space voids. Interaction points are highlighted with vibrant neon glows, suggesting "active energy" within a cold, dark environment. The emotional response should be one of focused authority and digital mastery.

## Colors

This design system utilizes a "Void-Plus" palette. The foundation is `#050505`, a deep near-black that provides infinite depth. 

- **Primary & Secondary:** A high-vibrancy gradient from Violet (`#8b5cf6`) to Blue (`#3b82f6`) is reserved for critical actions, active states, and data highlights.
- **Borders:** A consistent `#262626` is used to define structure without breaking the dark immersion.
- **Glass Surfaces:** Semi-transparent neutrals are used for layering, allowing background glows to bleed through subtly.
- **Success/Error:** Use specialized shifts of the primary palette—electric cyan for success, and a deep magenta-red for alerts.

## Typography

The typographic system prioritizes legibility in low-light environments. 

1.  **Geist** is used for headings to provide a technical, modern edge with its slightly condensed and sharp apertures.
2.  **Inter** serves as the workhorse for body copy, ensuring maximum readability for long-form forensic reports and data logs.
3.  **JetBrains Mono** is employed for labels, metadata, and technical "readouts" to reinforce the investigative, tool-based nature of the interface.

All text should maintain high contrast against the dark background, primarily using pure white or high-purity silver for primary content.

## Layout & Spacing

This design system follows a **Fluid Grid** model with a strictly enforced 4px baseline. 

- **Desktop:** 12-column layout with 24px gutters. Use wide margins (up to 80px) to maintain the minimalist, cinematic feel.
- **Tablet:** 8-column layout with 16px gutters.
- **Mobile:** 4-column layout with 16px gutters and side margins.

Information density should be high within components, but component containers should be separated by generous whitespace (`xl` spacing) to prevent the "noir" aesthetic from feeling cluttered or claustrophobic.

## Elevation & Depth

Depth is conveyed through transparency and light rather than shadows. 

- **Backdrop Blur:** Use a `20px` to `40px` blur on all floating panels or cards to create a "glass" effect over background elements.
- **Outer Glows:** Instead of drop shadows, use subtle, low-opacity colored glows (using the primary blue/purple) for "active" or "hovered" elements.
- **Inner Borders:** High-elevation elements (modals, dropdowns) should feature a `1px` semi-transparent top border (linear-gradient white to transparent) to simulate a light source catching the edge of the glass.
- **Z-Indexing:** 
    - Level 0: Pure background (#050505)
    - Level 1: Flat content areas (#0a0a0a)
    - Level 2: Cards and Glass components
    - Level 3: Overlays and Tooltips

## Shapes

The shape language is "Soft-Technical." Sharp corners feel too aggressive for a professional tool, while overly rounded pills feel too consumer-facing. 

A uniform `0.25rem` (4px) corner radius is the standard for almost all containers. This maintains a crisp, architectural feel. Circular shapes are reserved strictly for status indicators (LED style) and user avatars.

## Components

- **Buttons:** Primary buttons use the purple-to-blue gradient with white text. Secondary buttons use a transparent background with a `#262626` border and a subtle hover glow.
- **Input Fields:** Darker than the background (`#000000`), featuring a `1px` border. On focus, the border transitions to the primary gradient and a 2px outer blue glow is applied.
- **Glass Cards:** The signature component. These use `rgba(23, 23, 23, 0.6)` with a `backdrop-filter: blur(20px)`.
- **Chips/Badges:** Small, technical tags using `JetBrains Mono`. They should use low-opacity versions of the primary colors (e.g., 10% blue background with 100% blue text).
- **Data Lists:** Use alternating row highlights with `0.5%` white opacity. Borders should be horizontal only to emphasize the linear flow of investigative data.
- **Forensic Scanlines:** A decorative element—a subtle, horizontal 1px line that occasionally "sweeps" down the UI to reinforce the investigative theme.