// BitFlow Bitcoin Network Live Data Service
// Integrates with Mempool.space public endpoints with seamless fallback streaming

export interface BitcoinTransaction {
  id: string;
  amount: string;
  amountBtc: number;
  fee: string;
  feeSat: number;
  time: string;
  status: "Pending" | "Confirmed";
  whale?: boolean;
}

export interface NetworkStats {
  mempoolSizeMb: number;
  tps: number;
  recommendedFeeSatVb: number;
  volume24hBtc: string;
  pendingTransactions: number;
  blockHeight: number;
  healthScore: number;
  difficultyAdjustment: string;
}

const INITIAL_TRANSACTIONS: BitcoinTransaction[] = [
  {
    id: "a72f91...c82d",
    amount: "2.48 BTC",
    amountBtc: 2.48,
    fee: "0.00021 BTC",
    feeSat: 21000,
    time: "Just now",
    status: "Pending",
  },
  {
    id: "b83fa2...921a",
    amount: "0.82 BTC",
    amountBtc: 0.82,
    fee: "0.00008 BTC",
    feeSat: 8000,
    time: "2s ago",
    status: "Pending",
  },
  {
    id: "f19c82...aa72",
    amount: "124.50 BTC",
    amountBtc: 124.5,
    fee: "0.0021 BTC",
    feeSat: 210000,
    time: "5s ago",
    status: "Pending",
    whale: true,
  },
  {
    id: "8ab912...ff32",
    amount: "4.72 BTC",
    amountBtc: 4.72,
    fee: "0.00031 BTC",
    feeSat: 31000,
    time: "8s ago",
    status: "Pending",
  },
  {
    id: "3e4b77...910a",
    amount: "0.15 BTC",
    amountBtc: 0.15,
    fee: "0.00004 BTC",
    feeSat: 4000,
    time: "12s ago",
    status: "Pending",
  },
  {
    id: "c901e4...77bc",
    amount: "85.20 BTC",
    amountBtc: 85.2,
    fee: "0.0018 BTC",
    feeSat: 180000,
    time: "15s ago",
    status: "Pending",
    whale: true,
  },
];

export function generateRandomTransaction(): BitcoinTransaction {
  const hex = "0123456789abcdef";
  let hash1 = "";
  let hash2 = "";
  for (let i = 0; i < 6; i++) hash1 += hex[Math.floor(Math.random() * hex.length)];
  for (let i = 0; i < 4; i++) hash2 += hex[Math.floor(Math.random() * hex.length)];

  const isWhale = Math.random() < 0.18;
  const amountBtc = isWhale
    ? +(15 + Math.random() * 250).toFixed(2)
    : +(0.01 + Math.random() * 8.5).toFixed(4);

  const feeBtc = +(0.00003 + Math.random() * 0.0004).toFixed(5);
  const feeSat = Math.round(feeBtc * 100000000);

  return {
    id: `${hash1}...${hash2}`,
    amount: `${amountBtc} BTC`,
    amountBtc,
    fee: `${feeBtc} BTC`,
    feeSat,
    time: "Just now",
    status: "Pending",
    whale: isWhale,
  };
}

export async function fetchLiveBitcoinStats(): Promise<Partial<NetworkStats>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const [feesRes, mempoolRes, blockRes] = await Promise.allSettled([
      fetch("https://mempool.space/api/v1/fees/recommended", {
        signal: controller.signal,
      }),
      fetch("https://mempool.space/api/mempool", {
        signal: controller.signal,
      }),
      fetch("https://mempool.space/api/blocks/tip/height", {
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    const stats: Partial<NetworkStats> = {};

    if (feesRes.status === "fulfilled" && feesRes.value.ok) {
      const feesData = await feesRes.value.json();
      stats.recommendedFeeSatVb = feesData.fastestFee || feesData.halfHourFee || 18;
    }

    if (mempoolRes.status === "fulfilled" && mempoolRes.value.ok) {
      const mempoolData = await mempoolRes.value.json();
      if (mempoolData.vsize) {
        stats.mempoolSizeMb = Math.round(mempoolData.vsize / (1024 * 1024) * 10) / 10;
      }
      if (mempoolData.count) {
        stats.pendingTransactions = mempoolData.count;
      }
    }

    if (blockRes.status === "fulfilled" && blockRes.value.ok) {
      const height = await blockRes.value.text();
      const parsed = parseInt(height, 10);
      if (!isNaN(parsed) && parsed > 0) {
        stats.blockHeight = parsed;
      }
    }

    return stats;
  } catch {
    // If blocked or CORS in iframe, return empty and keep graceful live simulated values
    return {};
  }
}

export { INITIAL_TRANSACTIONS };
