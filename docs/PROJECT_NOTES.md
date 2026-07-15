# ClearVision — Project Notes

## Overview

ClearVision is a browser-based image enhancement tool built with three files:

| File | Role |
|------|------|
| `index.html` | Page structure — layout, upload box, strength selector, algorithm pipeline list, preview area, and stats display. |
| `style.css` | Visual styling — colors, spacing, card layouts, toggle switches, responsive behavior. |
| `script.js` | Application logic — image loading, running the enhancement algorithms on the canvas, comparison slider, and downloading the result. |

The entire enhancement pipeline runs **client-side** using the HTML5 Canvas API (`getImageData` / `putImageData`), so no image is ever uploaded to a server — everything happens locally in the browser.

---

## How the Pipeline Works

When the user clicks **Enhance Image**, the uploaded image is drawn onto a hidden canvas. The four algorithms below are then applied **in sequence**, each one operating on the pixel data (`Uint8ClampedArray`) produced by the previous step. The order is fixed: **Denoising → Contrast → Sharpening → Colour**, since each stage assumes a cleaner or better-prepared image from the one before it.

The **Enhancement Strength** (Light / Medium / Max) controls how aggressively the Sharpening and Colour stages are applied, by scaling their internal parameters.

---

## Stage 1 — Denoising: Bilateral Filter

**Goal:** Remove sensor noise/graininess from the image *without* blurring edges (unlike a simple Gaussian blur, which softens edges too).

**How it works:**
- For every pixel, it looks at a small neighborhood around it (radius = 2 pixels).
- Each neighboring pixel is given a weight based on **two factors**:
  1. **Spatial closeness** — how physically near it is to the center pixel.
  2. **Colour similarity** — how similar its colour is to the center pixel.
- Pixels that are spatially close *and* similar in colour contribute more to the final averaged value; pixels that differ a lot in colour (likely an edge) are given very little weight.
- This way, flat/noisy regions get smoothed out, but sharp edges (like the boundary between a face and background) are preserved.

**Why it's first:** Removing noise before sharpening prevents the later Unsharp Masking step from amplifying noise into visible artifacts.

---

## Stage 2 — Contrast: CLAHE (Contrast Limited Adaptive Histogram Equalization)

**Goal:** Improve local contrast so details in both shadows and highlights become visible, without over-brightening the whole image.

**How it works:**
- The image's brightness channel (luminance) is computed for every pixel.
- The image is divided into small tiles (32×32 pixels in this implementation).
- For each tile, a **histogram** of brightness values is built, and histogram equalization is applied *locally* to that tile — spreading out brightness values so dark/light areas within that small region gain more contrast.
- A **clip limit** prevents any single brightness value from dominating (this avoids the harsh, over-contrasted look of plain histogram equalization).
- Because this is done tile-by-tile instead of on the whole image at once, it's called *adaptive* — different areas of the photo (e.g., a bright sky vs. a shadowed face) get contrast improvements suited to their own local brightness range.
- The final image is smoothly blended between neighboring tiles to avoid visible tile borders.

**Why it's second:** Adjusting contrast on a denoised image avoids exaggerating noise that would otherwise get amplified by the local contrast boost.

---

## Stage 3 — Sharpening: Unsharp Masking (USM)

**Goal:** Make edges and fine details look crisper and more defined.

**How it works:**
- A blurred (Gaussian-smoothed) copy of the current image is created.
- The difference between the **original** pixel value and the **blurred** pixel value at each point represents the "edge" or fine detail information (since blurring removes fine detail, what's "lost" in the blur is the detail itself).
- This difference is added *back* to the original image, scaled by an **amount** factor:
  - Light strength → amount = 0.30 (subtle sharpening)
  - Medium strength → amount = 0.45
  - Max strength → amount = 0.60 (strong sharpening)
- This makes edges more pronounced because pixels on the brighter side of an edge get pushed brighter, and pixels on the darker side get pushed darker — increasing local contrast right at edges.

**Why it's third:** Sharpening after denoising and contrast correction ensures the algorithm enhances real detail rather than noise or artifacts from earlier stages.

---

## Stage 4 — Colour: Saturation Boost (HSL-based)

**Goal:** Make colours look richer and more vivid.

**How it works:**
- Each pixel's RGB colour is converted into the **HSL** (Hue, Saturation, Lightness) colour model.
- The **Saturation** component is multiplied by a boost factor:
  - Light strength → ×1.10
  - Medium strength → ×1.18
  - Max strength → ×1.28
- Hue and Lightness are left unchanged, so colours become more vivid without shifting their actual tone or brightness.
- The adjusted HSL value is converted back into RGB for display.

**Why it's last:** Colour enhancement is a purely cosmetic final touch, best applied after the image's structure (noise, contrast, sharpness) has already been corrected.

---

## Enhancement Strength (Light / Medium / Max)

This setting doesn't change *which* algorithms run — it changes *how strongly* the Sharpening and Colour stages are applied, by scaling the `amount` (USM) and saturation multiplier described above. Denoising (Bilateral) and Contrast (CLAHE) intensities stay constant regardless of the selected strength.

## Blending Step

After all selected algorithms run, the final result is blended slightly with the original image (a small percentage of the original is mixed back in). This softens the cumulative effect so that using many algorithms together doesn't look overly artificial, while still preserving the visible improvement.

---

## Summary Table

| Stage | Algorithm | Fixes | Key Parameter |
|-------|-----------|-------|----------------|
| 1 | Bilateral Filter | Noise / graininess | Spatial radius, colour similarity threshold |
| 2 | CLAHE | Poor/uneven contrast | Tile size, clip limit |
| 3 | Unsharp Masking | Soft/blurry edges | Sharpening amount (varies by strength) |
| 4 | Saturation Boost | Dull colours | Saturation multiplier (varies by strength) |
