// src/config/routes.ts
export const ROUTES = {
  // Public
  HOME: '/',
  VERIFY_EMAIL: '/verify-email',
  GETTING_STARTED: '/getting-started',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  
  // Auth
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // Dogs
  DOGS: '/dogs',
  DOG_PROFILE: '/dogs/:id',
  ADD_DOG: '/add-dog',
  MY_DOGS: '/my-dogs',
  EDIT_DOG: '/edit-dog/:id',
  
  // Matches
  ADD_MATCH: '/add-match',
  MATCHES: '/matches',
  
  // Messaging
  MESSAGES: '/messages',
  CONVERSATION: '/messages/:id',
  
  // Analytics
  ANALYTICS: '/analytics',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/verification',
  
  // User
  USER_PROFILE: '/users/:id',
} as const;

// Helper functions for dynamic routes
export const getDogProfileRoute = (id: string) => `/dogs/${id}`;
export const getEditDogRoute = (id: string) => `/edit-dog/${id}`; 
export const getConversationRoute = (id: string) => `/messages/${id}`;
export const getUserProfileRoute = (id: string) => `/users/${id}`;