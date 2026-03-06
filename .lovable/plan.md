

## Upgrade Scan Button to Enterprise Style

Based on the reference image and spec, the scan button needs to be significantly larger and bolder with a cleaner, more professional look.

### Changes to `ScanButton.tsx`
- **Outer capsule**: Increase to ~100px × 80px, border-radius 20px, subtle glass effect with `backdrop-filter: blur(16px)`, double-rim border effect, dual-layer shadow
- **Inner blue plate**: Increase to ~64px × 64px, border-radius 14px, updated gradient (`#2DB6FF` → `#1AA0F5` → `#0EA0F0`), subtle specular (toned down from current over-glossy)
- **Scanner icon**: Use corner-bracket style (4 L-shaped corners) instead of a full rounded rectangle — matching the reference image. Center dash for scan line. Size ~36px
- **Interaction states**: Add `transition` + `active:scale-[0.98]` + `hover:-translate-y-0.5` for press/hover feedback
- **Accessibility**: Add `aria-label="Scan QR / barcode"`, `role="button"`

### Changes to `BottomNav.tsx`
- Adjust the floating offset (`-top-7` or similar) to accommodate the larger button
- Update SCAN label styling: `font-semibold`, `text-[11px]`, `uppercase`, `tracking-wide`, matching spec typography

### Scanner Icon SVG (corner brackets style from reference)
Instead of a full `<rect>`, draw 4 corner L-shapes using `<path>` elements — this matches the reference image's scanner icon which shows open corners rather than a closed rectangle.

