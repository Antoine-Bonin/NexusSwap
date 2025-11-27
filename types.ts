
export enum OrderStatus {
  OPEN = 'OPEN',
  LOCKED = 'LOCKED',
  DISPUTE = 'DISPUTE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI: string;
}

export interface TradeOrder {
  id: string;
  maker: string; // Wallet address
  makerReputation: number;
  // Profile info snapshots for the order card
  makerName?: string;
  makerAvatar?: string;
  makerIsEarly?: boolean;
  
  tokenSell: Token;
  amountSell: number;
  tokenBuy: Token;
  amountBuy: number;
  rate: number; // Price of 1 SellToken in BuyToken
  status: OrderStatus;
  createdAt: number;
  expiresAt: number;
  isPremium: boolean;
  taker?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface UserProfile {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  reputationScore: number;
  tradesCompleted: number;
  tradesFailed: number;
  isEarlyAdopter: boolean;
  isPremium: boolean;
  volumeUsd: number;
}

// Window Interface for Solana Injection
declare global {
  interface Window {
    solana?: any;
    phantom?: any;
  }
}
