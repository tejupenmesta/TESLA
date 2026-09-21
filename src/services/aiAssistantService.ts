import { SEED_MEMBERS, SEED_TRANSACTIONS } from "../data/seedData";

export interface ExtractedEntity {
  type: "wallet" | "member";
  value: string;
  label?: string;
}

export interface AssistantResponse {
  text: string;
  entities: ExtractedEntity[];
  engine: string;
}

/**
 * Extracts Bitcoin addresses and Member IDs for quick-copy buttons.
 */
export function extractEntities(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  // Extract BTC addresses (bc1q..., 1..., 3...)
  const btcMatches = text.match(/\b(bc1[a-z0-9]{20,50}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g);
  if (btcMatches) {
    for (const addr of btcMatches) {
      if (!seen.has(addr)) {
        seen.add(addr);
        entities.push({
          type: "wallet",
          value: addr,
          label: `${addr.slice(0, 8)}...${addr.slice(-6)}`,
        });
      }
    }
  }

  // Extract Member IDs (M001 to M100)
  const memberMatches = text.match(/\bM0[0-9]{2}\b/g);
  if (memberMatches) {
    for (const memId of memberMatches) {
      if (!seen.has(memId)) {
        seen.add(memId);
        const mem = SEED_MEMBERS.find((m) => m.memberId.toUpperCase() === memId.toUpperCase());
        entities.push({
          type: "member",
          value: memId,
          label: mem ? `${memId} (${mem.name})` : memId,
        });
      }
    }
  }

  return entities;
}

/**
 * Generate intelligent forensic responses matching BitFlow's SOC telemetry.
 */
export async function queryAIAssistant(
  query: string,
  history: Array<{ role: "user" | "assistant"; text: string }> = []
): Promise<AssistantResponse> {
  const q = query.trim().toLowerCase();

  // Attempt server-side API first with a fast timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: query,
        history: history.map((h) => ({
          role: h.role,
          content: h.text,
        })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        return {
          text: data.reply,
          entities: extractEntities(data.reply),
          engine: data.engine || "Gemini 3.8 Flash / BitFlow Core",
        };
      }
    }
  } catch {
    // Timeout or network fallback to local heuristic engine
  }

  // Local SOC Forensic Knowledge Engine
  return generateLocalForensicResponse(q);
}

function generateLocalForensicResponse(q: string): AssistantResponse {
  // 1. High-Risk Wallets & Scammers Summary
  if (
    q.includes("high-risk") ||
    q.includes("scammer") ||
    q.includes("mule") ||
    q.includes("wallet risk") ||
    q.includes("flagged wallet") ||
    q.includes("summarize high-risk")
  ) {
    const text = `### 🚨 BitFlow High-Risk Wallets & Scammer Syndicate Summary

Active heuristic surveillance flags **8 critical money mule & scammer nodes** participating in an organized peeling chain network:

1. **Aarav Kumar** (\`M001\`) — **Originator / Scammer X**
   - **Wallet**: \`bc1qbitflowdemo0001synthetic\`
   - **Risk Score**: \`98/100\` (CRITICAL)
   - **Status**: \`Under Review / Flagged\` | Bank Account: \`DEMO-BANK-000001\`
   - **Telemetry**: Injected 4.85 BTC of illicit capital into the mempool with synthetic KYC profile credentials.

2. **Aditi Sharma** (\`M002\`) — **Mule A (First Cut Intermediary)**
   - **Wallet**: \`bc1qbitflowdemo0002synthetic\`
   - **Risk Score**: \`96/100\` (HIGH THREAT)
   - **Telemetry**: Peels 3.09% commission (0.15 BTC) and forwards 4.70 BTC in under 42 seconds.

3. **Vikram Patel** (\`M008\`) — **Mule F (Terminal Cashout Node)**
   - **Wallet**: \`bc1qbitflowdemo0008synthetic\`
   - **Risk Score**: \`99/100\` (CRITICAL)
   - **Telemetry**: Terminal exit off-ramp attempting fiat withdrawal via unverified offshore banking IFSC \`DEMO-IFSC-00008\`.

4. **Intermediary Layering Nodes**:
   - \`M003\` (Rohan Verma): 94% Risk | \`bc1qbitflowdemo0003synthetic\`
   - \`M004\` (Priya Nair): 95% Risk | \`bc1qbitflowdemo0004synthetic\`
   - \`M005\` (Rajesh Gupta): 92% Risk | \`bc1qbitflowdemo0005synthetic\`

🛡️ **Actionable Directive**: Cryptographic asset freeze orders and FinCEN SAR drafts are queued for \`M001\`, \`M002\`, and \`M008\`.`;

    return {
      text,
      entities: extractEntities(text),
      engine: "BitFlow SOC Heuristic Engine",
    };
  }

  // 2. Threat Alerts / Latest Alert
  if (
    q.includes("threat") ||
    q.includes("alert") ||
    q.includes("latest threat") ||
    q.includes("warning")
  ) {
    const text = `### ⚠️ Active Network Threat Alerts & Anomaly Telemetry

The BitFlow Watcher Engine currently reports **3 active trigger conditions**:

- 🐋 **CRITICAL: Whale Transfer Anomaly**
  - **Transaction**: \`f19c82d4b8e21a4f78310c9b0e91da72\`
  - **Magnitude**: **124.50 BTC ($10,240,000 USD)**
  - **Routing**: Broadcasted from unhosted clustering wallet to a multi-signature escrow with 0 confirmations.
  - **Risk Assessment**: High-risk concentration shift. Automated taint tracing initiated.

- ⚡ **HIGH: Mempool Fee Spike Warning**
  - **Status**: Current priority fee rate is **38 sat/vB** (threshold: 35 sat/vB).
  - **Driver**: Surge in Ordinals inscriptions and inscription batched inputs occupying block weight.
  - **Impact**: Standard transfer latency extended to 25+ minutes for sub-20 sat/vB fee rates.

- 📦 **MEDIUM: Mempool Saturation**
  - **Memory Usage**: **294 MB** (88% of standard 300 MB limit).
  - **Backlog**: **18,450 unconfirmed transactions** queued in memory pool.

All configured rules are actively dispatching automated webhooks to the SOC dashboard.`;

    return {
      text,
      entities: extractEntities(text),
      engine: "BitFlow SOC Watcher Telemetry",
    };
  }

  // 3. Transaction Volume & Mempool Metrics
  if (
    q.includes("volume") ||
    q.includes("mempool") ||
    q.includes("check transaction") ||
    q.includes("fee") ||
    q.includes("rate") ||
    q.includes("tps")
  ) {
    const text = `### 📊 Mempool & Transaction Volume Intelligence

Summary of live network throughput and partition telemetry:

- **Total Tracked Volume**: **512.45 BTC** (~**$42,533,350 USD**) across **100 monitored accounts**
- 🚨 **Illicit / Scammer Volume**: **124.80 BTC** (**24.35%** of network volume)
  - Concentrated across 8 flagged peeling nodes
  - Average transfer velocity: **< 48 seconds per hop**
- 🛡️ **Verified Genuine Volume**: **387.65 BTC** (**75.65%** of network volume)
  - Distributed across 92 KYC-verified accounts
  - Median confirmation time: **14.2 minutes**
- ⚙️ **Mempool Health Metrics**:
  - **Current Block Height**: #912,345
  - **Median Fee Rate**: **28 sat/vB** (Low Priority: 14 sat/vB, Instant: 42 sat/vB)
  - **Pending Transactions**: ~18,450 in mempool
  - **Daily Whale Transfers (>10 BTC)**: 14 identified in the last 24h cycle`;

    return {
      text,
      entities: extractEntities(text),
      engine: "BitFlow Ledger Analytics Engine",
    };
  }

  // 4. Peeling Chain & Laundering Mechanism
  if (
    q.includes("peeling") ||
    q.includes("chain") ||
    q.includes("laundering") ||
    q.includes("trace") ||
    q.includes("how does")
  ) {
    const text = `### 🕸️ Multi-Hop Peeling Chain Scam Mechanism Explained

A **Peeling Chain** is an automated laundering strategy that divides large illicit funds across a cascade of intermediary accounts to evade transaction monitoring:

1. **Origin Injection**: \`M001\` (Aarav Kumar) broadcasts **4.85 BTC** from an unhosted address \`bc1qbitflowdemo0001synthetic\`.
2. **Hop 1 — First Peel**: \`M002\` (Aditi Sharma) intercepts the flow, peels off **0.15 BTC (3.09%)** to wallet \`bc1qbitflowdemo0002synthetic\`, and relays **4.70 BTC** in 42 seconds.
3. **Hop 2 to 5 — Layering Relay**:
   - \`M003\` receives 4.70 BTC → peels 0.15 BTC → relays 4.55 BTC
   - \`M004\` receives 4.55 BTC → peels 0.15 BTC → relays 4.40 BTC
   - \`M005\` receives 4.40 BTC → peels 0.20 BTC → relays 4.20 BTC
   - \`M006\` receives 4.20 BTC → peels 0.20 BTC → relays 4.00 BTC
4. **Terminal Off-Ramp**: \`M008\` (Vikram Patel, \`bc1qbitflowdemo0008synthetic\`) attempts fiat liquidation through \`DEMO-BANK-000008\`.

BitFlow detects this pattern autonomously via **forwarding velocity (<60s)**, **fixed peeling fee delta**, and **synthetic Aadhaar/PAN discrepancy correlation**.`;

    return {
      text,
      entities: extractEntities(text),
      engine: "BitFlow Graph Forensics Engine",
    };
  }

  // 5. Specific Member Inspection (e.g. M001, Aarav, etc.)
  const memberMatch = q.match(/m0[0-9]{2}/i);
  if (memberMatch) {
    const memId = memberMatch[0].toUpperCase();
    const mem = SEED_MEMBERS.find((m) => m.memberId.toUpperCase() === memId);
    if (mem) {
      const isFlagged = ["M001", "M002", "M003", "M004", "M005", "M006", "M007", "M008"].includes(mem.memberId);
      const text = `### 👤 Forensic Dossier: ${mem.name} (\`${mem.memberId}\`)

- **Classification**: **${isFlagged ? "🚨 FLAGGED MONEY MULE / SCAMMER" : "🛡️ VERIFIED GENUINE ACCOUNT"}**
- **Wallet Address**: \`${mem.btcWalletAddress}\`
- **Sender Address**: \`${mem.senderAddress}\`
- **Bank Account**: \`${mem.accountId}\` | IFSC: \`${mem.routingRef}\`
- **KYC Status**: \`${mem.kycStatus}\` (${mem.idProofType} Ref: \`${mem.syntheticIdRef}\`)
- **Location**: ${mem.city}, ${mem.country} | Age: ${mem.age} | Occupation: ${mem.occupation}
- **Account Type**: \`${mem.accountType}\` (${mem.custodyModel})
- **Account Status**: \`${mem.accountStatus}\`
- **Nominee Details**: ${mem.nomineeName} (${mem.nomineeRelationship}) — \`${mem.nomineePhone}\`

${isFlagged ? "⚠️ **Risk Summary**: High velocity forwarding detected with synthetic identification anomalies. Immediate freeze protocol recommended." : "✅ **Compliance Note**: Normal transaction frequency and verified identification credentials."}`;

      return {
        text,
        entities: extractEntities(text),
        engine: "BitFlow Entity Intelligence",
      };
    }
  }

  // 6. Default Fallback Assistance
  const text = `### 🤖 BitFlow AI SOC Cyber Intelligence Assistant

I am connected to the **BitFlow Real-Time Forensic Ledger & Mempool Monitor**.

**What would you like to investigate?**
- 🚨 **High-Risk Wallets**: Ask *"Summarize high-risk wallets"* or *"Who is M001?"*
- ⚠️ **Threat Alerts**: Ask *"Explain latest threat alert"* or *"Show mempool warnings"*
- 📊 **Transaction Volume**: Ask *"Check transaction volume"* or *"Compare scammer vs genuine volume"*
- 🕸️ **Peeling Chains**: Ask *"How does the peeling chain scam work?"*
- 🔍 **Mempool Status**: Ask *"What is the current fee rate?"*

Use the quick-prompt chips above or type any question to begin.`;

  return {
    text,
    entities: extractEntities(text),
    engine: "BitFlow Autonomous Forensic Core",
  };
}
