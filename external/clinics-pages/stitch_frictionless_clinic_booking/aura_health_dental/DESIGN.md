# Design System Document: Clinical Precision & Curated Care

## 1. Overview & Creative North Star: "The Clinical Atelier"
The Creative North Star for this design system is **"The Clinical Atelier."** In high-end healthcare, we must balance the sterile precision of science with the warmth of boutique hospitality. We move away from the "industrial hospital" aesthetic (cluttered grids, harsh blue borders, and heavy shadows) toward an editorial, intentional experience.

This system breaks the traditional medical template by using **intentional asymmetry** and **tonal depth**. We treat the digital interface as a series of physical layers—like stacked sheets of frosted glass—to create a sense of calm and organized breathing room. The goal is to make the patient feel cared for before they even step into the clinic.

---

## 2. Colors: Tonal Atmosphere
We rely on a sophisticated palette of deep teals (`primary`), serene blues (`secondary`), and luminous whites.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   **Example:** A `surface-container-low` section sitting on a `surface` background creates a soft, sophisticated edge without the visual noise of a line.

### Surface Hierarchy & Nesting
Use the `surface-container` tiers to create depth. Instead of a flat grid, treat the UI as a series of nested layers:
*   **Surface (Base):** `#f3faff` (The canvas).
*   **Surface-Container-Low:** `#e6f6ff` (Subtle sectioning).
*   **Surface-Container-Highest:** `#cfe6f2` (Prominent interactive zones).

### The "Glass & Gradient" Rule
To elevate the experience beyond "standard medical," use **Glassmorphism** for floating elements (e.g., appointment cards, navigation bars).
*   **Implementation:** Use semi-transparent `surface` colors with a `backdrop-filter: blur(20px)`.
*   **Signature Textures:** Apply subtle linear gradients (from `primary` `#003b42` to `primary_container` `#00545c`) for primary CTAs to provide a "jewel-toned" depth that feels premium.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to create a high-contrast, professional hierarchy.

*   **Display-LG (Manrope, 3.5rem):** Reserved for hero messaging. Use tracking of -0.02em to feel more "tight" and high-end.
*   **Headline-SM (Manrope, 1.5rem):** Used for section titles. Ensure generous line-height (1.4) to maintain the minimalist feel.
*   **Body-LG (Inter, 1rem):** The standard for patient information. Inter’s high x-height ensures readability even in complex medical descriptions.
*   **Label-MD (Inter, 0.75rem, All Caps):** Used for "Overlines" or small metadata. Increase letter spacing to 0.05em for a sophisticated, technical look.

---

## 4. Elevation & Depth: The Layering Principle
We convey hierarchy through **Tonal Layering** rather than traditional structural lines or heavy drop shadows.

*   **Natural Stacking:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift.
*   **Ambient Shadows:** For floating modals or primary buttons, use extra-diffused shadows.
    *   *Shadow Recipe:* `0px 10px 30px rgba(7, 30, 39, 0.06)` (A tint of the `on-surface` color).
*   **The "Ghost Border" Fallback:** If a boundary is essential for accessibility, use the `outline_variant` (#c3c6d4) at **15% opacity**. Never use 100% opaque borders.
*   **Glassmorphism Depth:** Elements using `surface_variant` at 70% opacity with a blur allow the background "trust blues" to bleed through, softening the layout's edges.

---

## 5. Components: Refined Utility

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Corner radius: `xl` (1.5rem). No border.
*   **Secondary:** `secondary_fixed` background with `on_secondary_fixed` text.
*   **States:** On hover, shift the gradient intensity rather than darkening the color to maintain a "glow."

### Cards & Lists
*   **Forbidden:** Divider lines between list items.
*   **Alternative:** Use 24px of vertical whitespace or a subtle background shift to `surface-container-low` on hover. Cards should use the `lg` (1rem) or `xl` (1.5rem) corner radius to feel approachable.

### Input Fields
*   **Style:** `surface_container_lowest` backgrounds with a "Ghost Border."
*   **Focus State:** Instead of a thick border, use a 2px outer glow of `primary_fixed` (#92f1fe).

### Signature Component: The "Care-Card"
A bespoke component for doctor profiles or service summaries.
*   **Structure:** An asymmetrical layout where the image overlaps the container edge by 16px, using `surface_bright` as the card base and a `tertiary_fixed` (#ffdf9e) accent for "Availability" chips.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Negative Space:** If a section feels crowded, add 32px of space rather than adding a border.
*   **Use Asymmetry:** Place hero text to the left and float a "Glass" appointment card partially off the grid to the right.
*   **Mix Tones:** Use `tertiary` (gold/amber) sparingly—only for urgent CTAs or "Premium" service indicators.

### Don't:
*   **Don't use Pure Black:** Always use `on_surface` (#071e27) for text to maintain a soft, professional slate tone.
*   **Don't use Sharp Corners:** Avoid the `none` or `sm` roundedness tokens. Healthcare should feel "rounded" and safe; stick to `lg` and `xl`.
*   **Don't use Standard Dividers:** If you feel the need to separate content, ask yourself if a background color shift to `surface_dim` would work instead.