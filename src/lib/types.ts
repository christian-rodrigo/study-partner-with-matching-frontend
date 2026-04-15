export type UserType = 'STUDENT' | 'TUTOR';
export type City = 'BERLIN' | 'COLOGNE' | 'DORTMUND' | 'HAMBURG' | 'MUNICH';
export type LearningPlaceType = 'LIBRARY' | 'CAFE' | 'UNIVERSITY' | 'COWORKING';

export type StudyMode = 'ONLINE' | 'OFFLINE' | 'BOTH';
export const STUDY_MODE_VALUES: StudyMode[] = [
  'ONLINE',
  'OFFLINE',
  'BOTH'
];

export type LearningStyle = 'QUIET' | 'GROUP' | 'EXAM_FOCUSED';
export const LEARNING_STYLE_VALUES: LearningStyle[] = [
  'QUIET',
  'GROUP',
  'EXAM_FOCUSED'
];

export type LearningGoal = 'EXAM_PREPARATION' | 'HOMEWORK' | 'REGULAR_STUDY';
export const LEARNING_GOAL_VALUES: LearningGoal[] = [
  'EXAM_PREPARATION',
  'HOMEWORK',
  'REGULAR_STUDY'
];

export type StudyFrequency = 'DAILY' | 'TWICE_A_WEEK' | 'WEEKENDS' | 'BEFORE_EXAMS';
export const STUDY_FREQUENCY_VALUES: StudyFrequency[] = [
  'DAILY',
  'TWICE_A_WEEK',
  'WEEKENDS',
  'BEFORE_EXAMS'
];

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
  user1Id: number;
  user1Name: string;
  user2Id: number;
  user2Name: string;
  createdAt?: string;
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

  bio?: string;
  language?: string;
  availableTime?: string;
  studyMode?: StudyMode;
  learningStyle?: LearningStyle;
  learningGoal?: LearningGoal;
  studyFrequency?: StudyFrequency;
  userType: UserType;
}