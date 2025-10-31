// src/hooks/useMessaging.ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import type { Conversation } from '@/types/message';

export function useMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    // Remove orderBy to avoid index requirement
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convos: Conversation[] = [];
        snapshot.forEach((doc) => {
          convos.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        
        // Sort in JavaScript instead of Firestore
        convos.sort((a, b) => {
          const aTime = a.lastMessageAt?.toMillis() || 0;
          const bTime = b.lastMessageAt?.toMillis() || 0;
          return bTime - aTime; // Descending order (newest first)
        });
        
        setConversations(convos);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const startConversation = async (otherUserId: string): Promise<string> => {
    if (!user) {
      console.error('startConversation: No user logged in');
      throw new Error('Must be logged in');
    }

    console.log('Starting conversation with:', otherUserId);

    try {
      // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.uid)
      );
      
      console.log('Checking for existing conversation...');
      const snapshot = await getDocs(q);
      console.log('Found conversations:', snapshot.size);
      
      const existingConvo = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(otherUserId);
      });

      if (existingConvo) {
        console.log('Existing conversation found:', existingConvo.id);
        return existingConvo.id;
      }

      console.log('No existing conversation, creating new one...');

      // Fetch user details
      console.log('Fetching current user doc:', user.uid);
      const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
      
      console.log('Fetching other user doc:', otherUserId);
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));

      if (!currentUserDoc.exists()) {
        console.error('Current user document not found:', user.uid);
        throw new Error('Your user profile not found. Please complete your profile first.');
      }
      
      if (!otherUserDoc.exists()) {
        console.error('Other user document not found:', otherUserId);
        throw new Error('User profile not found');
      }

      const currentUserData = currentUserDoc.data();
      const otherUserData = otherUserDoc.data();

      console.log('Current user data:', currentUserData);
      console.log('Other user data:', otherUserData);

      // Create new conversation
      const newConvo: Omit<Conversation, 'id'> = {
        participants: [user.uid, otherUserId],
        participantDetails: {
          [user.uid]: {
            displayName: currentUserData.displayName || currentUserData.name || 'Anonymous',
            photoURL: currentUserData.photoURL || '',
            email: currentUserData.email || '',
          },
          [otherUserId]: {
            displayName: otherUserData.displayName || otherUserData.name || 'Anonymous',
            photoURL: otherUserData.photoURL || '',
            email: otherUserData.email || '',
          },
        },
        lastMessage: '',
        lastMessageAt: Timestamp.fromDate(new Date()),
        unreadCount: {
          [user.uid]: 0,
          [otherUserId]: 0,
        },
        createdAt: Timestamp.fromDate(new Date()),
      };

      console.log('Creating new conversation document...');
      const docRef = await addDoc(conversationsRef, newConvo);
      console.log('Conversation created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error in startConversation:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to start conversation');
    }
  };

  const sendMessage = async (conversationId: string, text: string, toUserId: string) => {
    if (!user) throw new Error('Must be logged in');

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);

    // Get current conversation data
    const conversationSnap = await getDoc(conversationRef);
    if (!conversationSnap.exists()) throw new Error('Conversation not found');
    
    const conversationData = conversationSnap.data();

    // Add message
    await addDoc(messagesRef, {
      fromUserId: user.uid,
      toUserId: toUserId,
      text: text.trim(),
      createdAt: Timestamp.fromDate(new Date()),
      read: false,
    });

    // Update conversation
    const newUnreadCount = { ...conversationData.unreadCount };
    newUnreadCount[toUserId] = (newUnreadCount[toUserId] || 0) + 1;

    await updateDoc(conversationRef, {
      lastMessage: text.trim(),
      lastMessageAt: Timestamp.fromDate(new Date()),
      unreadCount: newUnreadCount,
    });
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    // Get unread messages
    const q = query(
      messagesRef,
      where('toUserId', '==', user.uid),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    // Batch update messages
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((document) => {
      batch.update(document.ref, { read: true });
    });

    // Update conversation unread count
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      const newUnreadCount = { ...data.unreadCount };
      newUnreadCount[user.uid] = 0;
      
      batch.update(conversationRef, { unreadCount: newUnreadCount });
    }

    await batch.commit();
  };

  return {
    conversations,
    loading,
    startConversation,
    sendMessage,
    markAsRead,
  };
}