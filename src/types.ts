export type UserRole =
  | 'resident'
  | 'rwa_admin'
  | 'water_worker'
  | 'electrical_worker'
  | 'sanitation_worker'
  | 'maintenance_worker'
  | 'security_guard';

export type Department = 'Water' | 'Electrical' | 'Sanitation' | 'Maintenance' | 'Security';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type IssueStatus =
  | 'Submitted'
  | 'Received'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Resident'
  | 'Resolved'
  | 'Closed'
  | 'Reopened'
  | 'Duplicate';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department;
  flatNumber?: string;
  block?: string;
  phone?: string;
  verified: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected';
  residentType?: 'Owner' | 'Tenant' | 'Family';
  proofDocumentUrl?: string;
  rejectionReason?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  block: string;
  flatNumber: string;
  residentType: 'Owner' | 'Tenant' | 'Family';
  proofDocumentUrl: string;
  documentType: 'Electricity Bill' | 'Rent Agreement' | 'Property Deed' | 'Utility Bill';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface PreApprovedVisitor {
  id: string;
  residentId: string;
  residentName: string;
  flatNumber: string;
  block: string;
  visitorName: string;
  visitorType: VisitorType;
  phone: string;
  vehicleNumber?: string;
  validityType: 'Daily / Recurring' | 'Today Only' | 'Custom Date';
  validUntil: string;
  passcode: string; // 4-digit fast-entry code
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternal: boolean; // internal authority notes hidden from resident
  photoUrl?: string;
  createdAt: string;
}

export interface IssueActivity {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  department: Department;
  issueType: string;
  priority: Priority;
  status: IssueStatus;
  block: string;
  flatNumber?: string;
  locationDetails: string;
  reporterId: string;
  reporterName: string;
  reporterFlat?: string;
  assignedTo?: string; // worker uid
  assignedWorkerName?: string;
  photoUrl?: string;
  proofPhotoUrl?: string;
  aiConfidence?: number;
  aiSummary?: string;
  comments?: IssueComment[];
  timeline?: IssueActivity[];
  residentFeedback?: {
    rating: number;
    comment: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type VisitorType =
  | 'Guest'
  | 'Delivery'
  | 'Plumber'
  | 'Electrician'
  | 'Technician'
  | 'Domestic worker'
  | 'Cab/driver'
  | 'Service provider'
  | 'Other';

export interface VisitorEntry {
  id: string;
  visitorName: string;
  flatNumber: string;
  block: string;
  visitorType: VisitorType;
  phone: string;
  vehicleNumber?: string;
  purpose: string;
  gate: string;
  entryTime: string;
  exitTime?: string;
  status: 'inside' | 'exited';
  residentApproval: 'pending' | 'approved' | 'denied';
  guardName: string;
  photoUrl?: string;
  isPreApproved?: boolean;
  preApprovalId?: string;
  passcodeUsed?: string;
}

export type AnnouncementCategory =
  | 'General'
  | 'Maintenance'
  | 'Water Shutdown'
  | 'Electricity'
  | 'Security'
  | 'Meeting'
  | 'Emergency'
  | 'Event';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'normal' | 'urgent' | 'emergency';
  targetBlock: string; // 'ALL' or 'Block A', 'Block B', 'Block C'
  isPinned: boolean;
  authorName: string;
  createdAt: string;
  acknowledgedBy?: string[]; // array of user uids
  actionRequired?: boolean;
}

export type ChannelId = 'general' | 'buy-sell' | 'lost-found' | 'events' | 'help' | 'recommendations';

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorFlat: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  channel: ChannelId;
  title?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorFlat: string;
  imageUrl?: string;
  price?: string; // for buy-sell
  likesCount: number;
  reactions?: Record<string, number>; // emoji reactions 👍 ❤️ 👏 🙏
  commentsCount: number;
  comments?: PostComment[];
  isLocked?: boolean;
  isFlagged?: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // specific user or undefined for broadcast
  flatNumber?: string; // target flat
  title: string;
  message: string;
  type: 'visitor' | 'issue_update' | 'announcement' | 'emergency' | 'verification';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FlatRecord {
  block: string;
  flatNumber: string;
  occupantNames: string[];
  intercomNumber: string;
}
