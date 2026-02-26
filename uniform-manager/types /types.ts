export type RequestStatus = "REQUESTED" | "DISPATCHED" | "ARRIVED" | "COLLECTED";

export type RequestRow = {
  id: string;
  staffName: string;
  staffRole?: string | null;
  uniformItem: string;
  quantity: number;
  status: RequestStatus;
  requestedAt: string;
  lowStock?: boolean;
  onCooldown?: boolean;
};

export type StaffOption = {
  id: string;
  name: string;
  roleName?: string | null;
  roleId?: string | null;
  lastRequestDate?: string | null;
};

export type UniformItemOption = {
  id: string;
  name: string;
  size?: string | null;
  stockOnHand?: number;
  lowStock?: boolean;
};

export type RoleLimit = {
  role: string;
  maxItemsPerPeriod: number;
  periodMonths: number;
  cooldownDays: number;
};

export type RoleSettingsRow = {
  id: string;
  roleName: string;
  uniformLimit: number;
  cooldownDays: number;
};

