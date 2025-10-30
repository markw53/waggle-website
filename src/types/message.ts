// src/types/message.ts
import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantDetails: {
    [userId: string]: {
      displayName: string;
      photoURL: string;
      email: string;
    };
  };
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
}