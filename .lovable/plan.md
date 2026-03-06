

## Production List Mobile App

A dark-themed, mobile-first production management app inspired by the uploaded UI, featuring iOS 26-style liquid glass effects.

### Layout Structure

**1. Header (Scrollable with content)**
- Company logo image on the left
- Date display ("Minggu, 01 Maret 2026") on the right with a liquid glass pill — frosted glass effect (backdrop-blur, semi-transparent white fill, subtle glossy highlight), gray-toned with white text
- Header scrolls with content (not sticky)

**2. Content — Production Form**
- Title: "Buat daftar produksi baru" (mobile only)
- **PROD. DATE** — Date picker using a popover calendar, dark styled input
- **FACTORY** — Dropdown select with animated chevron (rotates up when open, down when closed)
- **MESIN** — Same animated dropdown style
- **SHIFT** — Same animated dropdown style
- All form inputs have dark backgrounds (#35393b-ish) with rounded corners and white text

**3. Bottom Navigation Bar (Fixed)**
- Dark navbar fixed at bottom with 3 options: **Beranda**, **SCAN**, **Profil**
- Active indicator: pill with color `#244951` and liquid glass effect, slides smoothly between Beranda and Profil with CSS transition
- **SCAN button** — Floating capsule above the navbar with full liquid glass effect:
  - Outer frosted glass capsule (backdrop-blur, translucent gradient, dual shadows for floating effect)
  - Inner blue gradient plate (#22A8F7 → #0491E3) with rounded square shape
  - Scanner SVG icon (white stroke square + center dash line)
  - Specular highlight ellipses for glossy realism
- Beranda is default active tab showing the production form
- Profile tab shows a placeholder profile page

### Design System
- Dark theme throughout (background ~#1a1d1f, cards ~#2b2f31, inputs ~#35393b)
- White text, rounded corners on all elements
- Liquid glass effects using `backdrop-filter: blur()` + translucent fills + subtle noise/highlights
- Mobile-first responsive design

### Pages & Navigation
- `/` — Beranda (home) with the production form
- Profile view (tab-based, no route change needed)
- Bottom nav manages tab switching with smooth slide animation

