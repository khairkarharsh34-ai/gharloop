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

export type JoinRequest = Pick<Profile, 'id' | 'full_name' | 'phone' | 'tower' | 'flat' | 'created_at'> & {
  society: Pick<Society, 'name'> | null;
};

export const roleLabel: Record<Role, string> = {
  resident: 'Resident',
  guard: 'Guard',
  society_admin: 'Society Admin',
  super_admin: 'Super Admin',
};

export const isAdmin = (role?: Role) => role === 'society_admin' || role === 'super_admin';
