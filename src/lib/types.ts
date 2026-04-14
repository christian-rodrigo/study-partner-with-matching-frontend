export type UserType = 'STUDENT' | 'TUTOR';
export type StudyMode = 'ONLINE' | 'OFFLINE' | 'BOTH';
export type LearningStyle = 'QUIET' | 'GROUP' | 'EXAM_FOCUSED';
export type LearningGoal = 'EXAM_PREPARATION' | 'HOMEWORK' | 'REGULAR_STUDY';
export type StudyFrequency = 'DAILY' | 'TWICE_A_WEEK' | 'WEEKENDS' | 'BEFORE_EXAMS';
export type City = 'BERLIN' | 'COLOGNE' | 'DORTMUND' | 'HAMBURG' | 'MUNICH';
export type LearningPlaceType = 'LIBRARY' | 'CAFE' | 'UNIVERSITY' | 'COWORKING';

export interface University {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  universityId?: number;
  universityName?: string;
  city?: string;
  degreeProgram?: string;
  semester?: number;
  bio?: string;
  language?: string;
  availableTime?: string;
  studyMode?: StudyMode;
  learningStyle?: LearningStyle;
  learningGoal?: LearningGoal;
  studyFrequency?: StudyFrequency;
  score?: number;
  photos?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Conversation {
  id: number;
  user1?: User;
  user2?: User;
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt?: string;
  sentAt?: string;
}

export interface LearningPlace {
  id: number;
  name: string;
  address: string;
  city: City;
  type: LearningPlaceType;
  imageUrl?: string;
}

export interface Course {
  id: number;
  name: string;
}

export interface UserSearchFilter {
  universityId?: number;
  city?: string;
  degreeProgram?: string;
  semester?: number;
  language?: string;
  availableTime?: string;
  studyMode?: StudyMode;
  learningStyle?: LearningStyle;
  learningGoal?: LearningGoal;
  studyFrequency?: StudyFrequency;
  keyword?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  universityId: number;
  city: string;
  degreeProgram: string;
  semester: number;
  bio: string;
  language: string;
  availableTime: string;
  studyMode: StudyMode;
  learningStyle: LearningStyle;
  learningGoal: LearningGoal;
  studyFrequency: StudyFrequency;
  userType: UserType;
}
