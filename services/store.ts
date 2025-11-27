
import { TradeOrder, OrderStatus, ChatMessage, UserProfile } from '../types';
import { MOCK_ORDERS } from '../constants';

const ORDERS_KEY = 'nexus_orders_v1';
const CHATS_KEY = 'nexus_chats_v1';
const USERS_KEY = 'nexus_users_v1';

// --- Orders ---

export const getOrders = (): TradeOrder[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  if (!stored) {
    // Seed with mock data if empty (which is now empty array)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(MOCK_ORDERS));
    return MOCK_ORDERS;
  }
  return JSON.parse(stored);
};

export const getOrderById = (id: string): TradeOrder | undefined => {
  const orders = getOrders();
  return orders.find(o => o.id === id);
};

export const createOrder = (order: TradeOrder) => {
  const orders = getOrders();
  const newOrders = [order, ...orders];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
};

export const updateOrderStatus = (id: string, status: OrderStatus, taker?: string) => {
  const orders = getOrders();
  const updated = orders.map(o => {
    if (o.id === id) {
      return { ...o, status, taker: taker || o.taker };
    }
    return o;
  });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

// --- Chats ---

export const getChatMessages = (orderId: string): ChatMessage[] => {
  const stored = localStorage.getItem(CHATS_KEY);
  const allChats: Record<string, ChatMessage[]> = stored ? JSON.parse(stored) : {};
  return allChats[orderId] || [];
};

export const addChatMessage = (orderId: string, message: ChatMessage) => {
  const stored = localStorage.getItem(CHATS_KEY);
  const allChats: Record<string, ChatMessage[]> = stored ? JSON.parse(stored) : {};
  
  if (!allChats[orderId]) allChats[orderId] = [];
  allChats[orderId].push(message);
  
  localStorage.setItem(CHATS_KEY, JSON.stringify(allChats));
};

// --- Users ---

export const getUserProfile = (address: string): UserProfile => {
    const stored = localStorage.getItem(USERS_KEY);
    const users = stored ? JSON.parse(stored) : {};
    
    if (users[address]) {
        return users[address];
    }

    // Default Profile for new users
    const defaultProfile: UserProfile = {
        address,
        reputationScore: 100,
        tradesCompleted: 0,
        tradesFailed: 0,
        isEarlyAdopter: true, // Auto-grant early adopter for demo
        isPremium: false,
        volumeUsd: 0,
        displayName: `${address.slice(0, 4)}...${address.slice(-4)}`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`
    };
    
    // Persist default immediately so editing works
    users[address] = defaultProfile;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return defaultProfile;
};

export const updateUserProfile = (profile: UserProfile) => {
    const stored = localStorage.getItem(USERS_KEY);
    const users = stored ? JSON.parse(stored) : {};
    users[profile.address] = profile;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
