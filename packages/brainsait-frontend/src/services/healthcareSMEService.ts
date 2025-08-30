// Healthcare SME API Service
import { AIChampion, ApiResponse, HealthcareSME, Mentorship, MentorshipApplication } from '@/types/healthcare';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class HealthcareSMEService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Healthcare SME Management
  async registerSME(data: any): Promise<ApiResponse<{ smeId: string; status: string }>> {
    return this.request('/api/healthcare-sme/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSMEProfile(): Promise<ApiResponse<HealthcareSME>> {
    return this.request('/api/healthcare-sme/profile');
  }

  async updateSMEProfile(data: Partial<HealthcareSME>): Promise<ApiResponse<HealthcareSME>> {
    return this.request('/api/healthcare-sme/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async submitOnboardingSurvey(data: any): Promise<ApiResponse<{ learningPath: any; nextSteps: any[] }>> {
    return this.request('/api/healthcare-sme/onboarding-survey', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLearningRecommendations(): Promise<ApiResponse<any>> {
    return this.request('/api/healthcare-sme/learning-recommendations');
  }

  // AI Champion Management
  async registerAsChampion(data: any): Promise<ApiResponse<{ championId: string; status: string }>> {
    return this.request('/api/ai-champions/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAvailableChampions(params: {
    specialization?: string;
    language?: string;
    level?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ champions: AIChampion[]; pagination: any }>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/api/ai-champions/available?${queryString}`);
  }

  async getChampionDashboard(): Promise<ApiResponse<any>> {
    return this.request('/api/ai-champions/dashboard');
  }

  // Mentorship Management
  async applyForMentorship(data: {
    championId: string;
    goals: string[];
    currentLevel: string;
    timeCommitment: string;
    preferredLanguage: string;
    previousExperience: string;
    specificInterests: string[];
    expectedDuration: string;
  }): Promise<ApiResponse<{ applicationId: string }>> {
    return this.request('/api/ai-champions/mentorship/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMentorshipApplications(): Promise<ApiResponse<MentorshipApplication[]>> {
    return this.request('/api/ai-champions/mentorship/applications');
  }

  async updateApplicationStatus(
    applicationId: string,
    status: 'ACCEPTED' | 'REJECTED',
    message?: string
  ): Promise<ApiResponse<{ application: MentorshipApplication }>> {
    return this.request(`/api/ai-champions/mentorship/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, message }),
    });
  }

  async getMentorships(): Promise<ApiResponse<Mentorship[]>> {
    return this.request('/api/mentorships');
  }

  async getMentorshipById(id: string): Promise<ApiResponse<Mentorship>> {
    return this.request(`/api/mentorships/${id}`);
  }

  // Session Management
  async scheduleMentorshipSession(data: {
    mentorshipId: string;
    scheduledAt: string;
    duration: number;
    agenda: string[];
    meetingLink?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/mentorship-sessions/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMentorshipSessions(mentorshipId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/mentorship-sessions?mentorshipId=${mentorshipId}`);
  }

  async updateSessionStatus(sessionId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/api/mentorship-sessions/${sessionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async submitSessionFeedback(data: {
    sessionId: string;
    rating: number;
    feedback: string;
    topicsCovered: string[];
    homeworkCompleted: boolean;
    nextSessionGoals?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request('/api/mentorship-sessions/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Learning Progress Tracking
  async updateLearningProgress(data: {
    moduleId: string;
    progress: number;
    timeSpent: number;
    completed: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/learning/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLearningProgress(): Promise<ApiResponse<any[]>> {
    return this.request('/api/learning/progress');
  }

  async getLearningPath(): Promise<ApiResponse<any>> {
    return this.request('/api/learning/path');
  }

  // Case Studies and Knowledge Sharing
  async shareCaseStudy(data: {
    title: string;
    description: string;
    specialization: string;
    aiTechnologies: string[];
    outcomes: string;
    challenges: string;
    lessons: string[];
    attachments?: File[];
  }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        value.forEach((file) => formData.append('attachments', file));
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    return fetch(`${API_BASE_URL}/api/case-studies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(res => res.json());
  }

  async getCaseStudies(params: {
    specialization?: string;
    aiTechnology?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any[]>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/api/case-studies?${queryString}`);
  }

  async getCaseStudyById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/case-studies/${id}`);
  }

  // Community and Networking
  async getDiscussionForums(): Promise<ApiResponse<any[]>> {
    return this.request('/api/forums');
  }

  async createDiscussionPost(data: {
    forumId: string;
    title: string;
    content: string;
    tags: string[];
  }): Promise<ApiResponse<any>> {
    return this.request('/api/forums/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDiscussionPosts(forumId: string, page = 1): Promise<ApiResponse<any[]>> {
    return this.request(`/api/forums/${forumId}/posts?page=${page}`);
  }

  async replyToPost(postId: string, content: string): Promise<ApiResponse<any>> {
    return this.request(`/api/forums/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Events and Webinars
  async getUpcomingEvents(): Promise<ApiResponse<any[]>> {
    return this.request('/api/events/upcoming');
  }

  async registerForEvent(eventId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  async getEventRecordings(): Promise<ApiResponse<any[]>> {
    return this.request('/api/events/recordings');
  }

  // Analytics and Insights
  async getUserAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics/user');
  }

  async getIndustryInsights(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics/industry-insights');
  }

  async getAITrendAnalysis(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics/ai-trends');
  }

  // Notifications and Communications
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request('/api/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async updateNotificationPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.request('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Real-time Communication
  async sendDirectMessage(recipientId: string, message: string): Promise<ApiResponse<any>> {
    return this.request('/api/messages/direct', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message }),
    });
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.request('/api/messages/conversations');
  }

  async getConversationMessages(conversationId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/messages/conversations/${conversationId}`);
  }
}

// Export singleton instance
export const healthcareSMEService = new HealthcareSMEService();
export default HealthcareSMEService;