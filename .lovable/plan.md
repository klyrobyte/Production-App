

## Align SCAN Label & Reduce Button Offset

Two changes to `BottomNav.tsx`:

1. **Reduce top offset**: Change `-top-7` (28px) to `-top-4` (16px) so the scan button sits lower while still overflowing above the navbar.

2. **Align SCAN label with Beranda/Profil**: Move the "Scan" label outside the offset container so it sits at the same vertical position as the other labels. Restructure the scan section to use `flex flex-col items-center` with the button having a negative margin, and the label sitting in the normal flow aligned with siblings.

### File: `src/components/BottomNav.tsx`

Replace the scan section (lines 61-67) with a structure where:
- The wrapper uses `flex flex-col items-center` without the `-top-7` offset
- The `ScanButton` gets a `relative -top-4` to float upward
- The "SCAN" label stays in normal flow at the bottom, matching the vertical position of "Beranda" and "Profil" labels

