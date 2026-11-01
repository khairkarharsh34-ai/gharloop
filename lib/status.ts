// Label + colour for every status pill in the app.
import type { PillTone } from '@/components/Pill';
import type { ActivityStatus, Business, HelpStatus, IssueStatus, Priority, VisitorStatus } from './types';

type P = { label: string; tone: PillTone };

export const issueStatus: Record<IssueStatus, P> = {
  open: { label: 'Open', tone: 'red' },
  assigned: { label: 'Owner assigned', tone: 'gold' },
  in_progress: { label: 'In progress', tone: 'blue' },
  resolved: { label: 'Resolved', tone: 'green' },
};

export const priorityPill: Record<Priority, P> = {
  low: { label: 'Low', tone: 'grey' },
  medium: { label: 'Medium', tone: 'gold' },
  high: { label: 'High priority', tone: 'red' },
};

export const activityStatus: Record<ActivityStatus, P> = {
  live: { label: 'Open to join', tone: 'green' },
  pending: { label: 'Awaiting approval', tone: 'gold' },
  rejected: { label: 'Not approved', tone: 'red' },
  cancelled: { label: 'Cancelled', tone: 'grey' },
};

export const helpStatus: Record<HelpStatus, P> = {
  open: { label: 'Open', tone: 'red' },
  assigned: { label: 'Assigned', tone: 'gold' },
  done: { label: 'Done', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'grey' },
};

export const visitorStatus: Record<VisitorStatus, P> = {
  expected: { label: 'Expected', tone: 'blue' },
  inside: { label: 'Inside', tone: 'green' },
  left: { label: 'Left', tone: 'grey' },
  cancelled: { label: 'Cancelled', tone: 'grey' },
};

export const businessStatus: Record<Business['status'], P> = {
  pending: { label: 'Awaiting approval', tone: 'gold' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Not approved', tone: 'red' },
};
