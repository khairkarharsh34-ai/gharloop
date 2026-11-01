export type Role = 'resident' | 'guard' | 'society_admin' | 'super_admin';
export type MemberStatus = 'pending' | 'approved' | 'rejected';

export type Society = {
  id: string;
  name: string;
  city: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  society_id: string | null;
  tower: string | null;
  flat: string | null;
  role: Role;
  status: MemberStatus;
  created_at: string;
  society: Society | null;
};

export type JoinRequest = Pick<Profile, 'id' | 'full_name' | 'tower' | 'flat' | 'created_at'> & {
  society: Pick<Society, 'name'> | null;
};

export const roleLabel: Record<Role, string> = {
  resident: 'Resident',
  guard: 'Guard',
  society_admin: 'Society Admin',
  super_admin: 'Super Admin',
};

export const isAdmin = (role?: Role) => role === 'society_admin' || role === 'super_admin';
export const isGuardOrAdmin = (role?: Role) => role === 'guard' || isAdmin(role);

/** Name + flat shown next to anything a neighbour created. */
export type Person = { full_name: string; tower: string | null; flat: string | null } | null;

// ---------- Resolve ----------
export type IssueStatus = 'open' | 'assigned' | 'in_progress' | 'resolved';
export type Priority = 'low' | 'medium' | 'high';
export type Issue = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: Priority;
  status: IssueStatus;
  owner_name: string | null;
  due_date: string | null;
  photo_url: string | null;
  proof_url: string | null;
  created_at: string;
  resolved_at: string | null;
  created_by: string;
  author: Person;
};
export type IssueUpdate = { id: string; note: string; created_at: string; author: Person };

// ---------- Community ----------
export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  event_at: string | null;
  location: string | null;
  created_at: string;
  author: Person;
  rsvps: { user_id: string }[];
};
export type BoardKind = 'ask' | 'lend' | 'recommend' | 'general';
export type BoardPost = { id: string; kind: BoardKind; body: string; created_at: string; author_id: string; author: Person };
export type ChatGroup = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  messages: { body: string; created_at: string }[];
};
export type Message = { id: string; body: string; created_at: string; author_id: string; author: Person };

// ---------- Activities ----------
export type ActivityStatus = 'live' | 'pending' | 'rejected' | 'cancelled';
export type Activity = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
  capacity: number | null;
  price: number;
  status: ActivityStatus;
  created_by: string;
  author: Person;
  activity_joins: { user_id: string }[];
};

// ---------- Services ----------
export type Contact = { id: string; name: string; service: string; phone: string; note: string | null; added_by: string; author: Person };
export type Business = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  is_food: boolean;
  fssai: string | null;
  status: 'pending' | 'approved' | 'rejected';
  owner_id: string;
  owner: Person;
};

// ---------- Need help ----------
export type HelpStatus = 'open' | 'assigned' | 'done' | 'cancelled';
export type HelpRequest = {
  id: string;
  category: string;
  details: string;
  preferred: 'today' | 'tomorrow' | 'flexible';
  status: HelpStatus;
  assigned_to: string | null;
  created_at: string;
  user_id: string;
  requester: Person;
};

// ---------- Funds ----------
export type FundEntry = {
  id: string;
  kind: 'income' | 'expense';
  category: string;
  amount: number;
  note: string | null;
  entry_date: string;
};

// ---------- Gate ----------
export type VisitorStatus = 'expected' | 'inside' | 'left' | 'cancelled';
export type Visitor = {
  id: string;
  name: string;
  purpose: 'guest' | 'delivery' | 'service' | 'cab' | 'other';
  expected_at: string;
  code: string;
  status: VisitorStatus;
  entered_at: string | null;
  left_at: string | null;
  resident: Person;
};
export type SosAlert = { id: string; note: string | null; status: 'active' | 'resolved'; created_at: string; user_id: string; person: Person };
