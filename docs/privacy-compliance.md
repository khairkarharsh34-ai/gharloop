# Ghar Loop: privacy & consumer-law checklist (India)

Last reviewed: 22 November 2026. Laws: DPDP Act 2023 + DPDP Rules 2025 (notified Nov 2025, fully in force by May 2027),
CCPA dark-pattern guidelines 2023, RBI e-mandate rules, IT Rules 2021. This is a working checklist, not legal advice;
have a lawyer review before public launch.

## Audit

| Risk (max penalty) | Status in Ghar Loop |
|---|---|
| **Children's data without parental consent** (up to ₹200 cr) | ✅ Sign-up requires "I am 18 or older" + Privacy Notice consent, stored with date and notice version (`profiles.adult_confirmed`, `consent_version`, `consented_at`). Existing users must accept once (`app/consent.tsx`). Under-18s use a parent's account. |
| **Secret keys in frontend / weak security** (up to ₹250 cr) | ✅ Only the Supabase *publishable* key is in the app. No service-role key anywhere in the code. Row Level Security on every table; phone numbers readable only by their owner. ⚠️ Issue photos are in a public bucket with unguessable links; move to signed links before scale. |
| **No breach notice within 72 h** (up to ₹200 cr) | ✅ Plan below. |
| **Tracking / session replay without consent** (up to ₹50 cr) | ✅ None. No analytics, heatmaps, session replay or ad trackers in the app or website. If ever added: opt-in only, never record input fields. |
| **Notice & consent** | ✅ Plain-language Privacy Notice (`lib/legal.ts`, shown at `/module/privacy`, open without login). Website demo form has its own consent tick. |
| **Rights: access, correction, erasure, grievance, nomination** | ✅ Profile → Your data & privacy: download all data (JSON), delete account (removes login, profile, photos and linked records). Edit details in Profile. Grievance Officer: grievance@gharloop.com. Nomination by email. |
| **Storage limitation** | ✅ `purge_expired_data()` deletes visitor records > 180 days and resolved SOS > 1 year. Run monthly (see below). |
| **Dark patterns / hard-to-cancel subscriptions** (CCPA) | ✅ Not applicable yet: no subscriptions or auto-renewals. When society billing starts: cancel as easy as subscribe, no pre-ticked boxes, no fake urgency. |
| **Auto-debit without 24 h notice** (RBI) | ✅ Not applicable yet: no real payments ("Pay (test)" only). Any future auto-debit must use an RBI e-mandate with a pre-debit notice at least 24 h before every charge and one-tap opt-out. |
| **Grievance timelines** (IT Rules 2021) | ✅ Acknowledge in 24 h, resolve in 15 days (privacy requests within 90 days at most). |

## Breach response plan (72 hours)

1. **Hour 0–2: contain.** Rotate the Supabase keys (Settings → API), reset affected passwords, disable the leaking feature.
2. **Hour 0–24: assess.** What data, how many people, which societies, since when. Keep notes with times.
3. **Without delay: tell affected people** (in-app notice + SMS/email): what happened, what data, what we did, what they should do.
4. **Within 72 hours: report to the Data Protection Board of India** with the full details, cause, and steps taken.
5. **After:** fix the root cause, write a short post-mortem, update this checklist.

Owners: Tech co-founder (Harsh) runs steps 1–2 and 5; Founder (Akash) approves messages for steps 3–4.

## Monthly tasks
- Supabase → SQL Editor: `select public.purge_expired_data();`
- Delete website demo-form entries older than 1 year (Netlify → Forms).
- Check grievance@gharloop.com and reply within the timelines above.
