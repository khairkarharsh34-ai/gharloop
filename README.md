# Ghar Loop — housing society community app

Expo (React Native + TypeScript + Expo Router) with Supabase. Runs as an Android/iOS app in Expo Go
and as a website that can be added to an iPhone's Home Screen.

## What's built

| Module | What works |
|---|---|
| Accounts | Sign up / sign in with **mobile number or email** + password (free, no SMS), forgot/reset password, admin can set a temporary password, society join requests approved by the Society Admin |
| Home | Greeting, quick actions (role-aware), module grid, live "This week" feed |
| Resolve | Report issues with photo, owner + deadline, status timeline, comments, close only with proof photo |
| Community | Notices with RSVP, neighbour board (ask/lend/recommend), live group chats |
| Activities | Free (instant) and paid (admin approval), capacity, join, **Pay (test)** |
| Services & Shops | Neighbour-shared contacts (hidden numbers), home businesses with FSSAI check + approval |
| Need Help | 12 service categories, requests tracked to done, admin assigns |
| Funds | Balance, monthly collected/spent, spending breakdown, ledger, maintenance **Pay (test)** |
| Gate & SOS | Visitor passes with 6-digit codes, guard desk (verify/check-in/out, live), two-step SOS with live red banner |
| Admin | Stats, approvals (residents, paid activities, businesses), members & roles (guard/admin) |
| Super Admin | All societies, create a society |

## Folder map

| Folder | What's inside |
|---|---|
| `app/` | Screens (one file per screen, Expo Router) |
| `components/` | Reusable UI pieces |
| `lib/api.ts` + `lib/api/` | Every database call, one file per module |
| `lib/theme.ts` | Colours, font helper, shadows |
| `lib/modules.ts`, `lib/categories.ts`, `lib/status.ts` | Module list, choice lists, status labels |
| `supabase/` | SQL files to run in Supabase, in number order |

## Database setup (Supabase → SQL Editor → New query → paste → Run), in order

1. `supabase/001_foundation.sql`: societies, profiles, roles, security
2. `supabase/002_modules.sql`: every module, photo storage, live updates, phone privacy
3. `supabase/003_demo_data.sql`: optional demo neighbours and content for "Green Valley Heights"
4. `supabase/004_mobile_login.sql`: lets admins set a temporary password (for mobile-number accounts)

Mobile login is free: a number like 9876543210 signs in behind the scenes as `9876543210@m.gharloop.com`
(email confirmation must stay off). No SMS is sent, so the number is not verified; admin approval covers that.

Demo logins created by 003 (password `GharLoop@2026`):

| Email | Role |
|---|---|
| admin@demo.gharloop.app | Society Admin (Suresh, treasurer) |
| guard@demo.gharloop.app | Guard (gate desk) |
| priya@demo.gharloop.app | Resident A-302 |
| rohan@demo.gharloop.app | Resident B-904 |

## Supabase settings

- **Authentication → Sign In / Providers → Email:** "Confirm email" off for demos.
- **Authentication → URL Configuration:** Site URL = your Netlify link; add `https://YOUR-SITE.netlify.app/**` to Redirect URLs (needed for password reset emails).

## Run on your phone (Expo Go)

```bash
npm install
```
Copy `.env.example` to `.env` and add your Supabase URL and anon/publishable key.
```bash
npx expo start --tunnel
```

## Web (Netlify)

Netlify builds from `netlify.toml`. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
in Netlify's environment variables. Every push to `main` redeploys.

Note: free Supabase projects pause after 7 days without use; click **Restore** in the dashboard.
