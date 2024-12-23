// Enums
export enum UserRole {
  MENTOR = "MENTOR",
  MENTEE = "MENTEE",
}

export enum RequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
}

// User Model
export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  bio?: string;
  role: UserRole;
  skills: UserSkill[];
  interests: UserInterest[];
  sentRequests: MentorshipRequest[];
  receivedRequests: MentorshipRequest[];
  notifications: Notification[];
  activeConnections: MentorshipConnection[];
  mentorConnections: MentorshipConnection[];
  menteeConnections: MentorshipConnection[];
  createdAt: Date;
  updatedAt: Date;
}

// Skill Model
export interface Skill {
  id: number;
  name: string;
  users: UserSkill[];
}

// UserSkill Junction Model
export interface UserSkill {
  userId: number;
  skillId: number;
  user: User;
  skill: Skill;
}

// Interest Model
export interface Interest {
  id: number;
  name: string;
  users: UserInterest[];
}

// UserInterest Junction Model
export interface UserInterest {
  userId: number;
  interestId: number;
  user: User;
  interest: Interest;
}

// Mentorship Request Model
export interface MentorshipRequest {
  id: number;
  senderId: number;
  receiverId: number;
  sender: User;
  receiver: User;
  message?: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Mentorship Connection Model
export interface MentorshipConnection {
  id: number;
  mentorId: number;
  menteeId: number;
  mentor: User;
  mentee: User;
  startDate: Date;
  endDate?: Date;
}

// Notification Model
export interface Notification {
  id: number;
  userId: number;
  user: User;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export const JWT_SECRET = process.env.JWT_SECRET;
