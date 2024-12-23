export interface User {
  id?: number;
  email: String;
  password: String;
  name: String;
  role: ROLE;
  bio?: String;
  profileImageUrl?: String;
  createdAt?: Date;
  updatedAt?: Date;
  mentorshipsAsMentor?: MentorshipConnection[];
  mentorshipsAsMentee?: MentorshipConnection[];
  requestsSent?: MentorshipRequest[];
  requestsReceived?: MentorshipRequest[];
  userSkills?: UserSkill[];
  userInterests?: UserInterest[];
}

export interface MentorshipConnection {
  id?: number;
  mentorId?: number;
  menteeId?: number;
  createdAt?: Date;
  mentor?: User;
  mentee?: User;
}

export interface UserSkill {
  userId: number;
  skillId: number;
  user?: User;
  skill?: Skill;
}

export interface UserInterest {
  userId: number;
  interestId: number;
  user?: User;
  interest?: Interest;
}

export interface MentorshipRequest {
  id?: number;
  senderId?: number;
  receiverId?: number;
  status: RequestStatus;
  createdAt?: Date;
  sender?: User;
  reciever?: User;
}

export interface Skill {
  id?: number;
  name: string;
  userSkills?: UserSkill[];
}

export interface Interest {
  id?: number;
  name: string;
  userInterest?: UserInterest[];
}

enum ROLE {
  MENTOR,
  MENTEE,
}

enum RequestStatus {
  PENDING,
  ACCEPTED,
  DECLINED,
}
