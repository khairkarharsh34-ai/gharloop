# Padosi — housing society community app

Expo (React Native + TypeScript + Expo Router) with Supabase. Runs as an Android/iOS app in Expo Go
and as a website that can be added to an iPhone's Home Screen.

## What's built so far

- **Foundation:** new design system (green + marigold), sign up, sign in, sign out, choose society and flat, Society Admin approval of new residents,
  role-aware Profile, Home grid, bottom tabs (Home, Resolve, Community, Activities, Profile).
- Other modules show a "Coming in the next update" page until they're built.

## Folder map

| Folder | What's inside |
|---|---|
| `app/` | Screens (one file per screen, Expo Router) |
| `components/` | Reusable UI pieces (Card, Pill, Button, Tile, Screen, states…) |
| `lib/api.ts` | Every database call |
| `lib/theme.ts` | Colours and sizes from the prototype |
| `supabase/` | SQL files to run in Supabase, in number order |
| `lib/modules.ts` | Module names, icons and colours |
| `reference/prototype.html` | Original feature prototype |

## One-time setup

### 1. Supabase (free)
1. Create a project at https://supabase.com (free plan).
2. **SQL Editor → New query →** paste all of `supabase/001_foundation.sql` **→ Run.**
3. **Authentication → Sign In / Providers → Email:** turn **off** "Confirm email" (easier for demos; turn it on later).
4. **Project Settings → API:** copy the **Project URL** and the **anon public** key.

### 2. Run on your phone (Expo Go)
```bash
npm install
```
Create a file called `.env` next to `package.json` (copy `.env.example`) and paste the two values.
```bash
npx expo start --tunnel
```
Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

### 3. Make yourself Super Admin
Sign up in the app, then in Supabase **SQL Editor** run (with your email):
```sql
update profiles set role = 'super_admin', status = 'approved'
where id = (select id from auth.users where email = 'you@example.com');
```
Pull down on the "Waiting for approval" screen to refresh.

### 4. Publish the web version (free, for iPhone)
1. Sign in at https://app.netlify.com with GitHub → **Add new site → Import an existing project** → pick this repo.
2. Netlify reads `netlify.toml` by itself. Before deploying, open **Site configuration → Environment variables**
   and add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Every push to `main` redeploys automatically.
4. On the iPhone: open the link in **Safari → Share → Add to Home Screen.**

Note: free Supabase projects pause after 7 days with no use. Open the dashboard and click **Restore** if that happens.
