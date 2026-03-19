
export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated'
}

export enum EmployeePosition {
  MOVER = 'Mover',
  DRIVER = 'Driver',
  CREW_LEAD = 'Crew Lead'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  profilePic?: string;
  notificationsEnabled?: boolean;
}

export interface EmployeeProfile extends User {
  position: EmployeePosition;
  hireDate: string;
  phone: string;
  adminNotes?: string;
  totalPoints?: number; // Calculated field
}

export interface PointsTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  points: number;
  category: string;
  notes: string;
  adminId: string;
  createdAt: string;
}

export interface UserNote {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  type: 'note' | 'idea';
  isPublic: boolean;
  createdAt: string;
  color?: string;
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined'
}

export interface PointRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  points: number;
  category: string;
  notes: string;
  status: RequestStatus;
  createdAt: string;
  processedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  status: 'active' | 'inactive';
  couponCode?: string;
  howToUse?: string;
}

export enum RedemptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied'
}

export interface RewardRedemption {
  id: string;
  employeeId: string;
  employeeName: string;
  rewardId: string;
  rewardName: string;
  pointsValue: number;
  status: RedemptionStatus;
  dateRequested: string;
  dateApproved?: string;
}

export interface Contest {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  criteriaType: 'points' | 'category_count';
  categoryFilter?: string;
  prizeType: 'points' | 'reward';
  prizeValue: number;
  assignedEmployeeIds: string[];
  status: 'active' | 'completed';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  monthlyPoints: number;
  lifetimePoints: number;
  position: EmployeePosition;
}
