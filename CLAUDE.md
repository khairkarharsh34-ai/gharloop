# Project: Padosi (housing society community app, India)

Android app for residents, guards and admins of a housing society.
Design reference: /reference/prototype.html (copy its look exactly).

## Stack
- Expo (React Native, TypeScript, Expo Router)
- Supabase: Auth (email + password), Postgres, Storage, Realtime, Row Level Security
- No custom server. Keys live in .env (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY). Never commit .env.

## Roles
resident, guard, society_admin, super_admin

## Design tokens
green #245c43, soft green #eaf3ed, ink #18211c, muted #69736b, background #f5f7f4,
card white with 1px #e3e8e3 border, 17px radius, pill badges, bottom tabs:
Home, Resolve, Community, Activities, Profile.

## Modules
Resolve (issues with owner, deadline, status, proof photo), Community (announcements,
RSVP, board, group chat), Activities (free instant, paid needs admin approval),
Services and Shops (contacts, resident businesses with FSSAI), Need Help, Funds,
Gate and Visitors (6-digit code, guard screen, SOS), Admin and Super Admin.

## Rules
- Small files, reusable components in /components, all DB calls in /lib/api.ts.
- Every screen: loading, empty and error states, pull-to-refresh.
- Real Supabase data only, no hardcoded mock lists.
- Payments are faked: a "Pay (test)" button records a row. No payment gateway.
- Work one module at a time. After each module, tell me how to test it on my phone in Expo Go.
- Explain every command I must run. Ask before installing anything extra.
- Budget is zero for services: free tiers only.
