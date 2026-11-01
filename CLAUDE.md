# Project: Ghar Loop (housing society community app, India)

The product name is **Ghar Loop** everywhere users can see it. ("Padosi" was an early working name.)

Android app for residents, guards and admins of a housing society.
Design: Ghar Loop design system v2 (see `lib/theme.ts`). `reference/prototype.html` is the original
feature reference only; the visual design has moved on from it.

## Stack
- Expo (React Native, TypeScript, Expo Router)
- Supabase: Auth (email + password), Postgres, Storage, Realtime, Row Level Security
- No custom server. Keys live in .env (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY). Never commit .env.

## Roles
resident, guard, society_admin, super_admin

## Design system (v2)
- Colours: neem green #1d5c45 (primary), marigold #f2a33a (warm accent), cream background #f6f4ee,
  ink #16211c, muted #6e7a73, white cards with hairline #ece9e1 border + soft shadow.
- Font: Inter, loaded in app/_layout.tsx. Use `...font('700')` from lib/theme, never fontWeight
  (Android needs one font file per weight).
- Icons: Ionicons line icons via components/Icon.tsx (outline normally, filled when active). No emoji icons.
- Shapes: 20px card radius, 14px buttons/inputs, pill badges, 50px tall buttons.
- Each module has its own pastel tint (`tints` in lib/theme.ts) used for its icon chip.
- Big bold page titles (30px), green hero panel with soft circles on Home and login screens.
- Logo: marigold rounded square with "घ" + "ghar" white / "loop" marigold wordmark (components/Logo.tsx).
- Bottom tabs: Home, Resolve, Community, Activities, Profile (active tab = soft green pill).
- Module list (icons, tints, copy) lives in lib/modules.ts.

## Modules
Resolve (issues with owner, deadline, status, proof photo), Community (announcements,
RSVP, board, group chat), Activities (free instant, paid needs admin approval),
Services and Shops (contacts, resident businesses with FSSAI), Need Help, Funds,
Gate and Visitors (6-digit code, guard screen, SOS), Admin and Super Admin.

## Rules
- Small files, reusable components in /components. All DB calls go through /lib/api.ts, which re-exports
  one file per module from /lib/api/ (client.ts has the shared helpers).
- Database changes go in a new numbered file in /supabase (001, 002, …). Never edit one that has been run.
- Every screen: loading, empty and error states, pull-to-refresh.
- Real Supabase data only, no hardcoded mock lists.
- Payments are faked: a "Pay (test)" button records a row. No payment gateway.
- Work one module at a time. After each module, tell me how to test it (live web link and Expo Go).
- Explain every command I must run. Ask before installing anything extra.
- Budget is zero for services: free tiers only.
