// src/config/routes.ts
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
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
  DOG_SEARCH: '/dogs',
  DOGS_MAP: '/dogs/map',
  DOG_PROFILE: '/dogs/:id',
  ADD_DOG: '/add-dog',
  MY_DOGS: '/my-dogs',
  EDIT_DOG: '/edit-dog/:id',
  BREEDING_CALENDAR: '/breeding-calendar',
  BREEDING_CALENDAR_DOG: '/breeding-calendar/:dogId',
  
  // Breeds
  BREEDS: '/breeds',
  BREED_PROFILE: '/breeds/:breedId',
  
  // Matches
  ADD_MATCH: '/add-match',
  MATCHES: '/matches',
  
  // Messaging
  MESSAGES: '/messages',
  CONVERSATION: '/messages/:id',
  
  // Analytics
  ANALYTICS: '/analytics',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  
  // User
  USER_PROFILE: '/users/:id',
} as const;

// Helper functions for dynamic routes
export const getDogProfileRoute = (id: string) => `/dogs/${id}`;
export const getEditDogRoute = (id: string) => `/edit-dog/${id}`; 
export const getConversationRoute = (id: string) => `/messages/${id}`;
export const getUserProfileRoute = (id: string) => `/users/${id}`;
export const getBreedingCalendarDogRoute = (dogId: string) => `/breeding-calendar/${dogId}`;
export const getBreedProfileRoute = (breedId: string) => `/breeds/${breedId}`;

// Helper to convert breed name to URL-safe ID
export const getBreedIdFromName = (breedName: string): string => {
  return breedName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};