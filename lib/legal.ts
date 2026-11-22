// Privacy notice and contacts (DPDP Act 2023 / DPDP Rules 2025). Plain language on purpose.
// Bump NOTICE_VERSION whenever the privacy notice changes: everyone is asked to accept it again.
export const NOTICE_VERSION = '2026-11';
export const NOTICE_DATE = '22 November 2026';
export const GRIEVANCE_EMAIL = 'grievance@gharloop.com';
export const MIN_AGE = 18;

export type Section = { title: string; points: string[] };

export const privacyNotice: Section[] = [
  {
    title: 'What we collect',
    points: [
      'Account: your name, mobile number or email, and password (stored encrypted).',
      'Home: your society, tower and flat.',
      'What you add: issues and photos, posts, chat messages, visitor passes, help requests, business listings and test payment records.',
      'Safety: SOS alerts you send.',
      'We do not use advertising trackers, session recording or analytics that follow you.',
    ],
  },
  {
    title: 'Why we use it',
    points: [
      'To run your society on Ghar Loop: verify you are a resident, show notices, track issues and let guards check in your visitors.',
      'To alert your guard and committee when you send an SOS.',
      'We use your data only for these purposes. We never sell it.',
    ],
  },
  {
    title: 'Who can see it',
    points: [
      'Verified residents of your society see your name and flat, and anything you post to the society.',
      'Your phone number is private. Neighbours cannot see it.',
      'Visitor passes: only you, the guards and your committee. SOS: only guards and committee.',
      'Our service providers store data for us under contract: Supabase (database) and Netlify (website hosting).',
    ],
  },
  {
    title: 'How long we keep it',
    points: [
      'While your account is active.',
      'Visitor records are deleted after 180 days; resolved SOS alerts after 1 year.',
      'When you delete your account, your data is erased. Official society notices and accounts entries stay without your name.',
    ],
  },
  {
    title: 'Your rights',
    points: [
      'See and download your data: Profile → Download my data.',
      'Correct it: Profile → Your details → Edit.',
      'Erase it: Profile → Delete my account. You can also withdraw consent this way.',
      'Nominate someone to use these rights for you if you cannot, by writing to our Grievance Officer.',
      'Complain to our Grievance Officer. If you are not satisfied, you can complain to the Data Protection Board of India.',
    ],
  },
  {
    title: 'Age',
    points: [`Ghar Loop accounts are for people aged ${MIN_AGE} or older. Children should use the app only through a parent's account.`],
  },
  {
    title: 'Security and breaches',
    points: [
      'Data is encrypted in transit, and access is limited by society and role.',
      'If a breach affects you, we will tell you and the Data Protection Board without delay, as the law requires.',
    ],
  },
];

export const grievanceSteps = [
  `Email our Grievance Officer at ${GRIEVANCE_EMAIL} with your name, society and the problem.`,
  'We acknowledge within 24 hours and resolve within 15 days (privacy requests: within 90 days at most).',
  'For society problems (lift, water, security), use Resolve so it gets an owner and a deadline.',
  'If you are not satisfied with our reply, you can complain to the Data Protection Board of India.',
];
