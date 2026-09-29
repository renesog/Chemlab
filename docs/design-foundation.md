# Phase 1 — shared UI foundation

Direction: a compact Thai science workspace. The signature is a slim navy navigation bar with a restrained cyan rule, neutral workspace surfaces, and flatter controls. Color communicates actions and status; it does not frame every section.

- Audience: teachers managing activities and students working through experiments.
- Typography: Thai-capable system stack, 16px body/input text, 1.65 body leading, 1.4 heading leading. No remote font dependency.
- Spacing: 4px-based semantic scale, shared gutters, 44px controls, modest 4–8px radii.
- Surfaces: neutral borders, shadow-free panels, nested shared panels become sections with dividers.
- Motion: short control-state transitions; no decorative shell pulse or wobble; reduced-motion support.
- Navigation: actual Next.js links, explicit current-page/current-step semantics, skip-to-content focus target; safe-area-aware mobile navigation.
- Status: icon plus text or accessible name. Browser network availability is labelled online/offline, not proof of realtime server connectivity.

## Ownership and compatibility

`app/design-tokens.css` owns the palette and dimensions. Existing `--navy`, `--cyan`, `--line` and other legacy properties alias semantic tokens. Tailwind semantic colors are mapped in `globals.css`.

`app/foundation.css` loads after existing styles and adapts shared classes and shadcn data slots. Feature-specific cards, grids, tools, seats and game animations remain feature-owned. This phase does not change page composition or homogenize every feature heading.

Use `StatusIndicator` for labelled status and `NavigationLink` for shared navigation. Existing button/input APIs and classes remain compatible. Supabase is not present in the current application data path: the existing Firebase implementation remains untouched.

## Validation

Installed Next.js 16.2.6 passes the skill's stated CVE version gate. No targeted external inspiration was required.

Run `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `npm.cmd test`, and `npm.cmd run build`. Full lint currently has pre-existing explicit-any errors in `lib/firebase/admin.ts` and six unused-variable warnings; changed UI files pass scoped lint. Generated Firebase/dist output and the downloaded skill copy are excluded from lint, not application code.

An existing test fixture was missing required desk coordinates; only that fixture received x/y values. No production game code changed.

Browser inventory is empty in this session, so visual verification at 320/375/768/1440px, 200% zoom, keyboard navigation, focus on mobile, and dialog coexistence remain pending. Compilation and static CSS review do not establish visual QA.
