// API service for VMS backend
const API_BASE_URL = 'https://vms-api-s6lc.onrender.com/api/v1';
// const NEXT_PUBLIC_API_BASE_URL = 'https://backend-vms-1.onrender.com/api';
const NEXT_PUBLIC_API_BASE_URL = 'https://vistor-mangement-system-backend.vercel.app/api';


// Token expiration handler
let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Handle token expiration
const handleTokenExpiration = () => {
  console.warn('Token expired, logging out user');
  if (logoutCallback) {
    logoutCallback();
  } else {
    // Fallback: clear localStorage and redirect
    localStorage.removeItem('vms_user');
    localStorage.removeItem('vms_token');
    localStorage.removeItem('vms_refresh_token');
    window.location.href = '/login';
  }
};

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  department: string;
  siteLocation?: string;
  meetingLocation?: string;
  phoneNumber: string;
  role?: string;
}

export interface VisitorData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  hostEmployeeId: string; // This is what the API expects according to Swagger
  hostEmployee?: string;  // This is used in some components, but should be mapped to hostEmployeeId
  company?: string;
  siteLocation?: string;
  department: string;
  meetingLocation: string;
  visitStartDate: string;
  visitEndDate: string;
  category: 'VISITOR' | 'CONTRACTOR';
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  groups: string[];
  department: string;
  siteLocation?: string;
  meetingLocation?: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  hostEmployee: string;
  company?: string;
  siteLocation?: string;
  department: string;
  meetingLocation: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'pending' | 'approved' | 'checked-in' | 'checked-out' | 'cancelled';
  visitStartDate: string;
  visitEndDate: string;
  category: 'VISITOR' | 'CONTRACTOR';
  qrCode?: string;
  trainingCompleted?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  notificationSent?: boolean;
  approvalNotificationSent?: boolean;
}

type DocumentItem =
  { name: string; file?: File; url: string; type?: string; uploadedAt?: string };

export type Doc = {
  name: string;
  file?: File;
  url: string;
  type?: string;
  uploadedAt?: string; // <-- remove the optional `?`
};


export interface VisitorForm {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  purpose: string;
  hostEmployee: string;
  company?: string;
  siteLocation?: string;
  department: string;
  meetingLocation: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkOutVisitor?: string;
  status: 'pending' | 'approved' | 'checked-in' | 'checked-out' | 'cancelled';
  visitStartDate: string;
  visitEndDate: string;
  visitorCategory: 'visitor' | 'contractor';
  qrCode?: string;
  trainingCompleted?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  notificationSent?: boolean;
  approvalNotificationSent?: boolean;
  createdAt?: string | null;
  hazards?: {
    title: string;
    risk: string | number;
    selectedControls: string[];
  }[];
  ppe?: {
    "HARD HAT": 'N' | 'Y';
    "SAFETY SHOES": 'N' | 'Y';
    "OVERALLS": 'N' | 'Y';
    "EYE PROTECTION": 'N' | 'Y';
    "VEST VEST": 'N' | 'Y';
    "EAR PROTECTION": 'N' | 'Y';
    "RESPIRATORY EQUIP": 'N' | 'Y';
    "GLOVES": 'N' | 'Y';
    "DUST MASK": 'N' | 'Y';
    "FALL ARREST": 'N' | 'Y';
  };
  documents: DocumentItem[];
  pics?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  console.log("API Response", data)

  if (!response.ok) {
    const errorMessage = data.error || 'An error occurred';

    // Check for token expiration (401 Unauthorized)
    if (response.status === 401) {
      console.warn('Received 401 Unauthorized - token may be expired');
      handleTokenExpiration();
      throw new Error('Session expired. Please log in again.');
    }

    // Check for other authentication/authorization errors
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }

    throw new Error(errorMessage);
  }

  return data.data;
};

// Authentication API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ userId: string; email: string; firstName: string; lastName: string; role: string; accessToken: string; refreshToken: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData: SignupData): Promise<{ userId: string; email: string; firstName: string; lastName: string; role: string; accessToken: string; refreshToken: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json();


      if (!response.ok) {
        console.error('Refresh token failed with response:', data);
        throw new Error(data.message || 'Token refresh failed');
      }
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  getProfile: async (token: string): Promise<User> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
};

// Visitor API
export const visitorAPI = {
  scheduleVisit: async (visitorData: VisitorData, token: string): Promise<Visitor> => {
    try {
      // Create a copy of the data to modify
      const apiVisitorData = { ...visitorData };

      // Handle the case where hostEmployee is provided but hostEmployeeId is not
      if (!apiVisitorData.hostEmployeeId && apiVisitorData.hostEmployee) {
        apiVisitorData.hostEmployeeId = apiVisitorData.hostEmployee;
      }

      // Remove the hostEmployee field as it's not expected by the API
      if ('hostEmployee' in apiVisitorData) {
        delete apiVisitorData.hostEmployee;
      }

      const response = await fetch(`${API_BASE_URL}/visitors/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiVisitorData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Schedule visit error:', error);
      throw error;
    }
  },

  // Get all visitors (admin/manager/security only)
  getAllVisitors: async (token: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    department?: string;
    search?: string;
  }): Promise<Visitor[]> => {
    try {
      let url = `${API_BASE_URL}/visitors`;
      const params = new URLSearchParams();

      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.category) params.append('category', filters.category);
        if (filters.department) params.append('department', filters.department);
        if (filters.search) params.append('search', filters.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get all visitors error:', error);
      throw error;
    }
  },

  getVisitorsByHost: async (token: string, status?: string, startDate?: string, endDate?: string): Promise<Visitor[]> => {
    try {
      let url = `${API_BASE_URL}/visitors/host`;
      const params = new URLSearchParams();

      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });


      return handleResponse(response);
    } catch (error) {
      console.error('Get visitors by host error:', error);
      throw error;
    }
  },

  // Alias for getVisitorById to maintain backward compatibility
  getVisitor: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor error:', error);
      throw error;
    }
  },

  getVisitorById: async (visitorId: string, token: string): Promise<Visitor> => {
    return visitorAPI.getVisitor(visitorId, token);
  },

  updateVisitor: async (visitorId: string, visitorData: Partial<VisitorData>, token: string): Promise<Visitor> => {
    try {
      // Create a copy of the data to modify
      const apiVisitorData = { ...visitorData };

      // Handle the case where hostEmployee is provided but hostEmployeeId is not
      if (!apiVisitorData.hostEmployeeId && apiVisitorData.hostEmployee) {
        apiVisitorData.hostEmployeeId = apiVisitorData.hostEmployee;
      }

      // Remove the hostEmployee field as it's not expected by the API
      if ('hostEmployee' in apiVisitorData) {
        delete apiVisitorData.hostEmployee;
      }

      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiVisitorData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update visitor error:', error);
      throw error;
    }
  },

  checkInVisitor: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Check in visitor error:', error);
      throw error;
    }
  },

  checkOutVisitor: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}/check-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Check out visitor error:', error);
      throw error;
    }
  },

  // New endpoint: Get visit history
  getVisitHistory: async (token: string, startDate?: string, endDate?: string, status?: string, location?: string): Promise<Visitor[]> => {
    try {
      // Use the correct endpoint from backend routes
      let url = `${API_BASE_URL}/visitors/visits`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      if (location) params.append('location', location);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visit history error:', error);
      throw error;
    }
  },

  // New endpoint: Get visit history for a specific visitor
  getVisitorHistory: async (visitorId: string, token: string): Promise<Visitor[]> => {
    try {
      // Use the correct endpoint from backend routes
      const response = await fetch(`${API_BASE_URL}/visitors/visits/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor history error:', error);
      throw error;
    }
  },

  // Search for visitors by email
  searchVisitorsByEmail: async (email: string, token: string): Promise<Visitor[]> => {
    try {
      // Check if the token is provided
      if (!token) {
        throw new Error('Authentication token is required');
      }

      // Check if email is provided and valid
      if (!email || !email.includes('@')) {
        throw new Error('Valid email address is required');
      }

      // First, try the admin/users endpoint with search parameter if user has admin access
      try {
        // Use the admin API to search for visitors by email
        const adminSearchUrl = `${API_BASE_URL}/admin/users?search=${encodeURIComponent(email)}`;
        const adminResponse = await fetch(adminSearchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // If successful, this means the user has admin access
        if (adminResponse.ok) {
          // Now use the visitors endpoint to get all visitors (admin access)
          const visitorsResponse = await fetch(`${API_BASE_URL}/visitors`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (visitorsResponse.ok) {
            const visitors = await handleResponse<Visitor[]>(visitorsResponse);

            // Filter visitors by email (case-insensitive)
            const filteredVisitors = visitors.filter(visitor =>
              visitor.email && visitor.email.toLowerCase() === email.toLowerCase()
            );

            return filteredVisitors;
          }
        }
      } catch (adminError) {
        console.warn('Admin search failed, falling back to host endpoint');
      }

      // If admin access fails or user is not an admin, use the host endpoint
      const hostResponse = await fetch(`${API_BASE_URL}/visitors/host`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!hostResponse.ok) {
        throw new Error(`Failed to fetch visitors: ${hostResponse.status} ${hostResponse.statusText}`);
      }

      const hostVisitors = await handleResponse<Visitor[]>(hostResponse);

      // Filter visitors by email (case-insensitive)
      const filteredHostVisitors = hostVisitors.filter(visitor =>
        visitor.email && visitor.email.toLowerCase() === email.toLowerCase()
      );

      return filteredHostVisitors;
    } catch (error) {
      console.error('Search visitors by email error:', error);

      // If all API calls fail, throw an error with a descriptive message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to search for visitors. Please try again later.');
      }
    }
  },

  // Approve or reject visitor
  approveVisitor: async (visitorId: string, approved: boolean, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approved }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Approve visitor error:', error);
      throw error;
    }
  },

  // Export visitors to Excel
  exportToExcel: async (token: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    category?: string;
    department?: string;
  }): Promise<Blob> => {
    try {
      let url = `${API_BASE_URL}/visitors/export/excel`;
      const params = new URLSearchParams();

      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.department) params.append('department', filters.department);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      return response.blob();
    } catch (error) {
      console.error('Export to Excel error:', error);
      throw error;
    }
  },
};



// Training API
export type Training = {
  _id: string;
  title: string;
  description: string;
  type: string;
  content: string;
  requiredScore: number;
  isActive: boolean;
  videos?: { name: string; url: string }[];
  books?: { name: string; url: string }[];
  questions?: {
    question: string;
    options: string[];
    answer: number; // important!
  }[];
  createdAt: Date;
};


export interface TrainingEnrollment {
  _id: string;
  visitorId: string;
  trainingId: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  score?: number;
  passed?: boolean;
}

export interface TrainingCompletion {
  _id: string;
  visitorId: string;
  trainingId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface TrainingSubmissionResponse {
  score: number;
  passed: boolean;
  completion: TrainingCompletion;
}

export interface Certificate {
  certificateId: string;
  visitorName: string;
  trainingTitle: string;
  trainingType: string;
  score: number;
  completionDate: string;
  issueDate: string;
}


// Access Control API
export const accessControlAPI = {
  validateQrCode: async (qrData: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/validate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Validate QR code error:', error);
      throw error;
    }
  },

  generateQrCode: async (visitorId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/qr/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Generate QR code error:', error);
      throw error;
    }
  },
};

// Notification API
export interface Notification {
  _id: string;
  type: 'visitor-arrival' | 'visitor-departure' | 'visitor-registration' | 'visitor-cancelled' |
  'check-in' | 'check-out' | 'registration' | 'cancelled' | 'welcome' | 'reset-password';
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
}

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  hostNotificationsEnabled: boolean;
  visitorNotificationsEnabled: boolean;
  notificationTypes: Record<string, boolean>;
}

export const notificationAPI = {
  // Send notification to visitor
  sendVisitorNotification: async (visitorId: string, type: Notification['type'], message: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/notifications/visitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId, type, message }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Send visitor notification error:', error);
      throw error;
    }
  },

  // Send notification to host
  sendHostNotification: async (hostId: string, type: Notification['type'], visitorId: string, message: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/notifications/host`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ hostId, type, visitorId, message }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Send host notification error:', error);
      throw error;
    }
  },

  // Get notification history
  getNotificationHistory: async (token: string): Promise<Notification[]> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/notifications/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data

    } catch (error) {
      console.error('Get notification history error:', error);
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async (token: string): Promise<NotificationSettings> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/notifications/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data

    } catch (error) {
      console.error('Get notification settings error:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings: NotificationSettings, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  },
};

// Document Management API
export interface Document {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  visitorId: string;
  uploadedBy: string;
  uploadedAt: string;
  documentType: 'id' | 'nda' | 'training' | 'other';
  description?: string;
}

export const documentAPI = {
  // Upload document
  uploadDocument: async (file: File, visitorId: string, documentType: Document['documentType'], description: string, token: string): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visitorId', visitorId);
      formData.append('documentType', documentType);
      if (description) formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  // Get visitor documents
  getVisitorDocuments: async (visitorId: string, token: string): Promise<Document[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/visitor/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor documents error:', error);
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId: string, token: string): Promise<Document> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  },
};

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Site {
  _id: string;
  name: string;
  location: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  departments: Department[];
  meetingLocations: MeetingLocation[];
  settings: SiteSettings;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  siteName?: string;
  siteId?: string;
}

export interface MeetingLocation {
  _id: string;
  name: string;
  description?: string;
  capacity: number;
  isActive: boolean;
  siteName?: string;
  siteId?: string;
}

export interface SiteSettings {
  visitorEnabled: boolean;
  contractorEnabled: boolean;
  requireApproval: boolean;
  autoApproveVisitors: boolean;
  autoApproveContractors: boolean;
  emailNotificationsEnabled: boolean;
  mainNotificationEmail: string;
  additionalNotificationEmails: string[];
}

// Site API
export const siteAPI = {
  // Get all sites
  getAllSites: async (token: string): Promise<Site[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get sites error:', error);
      throw error;
    }
  },

  // Get all departments
  getAllDepartments: async (token: string): Promise<Department[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/departments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  },

  // Get all meeting locations
  getAllMeetingLocations: async (token: string): Promise<MeetingLocation[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/meeting-locations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get meeting locations error:', error);
      throw error;
    }
  },

  // Get site settings
  getSiteSettings: async (siteId: string, token: string): Promise<SiteSettings> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/${siteId}/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get site settings error:', error);
      throw error;
    }
  },

  // Update site settings
  updateSiteSettings: async (siteId: string, settings: Partial<SiteSettings>, token: string): Promise<SiteSettings> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/${siteId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update site settings error:', error);
      throw error;
    }
  },

  // Create site
  createSite: async (siteData: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(siteData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create site error:', error);
      throw error;
    }
  },

  // Update site
  updateSite: async (siteId: string, siteData: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(siteData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update site error:', error);
      throw error;
    }
  },

  // Delete site
  deleteSite: async (siteId: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete site error:', error);
      throw error;
    }
  },

  // Create department
  createDepartment: async (departmentData: { name: string; description?: string }, token: string): Promise<Department> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(departmentData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create department error:', error);
      throw error;
    }
  },

  // Delete department
  deleteDepartment: async (departmentId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete department error:', error);
      throw error;
    }
  },

  // Create meeting location
  createMeetingLocation: async (locationData: { name: string; description?: string; capacity?: number }, token: string): Promise<MeetingLocation> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/meeting-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...locationData, capacity: locationData.capacity || 10 }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create meeting location error:', error);
      throw error;
    }
  },

  // Delete meeting location
  deleteMeetingLocation: async (locationId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sites/meeting-locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete meeting location error:', error);
      throw error;
    }
  },
};

// Employee API
export const employeeAPI = {
  getEmployees: async (token: string): Promise<Employee[]> => {
    try {
      // Since there's no dedicated /employees endpoint in the API,
      // we'll use the admin/users endpoint and filter for hosts
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users?role=host`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If the admin/users endpoint works, convert the users to employee format
      try {
        const users = await handleResponse<any[]>(response);


        // Convert users to employee format
        return users.map((user: any) => ({
          id: user._id || user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          department: user.department || 'General',
        }));
      } catch (adminError) {
        console.error('Get admin/users error:', adminError);

        // If admin/users fails, try the regular users endpoint
        try {
          console.warn('Admin users endpoint failed, trying regular users endpoint');
          const usersResponse = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const allUsers = await handleResponse<any[]>(usersResponse);

          // Filter for users with host role
          const hostUsers = allUsers.filter(user => user.role === 'host');

          // Convert users to employee format
          return hostUsers.map((user: any) => ({
            id: user._id || user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            department: user.department || 'General'
          }));
        } catch (userError) {
          console.error('Get users error:', userError);
          console.warn('Falling back to auth/profile as last resort');

          // If all else fails, try to get the current user's profile
          // This is a last resort and won't give a list of hosts, but at least provides one valid user
          try {
            const profileResponse = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            const profile = await handleResponse<any>(profileResponse);

            return [{
              id: profile._id || profile.id,
              name: `${profile.firstName} ${profile.lastName}`,
              email: profile.email,
              department: profile.department || 'General'
            }];
          } catch (profileError) {
            console.error('Get profile error:', profileError);
            console.warn('All API attempts failed, falling back to mock employee data');
          }
        }
      }

      // If all API calls fail, throw an error
      throw new Error('Failed to fetch employees. Please check your connection and try again.');
    } catch (error) {
      console.error('Get employees error:', error);

      // Rethrow the error
      throw error;
    }
  },

  // Get employee by ID
  getEmployee: async (employeeId: string, token: string): Promise<Employee> => {
    try {
      // Check if employeeId is an object (which would cause API errors)
      if (typeof employeeId !== 'string' || employeeId === '[object Object]') {
        console.warn('Invalid employeeId format:', employeeId);

        // Return a default employee object to prevent UI errors
        return {
          id: 'unknown',
          name: 'Unknown Host',
          email: '',
          department: 'General'
        };
      }

      // First try to get the user from the admin API
      try {
        const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users/${employeeId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const user = await handleResponse<any>(response);

        return {
          id: user._id || user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          department: user.department || 'General',
        };
      } catch (adminError) {
        console.error('Get admin/user by ID error:', adminError);

        // If admin API fails, try to get all users and find the one with matching ID
        try {
          const employees = await employeeAPI.getEmployees(token);
          const employee = employees.find(emp => emp.id === employeeId);

          if (employee) {
            return employee;
          }
        } catch (empError) {
          console.error('Failed to get employees list:', empError);
        }

        // If we still can't find the employee, return a default object instead of throwing an error
        // This prevents UI errors when host information can't be found
        console.warn('Employee not found, using default value');
        return {
          id: employeeId,
          name: 'Unknown Host',
          email: '',
          department: 'General'
        };
      }
    } catch (error) {
      console.error('Get employee error:', error);

      // Return a default employee object to prevent UI errors
      return {
        id: employeeId || 'unknown',
        name: 'Unknown Host',
        email: '',
        department: 'General'
      };
    }
  },
};



// Admin API
export interface SystemSettings {
  emailNotificationsEnabled: boolean;
  qrCodeExpiryHours: number;
  visitorPhotoRequired: boolean;
  trainingRequired: boolean;
  systemVersion: string;
}

export interface License {
  _id: string;
  licenseKey: string;
  status: 'Active' | 'Expired' | 'Revoked';
  featuresEnabled: string[];
  expiryDate: string;
  issuedTo: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
}


export const adminAPI = {
  // Get all users
  getUsers: async (token?: string, role?: string, department?: string, isActive?: boolean, search?: string): Promise<User[]> => {
    try {
      let url = `${NEXT_PUBLIC_API_BASE_URL}/admin/users`;
      const params = new URLSearchParams();

      if (role) params.append('role', role);
      if (department) params.append('department', department);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      if (search) params.append('search', search);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Create user
createUser: async (userData: SignupData, token: string): Promise<User> => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw a custom error with the message from the backend
      throw new Error(data.message || 'Failed to create user');
    }

    return data;
  } catch (error: any) {
    // Re-throw error so calling component can handle/display it
    throw new Error(error.message || 'An unexpected error occurred');
  }
  },

  // Get user by ID
  getUserById: async (userId: string, token: string | null): Promise<User> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>, token: string): Promise<User> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Get system settings
  getSystemSettings: async (token?: string): Promise<SystemSettings> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
      // return handleResponse(response);
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  },

  // Update system settings
  updateSystemSettings: async (token: string, settings: SystemSettings | null): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update system settings error:', error);
      throw error;
    }
  },

  // Get audit logs
  getAuditLogs: async (token: string, startDate?: string, endDate?: string, userId?: string, action?: string): Promise<AuditLog[]> => {
    try {
      let url = `${NEXT_PUBLIC_API_BASE_URL}/admin/audit-logs`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  },

  // Get licenses
  getLicenses: async (token: string): Promise<License[]> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/licenses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get licenses error:', error);
      throw error;
    }
  },

  // Add license
  addLicense: async (licenseKey: string, expiryDate: string, token: string): Promise<License> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ licenseKey, expiryDate }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Add license error:', error);
      throw error;
    }
  },

  // Fetch all groups
  fetchGroups: async (token: string): Promise<Group[]> => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/groups`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
    });

    const data = await res.json();
    console.log(data);
    
    if (!res.ok) throw new Error(data.error || 'Failed to create group');
    return data;
  },

  // Create a new group
  createGroup: async (group: { name: string; description?: string }, token: string,) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(group),
    });

    const data = await res.json();
    console.log(data);
    
    if (!res.ok) throw new Error(data.error || 'Failed to create group');
    return data;
  },

  // Assign groups to a user or host
  assignGroupsToUser: async (userId: string, token: string, groups: string[]) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/groups/access-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
      body: JSON.stringify({ userId, groups }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign groups');
    return data;
  },

  // Get assigned groups for a specific user
  getUserGroups: async (userId: string, token: string,): Promise<{ groups: string[] }> => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/groups/user/${userId}/groups`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
    });

    if (!res.ok) throw new Error('Failed to get user groups');
    return res.json();
  },

  getGroupMembers: async (groupName: string, token: string) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/groups/${groupName}/members`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get group members');
  return data;
},

};

// Analytics API
export const analyticsAPI = {
  getVisitorStats: async (token: string) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/analytics/visitors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json(); // ✅ This gives you the actual { visitor, contractor } object
      console.log("Response data:", data);

      return data;
    } catch (error) {
      console.error('Get visitor stats error:', error);
      throw error;
    }
  },

  getAccessMetrics: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/analytics/access`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data
      // return handleResponse(response);
    } catch (error) {
      console.error('Get access metrics error:', error);
      throw error;
    }
  },

  getVisitorMetrics: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/analytics/visitor-metrics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      return data
      // return handleResponse(response);
    } catch (error) {
      console.error('Get visitor metrics error:', error);
      throw error;
    }
  },

  getTrainingMetrics: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/analytics/training`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get training metrics error:', error);
      throw error;
    }
  },
};





export const newVisitorAPI = {

  // fetch all visitor
  getAll: async () => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visitors`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch visitors');
    }

    return await res.json();
  },

  searchByEmail: async (email: string) => {
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/forms/email-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Found:', data);
        return data.data;
        // fill form with data.data (visitor or contractor)
      } else {
        console.warn('Not found');
      }
    } catch (err) {
      console.error('Error searching:', err);
    }
  },

  getVisitorsByHost: async (token: string, status?: string, startDate?: string, endDate?: string): Promise<Visitor[]> => {
    try {
      let url = `${NEXT_PUBLIC_API_BASE_URL}/admin/visitors/host`;
      const params = new URLSearchParams();

      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });


      return handleResponse(response);
    } catch (error) {
      console.error('Get visitors by host error:', error);
      throw error;
    }
  },


  // fetch single visitor
  // fetch a single visitor by ID
  getSingleVisitorById: async (id: string) => {
    console.log('Fetching:', `${NEXT_PUBLIC_API_BASE_URL}/admin/visitor/${id}`);

    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visitor/${id}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch visitor');
    }

    return await res.json();
  },


  // ✅ fetch all visit history (visitors + contractors)
  getVisitHistory: async () => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visit-history`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch visit history');
    }
    return await res.json();
  },


  // fetch all schedule
  getAllSchedule: async () => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visits`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch shcedule visit');
    }

    return await res.json();
  },

  // accept or reject visitor form
  updateStatus: async (visitorId: string, status: 'approved' | 'cancelled', token: string, type: string = 'visitor') => {
    const url = `${NEXT_PUBLIC_API_BASE_URL}/admin/updateStatus/${type}/${visitorId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update status');
    }

    return await response.json(); // { message, doc }
  },

  checkInVisitor: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visitors/${visitorId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Check in visitor error:', error);
      throw error;
    }
  },

  checkOutVisitor: async (id: string, token: string) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visitors/${id}/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to check out visitor');
    return res.json();
  },

  exportToExcel: async (token: string, filters: any) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/visitors/export?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to export Excel file');
    return await res.blob();
  },

  // Edit visitor or contractor form
  editForm: async (
    id: string,
    updates: Record<string, any>,
    type: 'visitor' | 'contractor' = 'visitor'
  ) => {
    const url = `${NEXT_PUBLIC_API_BASE_URL}/admin/edit/${type}/${id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to edit form');
    }

    return await response.json(); // { message, updated }
  },

  validateQrCode: async (qrData: string) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/validate-qr`, {
        method: 'POST',
        body: JSON.stringify({ qrData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'QR code validation failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Validate QR code error:', error);
      throw error;
    }
  },

  generateQrCode: async (visitorId: string) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/qr/${visitorId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'QR code validation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Generate QR code error:', error);
      throw error;
    }
  },

  // /lib/api.ts
  getVisitorByEmail: async (email: string): Promise<string> => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/visitors/email/${email}`);
    if (!res.ok) throw new Error("Visitor not found");
    return res.json(); // Should return visitor object
  },



  // Get visitor documents
  getVisitorDocuments: async (visitorId: string, token: string): Promise<Document[]> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/documents/visitor/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor documents error:', error);
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId: string, token: string): Promise<Document> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  },
  addDocument: async (visitorId: string, document: any) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/visitors/${visitorId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(document),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to upload document');
    }

    return res.json();
  },
};



export const trainingAPI = {
  getAllTrainings: async () => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/trainings`);
      const data = await response.json();
      // console.log(data);
      return data
    } catch (error) {
      console.error('Get trainings error:', error);
      throw error;
    }
  },

  createTraining: async (trainingData: Partial<Training>, token: string): Promise<Training> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/create-training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(trainingData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create training error:', error);
      throw error;
    }
  },

  getTrainingById: async (trainingId: string): Promise<Training> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/${trainingId}`, {
        method: 'GET',
      });

      const data = await response.json();
      console.log(data);

      return data;
    } catch (error) {
      console.error('Get training by ID error:', error);
      throw error;
    }
  },

  updateTraining: async (trainingId: string, trainingData: Partial<Training>, token: string): Promise<Training> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/${trainingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(trainingData),
      });
      const data = await response.json();
      console.log(data);

      return data;
      // return handleResponse(response);
    } catch (error) {
      console.error('Update training error:', error);
      throw error;
    }
  },

  deleteTraining: async (trainingId: string, token: string | null): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/${trainingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete training error:', error);
      throw error;
    }
  },

  submitTraining: async (contractorId: string, score: number): Promise<TrainingSubmissionResponse> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractorId, score }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Submit training error:', error);
      throw error;
    }
  },

  getTrainingStatus: async (visitorId: string, token: string): Promise<TrainingCompletion[]> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/enrollments/visitor/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get training status error:', error);
      throw error;
    }
  },

  markTrainingCompleted: async (id: string, trainingId: string, title: string, score?: number) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/forms/${id}/complete-training`, {
        method: 'POST', // or 'PUT', depending on the API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainingId, score, title }),
      });
      const data = await response.json();
      console.log(data);

      return data;

    } catch (error) {
      console.error('Get training status error:', error);
      throw error;
    }
  },

  getCompletedTrainingsByVisitor: async (contractorId: string) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/forms/${contractorId}/completed-trainings`)
      const data = await response.json();
      console.log(data);

      return data;
    } catch (error) {
      console.error('Get training status error:', error);
      throw error;
    }
  },

  // New endpoint: Enroll visitor in training
  enrollVisitor: async (visitorId: string, trainingId: string, token: string): Promise<TrainingEnrollment> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId, trainingId }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Enroll visitor in training error:', error);
      throw error;
    }
  },

  // New endpoint: Generate certificate
  generateCertificate: async (enrollmentId: string, token: string): Promise<Certificate> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/certificates/${enrollmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Generate certificate error:', error);
      throw error;
    }
  },

  toggleTrainingStatus: async (trainingId: string, token: string | null) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/training/${trainingId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to toggle status');
    return res.json();
  }



};


export const hallAPI = {
  // Save a new hall API route or update existing one
  async saveHallApi(hall: string, apiUrl: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/hall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: hall, externalApiUrl: apiUrl }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save hall API');
    return data.hall;
  },

  // Get all saved hall APIs
  async getHallApis() {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/hall`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch hall APIs');
    return data.halls; // returns array of { name, externalApiUrl }
  },

  // Fetch groups from a specific hall
  async fetchExternalGroups(hallName: string, token: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/hall/${hallName}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch external groups');
    return data.groups;
  },
};




