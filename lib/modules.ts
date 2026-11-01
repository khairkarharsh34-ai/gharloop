import type { Href } from 'expo-router';
import type { Tint } from './theme';

export type ModuleInfo = {
  key: string;
  icon: string;
  tint: Tint;
  title: string;
  subtitle: string;
  tagline: string;
  href: Href;
  /** What the module will do — shown on its "coming soon" page. */
  points: string[];
};

// One list drives the Home grid, the tab pages and the placeholder pages.
export const modules: ModuleInfo[] = [
  {
    key: 'resolve', icon: '🛠️', tint: 'blue', title: 'Resolve', subtitle: 'Issues with an owner & deadline',
    tagline: 'One issue, one owner, one deadline, one visible status.', href: '/resolve',
    points: ['Report a problem with a photo', 'Every issue gets an owner and a due date', 'Closed only with proof of the fix'],
  },
  {
    key: 'community', icon: '💬', tint: 'purple', title: 'Community', subtitle: 'Notices, chats & board',
    tagline: 'Everything important, without 200-message WhatsApp threads.', href: '/community',
    points: ['Announcements with RSVP', 'Group chats for towers and interests', 'A board to ask, lend and recommend'],
  },
  {
    key: 'activities', icon: '🎯', tint: 'orange', title: 'Activities', subtitle: 'Yoga, sports & workshops',
    tagline: 'Community-led first. Join in one tap.', href: '/activities',
    points: ['Free activities go live instantly', 'Paid ones are checked by an admin first', 'See who else is joining'],
  },
  {
    key: 'services', icon: '🧺', tint: 'teal', title: 'Services & Shops', subtitle: 'Trusted help & home businesses',
    tagline: 'Help your neighbours actually use.', href: '/module/services',
    points: ['Maids, cooks, plumbers recommended by neighbours', 'Resident businesses with FSSAI details', 'Save and call contacts'],
  },
  {
    key: 'needhelp', icon: '🙋', tint: 'rose', title: 'Need Help', subtitle: 'Ask for a service',
    tagline: 'Tell us what you need. We route it and track it.', href: '/module/needhelp',
    points: ['Plumbing, electrical, cleaning and more', 'Pick today, tomorrow or flexible', 'Track status until it is done'],
  },
  {
    key: 'funds', icon: '📊', tint: 'gold', title: 'Funds', subtitle: 'Where maintenance goes',
    tagline: 'Visibility creates accountability — not blame.', href: '/module/funds',
    points: ['Balance, collections and spending', 'Every expense with an approver', 'Pay maintenance (test mode)'],
  },
];

export const gate: ModuleInfo = {
  key: 'gate', icon: '🚪', tint: 'slate', title: 'Gate & Visitors', subtitle: 'Pre-approve & SOS',
  tagline: 'Pre-approve guests and reach security fast.', href: '/module/gate',
  points: ['6-digit entry code for each visitor', 'Guard sees who is expected', 'SOS alerts the guard and admin instantly'],
};
