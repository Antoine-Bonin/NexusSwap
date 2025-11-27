import { TradeOrder, OrderStatus, ChatMessage } from '../types';
import { MOCK_ORDERS } from '../constants';

const ORDERS_KEY = 'nexus_orders_v1';
const CHATS_KEY = 'nexus_chats_v1';

export const getOrders = (): TradeOrder[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  if (!stored) {
    // Seed with mock data if empty
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
