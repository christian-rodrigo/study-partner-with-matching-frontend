import type {
  AuthResponse,
  Conversation,
  Course,
  LearningPlace,
  Message,
  RegisterRequest,
  University,
  User,
  UserSearchFilter,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'study-partner-token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getStoredToken: getToken,

  async login(email: string, password: string) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getDiscoverUsers() {
    return request<User[]>(`/api/discover`);
  },
  async register(payload: RegisterRequest) {
    return request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async me() {
    return request<User>('/api/auth/me');
  },

  // ⭐ NEU: Profil bearbeiten
  async updateMyProfile(payload: {
    name?: string;
    universityId?: number;
    city?: string;
    degreeProgram?: string;
    semester?: number;
    bio?: string;
    language?: string;
    availableTime?: string;
    studyMode?: string;
    learningStyle?: string;
    learningGoal?: string;
    studyFrequency?: string;
  }) {
    return request<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getUniversities() {
    return request<University[]>('/api/universities');
  },

  async getUsers() {
    return request<User[]>('/api/users');
  },

  async searchUsers(filter: UserSearchFilter) {
    return request<User[]>('/api/users/search', {
      method: 'POST',
      body: JSON.stringify(filter),
    });
  },

  async openConversation(user1Id: number, user2Id: number) {
    return request<Conversation>('/api/conversations/open', {
      method: 'POST',
      body: JSON.stringify({ user1Id, user2Id }),
    });
  },

  async getUserConversations(userId: number) {
    return request<Conversation[]>(`/api/conversations/user/${userId}`);
  },

  async getMessages(conversationId: number) {
    return request<Message[]>(`/api/messages/conversation/${conversationId}`);
  },

  async sendMessage(conversationId: number, senderId: number, content: string) {
    return request<Message>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, senderId, content }),
    });
  },

  async getLearningPlaces(city?: string, type?: string) {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);

    const suffix = params.toString()
      ? `/api/learning-places/search?${params.toString()}`
      : '/api/learning-places';

    return request<LearningPlace[]>(suffix);
  },

  async getTutorCourses() {
    return request<Course[]>('/api/tutors/me/courses');
  },

  async saveTutorCourses(newCourseNames: string[]) {
    return request<Course[]>('/api/tutors/me/courses', {
      method: 'POST',
      body: JSON.stringify({ newCourseNames, courseIds: [] }),
    });
  },
};