import { Token, OrderStatus, TradeOrder } from './types';

export const TOKENS: Token[] = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9, logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
  { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
  { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, logoURI: 'https://dd.dexscreener.com/ds-data/tokens/solana/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm.png' },
];

// Mock Initial Orders
export const MOCK_ORDERS: TradeOrder[] = [
  {
    id: 'ord_1',
    maker: 'G2F...9sX',
    makerReputation: 156,
    tokenSell: TOKENS[0], // SOL
    amountSell: 10,
    tokenBuy: TOKENS[1], // USDC
    amountBuy: 1520,
    rate: 152,
    status: OrderStatus.OPEN,
    createdAt: Date.now() - 3600000,
    expiresAt: Date.now() + 86400000,
    isPremium: true,
  },
  {
    id: 'ord_2',
    maker: 'H7k...22z',
    makerReputation: 42,
    tokenSell: TOKENS[2], // BONK
    amountSell: 5000000,
    tokenBuy: TOKENS[0], // SOL
    amountBuy: 2.5,
    rate: 0.0000005,
    status: OrderStatus.OPEN,
    createdAt: Date.now() - 7200000,
    expiresAt: Date.now() + 86400000,
    isPremium: false,
  },
  {
    id: 'ord_3',
    maker: 'Ax9...11q',
    makerReputation: 8,
    tokenSell: TOKENS[1], // USDC
    amountSell: 5000,
    tokenBuy: TOKENS[3], // WIF
    amountBuy: 2500,
    rate: 2,
    status: OrderStatus.OPEN,
    createdAt: Date.now() - 100000,
    expiresAt: Date.now() + 3600000,
    isPremium: false,
  }
];