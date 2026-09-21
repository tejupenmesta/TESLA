import { POSTGRESQL_TABLES_METADATA, TableDefinition } from "./schema";
import {
  SEED_MEMBERS,
  SEED_TRANSACTIONS,
  SEED_SUSPICIOUS_FLOWS,
  DemoMember,
  DemoTransaction,
  SuspiciousFlow,
} from "../data/seedData";
import bcrypt from "bcryptjs";

// =============================================================================
// Interfaces for the 14 PostgreSQL Tables
// =============================================================================

export interface UserRow {
  id: string;
  email: string;
  username: string;
  hashed_password: string;
  full_name: string;
  avatar_url?: string | null;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberRow {
  id: string;
  member_id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  occupation?: string | null;
  annual_income_inr?: number | null;
  profile_status: "Active" | "Review" | "Suspended";
  kyc_status: "Verified" | "Pending" | "Flagged";
  synthetic_id_ref?: string | null;
  nominee_name?: string | null;
  nominee_relation?: string | null;
  risk_rating: "Low" | "Medium" | "High" | "Critical";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AccountRow {
  id: string;
  account_number: string;
  member_id: string;
  bank_name: string;
  account_type: string;
  ifsc_code: string;
  branch: string;
  balance_fiat: number;
  currency: string;
  status: "Active" | "Frozen" | "Closed" | "Restricted";
  daily_limit_fiat: number;
  created_at: string;
  updated_at: string;
}

export interface WalletRow {
  id: string;
  address: string;
  member_id: string;
  account_id?: string | null;
  label?: string | null;
  wallet_type: string;
  balance_btc: number;
  unconfirmed_btc: number;
  total_received_btc: number;
  total_sent_btc: number;
  tx_count: number;
  derivation_path: string;
  is_active: boolean;
  is_flagged: boolean;
  last_activity_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  tx_id: string;
  tx_hash?: string | null;
  member_id?: string | null;
  wallet_id?: string | null;
  sender_name: string;
  sender_address: string;
  receiver_address: string;
  receiver_name: string;
  amount_btc: number;
  amount_usd: number;
  network_fee_btc: number;
  fee_rate_sat_vb: number;
  vsize: number;
  confirmations: number;
  block_height?: number | null;
  payment_phase: string;
  payment_status: string;
  direction: "Incoming" | "Outgoing" | "Internal";
  tx_type: string;
  mempool_status: string;
  is_whale: boolean;
  whale_tier?: string | null;
  risk_flag: "Normal" | "Review" | "High Risk" | "Critical";
  risk_score: number;
  ai_interpretation?: string | null;
  ai_decision_note?: string | null;
  raw_tx_data: Record<string, unknown>;
  created_at: string;
  confirmed_at?: string | null;
  updated_at: string;
}

export interface RiskAssessmentRow {
  id: string;
  transaction_id: string;
  wallet_address: string;
  composite_score: number;
  risk_tier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  velocity_score: number;
  amount_anomaly_score: number;
  fan_in_out_score: number;
  peeling_chain_score: number;
  counterparty_risk_score: number;
  heuristic_flags: string[];
  ml_isolation_score: number;
  confidence_pct: number;
  summary: string;
  decision_reasoning: string;
  assessed_by: string;
  created_at: string;
}

export interface WalletFeatureRow {
  id: string;
  wallet_address: string;
  inflow_btc_24h: number;
  outflow_btc_24h: number;
  tx_count_24h: number;
  inflow_btc_7d: number;
  outflow_btc_7d: number;
  tx_count_7d: number;
  avg_holding_duration_sec: number;
  unique_counterparties_count: number;
  velocity_zscore: number;
  amount_zscore: number;
  fan_in_ratio: number;
  fan_out_ratio: number;
  rapid_forwarding_rate: number;
  cluster_affinity_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  last_calculated_at: string;
}

export interface NetworkEdgeRow {
  id: string;
  transaction_id?: string | null;
  source_wallet: string;
  target_wallet: string;
  source_member_id?: string | null;
  target_member_id?: string | null;
  amount_btc: number;
  amount_usd: number;
  hop_order: number;
  flow_type: string;
  is_cycle: boolean;
  latency_seconds?: number | null;
  created_at: string;
}

export interface NetworkClusterRow {
  id: string;
  cluster_name: string;
  cluster_type: string;
  root_wallet: string;
  wallet_count: number;
  transaction_count: number;
  total_volume_btc: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  associated_member_ids: string[];
  heuristic_signature: string;
  detected_at: string;
  updated_at: string;
}

export interface AlertRow {
  id: string;
  alert_code: string;
  title: string;
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risk_score: number;
  status: "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";
  wallet_address: string;
  transaction_id?: string | null;
  flow_summary?: string | null;
  reasons: string[];
  dedup_count: number;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
  last_event_at: string;
  created_at: string;
  updated_at: string;
}

export interface InvestigationRow {
  id: string;
  case_number: string;
  title: string;
  target_wallet: string;
  target_member_id?: string | null;
  target_tx_id?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lead_analyst: string;
  lead_analyst_id?: string | null;
  risk_score: number;
  detected_patterns: string[];
  findings: string;
  conclusion?: string | null;
  evidence_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
}

export interface InvestigationEventRow {
  id: string;
  investigation_id: string;
  event_type: string;
  description: string;
  severity: "info" | "warning" | "critical";
  analyst_name: string;
  analyst_id?: string | null;
  evidence_reference?: string | null;
  event_payload: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id?: string | null;
  username: string;
  action: string;
  resource: string;
  resource_id?: string | null;
  details?: string | null;
  ip_address: string;
  user_agent?: string | null;
  created_at: string;
}

export interface DataImportRow {
  id: string;
  import_code: string;
  filename: string;
  file_type: string;
  records_found: number;
  records_imported: number;
  duplicates_count: number;
  invalid_count: number;
  status: string;
  file_size_bytes?: number | null;
  checksum_sha256?: string | null;
  imported_by: string;
  imported_at: string;
}

// =============================================================================
// PostgreSQL Relational Database Engine
// =============================================================================

export class PostgresEngine {
  // 14 relational tables in-memory store
  users: Map<string, UserRow> = new Map();
  members: Map<string, MemberRow> = new Map();
  accounts: Map<string, AccountRow> = new Map();
  wallets: Map<string, WalletRow> = new Map();
  transactions: Map<string, TransactionRow> = new Map();
  risk_assessments: Map<string, RiskAssessmentRow> = new Map();
  wallet_features: Map<string, WalletFeatureRow> = new Map();
  network_edges: Map<string, NetworkEdgeRow> = new Map();
  network_clusters: Map<string, NetworkClusterRow> = new Map();
  alerts: Map<string, AlertRow> = new Map();
  investigations: Map<string, InvestigationRow> = new Map();
  investigation_events: Map<string, InvestigationEventRow> = new Map();
  audit_logs: Map<string, AuditLogRow> = new Map();
  data_imports: Map<string, DataImportRow> = new Map();

  private initializedAt: string = new Date().toISOString();

  constructor() {
    this.seedDatabase();
  }

  // Populate all 14 tables with relational synthetic data
  public seedDatabase(): void {
    this.clearAll();
    this.seedUsers();
    this.seedMembers();
    this.seedAccounts();
    this.seedWallets();
    this.seedTransactions();
    this.seedRiskAssessments();
    this.seedWalletFeatures();
    this.seedNetworkEdgesAndClusters();
    this.seedAlerts();
    this.seedInvestigations();
    this.seedDataImports();
    this.seedAuditLogs();
  }

  private clearAll(): void {
    this.users.clear();
    this.members.clear();
    this.accounts.clear();
    this.wallets.clear();
    this.transactions.clear();
    this.risk_assessments.clear();
    this.wallet_features.clear();
    this.network_edges.clear();
    this.network_clusters.clear();
    this.alerts.clear();
    this.investigations.clear();
    this.investigation_events.clear();
    this.audit_logs.clear();
    this.data_imports.clear();
  }

  private seedUsers(): void {
    const salt = bcrypt.genSaltSync(10);
    const usersList: UserRow[] = [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
        email: "admin@bitflow.soc",
        username: "admin_soc",
        hashed_password: bcrypt.hashSync("Admin@123", salt),
        full_name: "Chief SOC Commander",
        role: "ADMIN",
        is_active: true,
        is_verified: true,
        is_superuser: true,
        last_login_at: new Date().toISOString(),
        created_at: "2026-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: "a1b2c3d4-e5f6-7890-abcd-222222222222",
        email: "analyst@bitflow.soc",
        username: "lead_analyst",
        hashed_password: bcrypt.hashSync("Analyst@123", salt),
        full_name: "Senior AML Detective",
        role: "ANALYST",
        is_active: true,
        is_verified: true,
        is_superuser: false,
        last_login_at: new Date().toISOString(),
        created_at: "2026-01-15T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: "a1b2c3d4-e5f6-7890-abcd-333333333333",
        email: "viewer@bitflow.soc",
        username: "auditor_guest",
        hashed_password: bcrypt.hashSync("Viewer@123", salt),
        full_name: "Compliance Auditor",
        role: "VIEWER",
        is_active: true,
        is_verified: false,
        is_superuser: false,
        last_login_at: new Date().toISOString(),
        created_at: "2026-02-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
    ];

    for (const u of usersList) {
      this.users.set(u.id, u);
    }
  }

  private seedMembers(): void {
    for (const m of SEED_MEMBERS) {
      const id = `mem-${m.memberId.toLowerCase()}`;
      const row: MemberRow = {
        id,
        member_id: m.memberId,
        user_id: null,
        name: m.name,
        email: m.email,
        phone: m.phone,
        age: m.age,
        gender: null,
        city: m.city,
        state: null,
        country: m.country || "India",
        occupation: m.occupation,
        annual_income_inr: 750000.0,
        profile_status: m.profileStatus === "Under Review" ? "Review" : "Active",
        kyc_status: m.kycStatus === "Verified (Synthetic)" ? "Verified" : "Pending",
        synthetic_id_ref: m.syntheticIdRef,
        nominee_name: m.nomineeName,
        nominee_relation: m.nomineeRelationship,
        risk_rating: m.profileStatus === "Under Review" ? "High" : m.age > 60 ? "Medium" : "Low",
        metadata: {
          originalDemoRecord: true,
          initialRegistrationDate: "2026-08-01",
        },
        created_at: "2026-08-01T09:00:00Z",
        updated_at: "2026-08-01T09:00:00Z",
      };
      this.members.set(id, row);
    }
  }

  private seedAccounts(): void {
    for (const m of SEED_MEMBERS) {
      const memberDbId = `mem-${m.memberId.toLowerCase()}`;
      const id = `acc-${m.memberId.toLowerCase()}`;
      const row: AccountRow = {
        id,
        account_number: m.accountId,
        member_id: memberDbId,
        bank_name: "BitFlow Treasury Bank",
        account_type: "Savings",
        ifsc_code: "BITF0001928",
        branch: `${m.city || "Central"} Branch`,
        balance_fiat: 500000.0,
        currency: "INR",
        status: m.profileStatus === "Under Review" ? "Restricted" : "Active",
        daily_limit_fiat: 1000000.0,
        created_at: "2026-08-01T09:00:00Z",
        updated_at: "2026-08-01T09:00:00Z",
      };
      this.accounts.set(id, row);
    }
  }

  private seedWallets(): void {
    for (const m of SEED_MEMBERS) {
      const memberDbId = `mem-${m.memberId.toLowerCase()}`;
      const accountDbId = `acc-${m.memberId.toLowerCase()}`;
      const id = `wal-${m.memberId.toLowerCase()}`;

      // Calculate balance from seed transactions
      const incomingTxs = SEED_TRANSACTIONS.filter((t) => t.receiverAddress === m.btcWalletAddress);
      const outgoingTxs = SEED_TRANSACTIONS.filter((t) => t.senderAddress === m.btcWalletAddress);
      const totalIn = incomingTxs.reduce((sum, t) => sum + t.amountBtc, 0);
      const totalOut = outgoingTxs.reduce((sum, t) => sum + t.amountBtc + t.networkFeeBtc, 0);
      const bal = Math.max(0.01, Number((totalIn - totalOut + 5.0).toFixed(6)));

      const row: WalletRow = {
        id,
        address: m.btcWalletAddress,
        member_id: memberDbId,
        account_id: accountDbId,
        label: `${m.name}'s Primary BTC Vault`,
        wallet_type: "SegWit (Native)",
        balance_btc: bal,
        unconfirmed_btc: 0.0,
        total_received_btc: Number(totalIn.toFixed(6)),
        total_sent_btc: Number(totalOut.toFixed(6)),
        tx_count: incomingTxs.length + outgoingTxs.length,
        derivation_path: "m/84'/0'/0'/0/0",
        is_active: true,
        is_flagged: m.profileStatus === "Under Review",
        last_activity_at: "2026-08-15T14:30:00Z",
        created_at: "2026-08-01T09:00:00Z",
        updated_at: "2026-08-15T14:30:00Z",
      };
      this.wallets.set(id, row);
    }
  }

  private seedTransactions(): void {
    for (const tx of SEED_TRANSACTIONS) {
      const member = SEED_MEMBERS.find((m) => m.memberId === tx.memberId);
      const memberDbId = member ? `mem-${member.memberId.toLowerCase()}` : null;
      const wallet = Array.from(this.wallets.values()).find((w) => w.address === tx.senderAddress);
      const walletDbId = wallet ? wallet.id : null;

      const row: TransactionRow = {
        id: `tx-${tx.id.toLowerCase()}`,
        tx_id: tx.id,
        tx_hash: `0000000000000000${tx.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().padEnd(48, "0")}`,
        member_id: memberDbId,
        wallet_id: walletDbId,
        sender_name: tx.senderName,
        sender_address: tx.senderAddress,
        receiver_address: tx.receiverAddress,
        receiver_name: tx.receiverName,
        amount_btc: tx.amountBtc,
        amount_usd: tx.amountUsd,
        network_fee_btc: tx.networkFeeBtc,
        fee_rate_sat_vb: tx.feeRateSatVb,
        vsize: tx.vsize,
        confirmations: tx.confirmations,
        block_height: tx.blockHeight,
        payment_phase: tx.paymentPhase,
        payment_status: tx.paymentStatus,
        direction: tx.direction as any,
        tx_type: tx.txType,
        mempool_status: tx.mempoolStatus,
        is_whale: tx.isWhale,
        whale_tier: tx.whaleTier,
        risk_flag: tx.riskFlag as any,
        risk_score: tx.riskScore,
        ai_interpretation: tx.aiInterpretation,
        ai_decision_note: tx.aiDecisionNote,
        raw_tx_data: {
          seedId: tx.id,
          date: tx.date,
          time: tx.time,
        },
        created_at: `${tx.date}T${tx.time}Z`,
        confirmed_at: `${tx.date}T${tx.time}Z`,
        updated_at: `${tx.date}T${tx.time}Z`,
      };
      this.transactions.set(row.id, row);
    }
  }

  private seedRiskAssessments(): void {
    for (const tx of this.transactions.values()) {
      const riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =
        tx.risk_score >= 75
          ? "CRITICAL"
          : tx.risk_score >= 50
          ? "HIGH"
          : tx.risk_score >= 25
          ? "MEDIUM"
          : "LOW";

      const heuristicFlags: string[] = [];
      if (tx.is_whale) heuristicFlags.push("WHALE_TRANSFER_THRESHOLD_EXCEEDED");
      if (tx.fee_rate_sat_vb > 35) heuristicFlags.push("ANOMALOUS_MINER_FEE_BURST");
      if (tx.risk_score >= 70) heuristicFlags.push("MULTI_HOP_PEELING_SEQUENCE");
      if (tx.risk_flag === "Review") heuristicFlags.push("COUNTERPARTY_SUSPICIOUS_STANDING");

      const row: RiskAssessmentRow = {
        id: `ra-${tx.id}`,
        transaction_id: tx.id,
        wallet_address: tx.sender_address,
        composite_score: tx.risk_score,
        risk_tier: riskTier,
        velocity_score: Math.min(100, Math.round(tx.risk_score * 0.9)),
        amount_anomaly_score: tx.is_whale ? 90 : Math.round(tx.risk_score * 0.7),
        fan_in_out_score: tx.risk_score > 60 ? 80 : 15,
        peeling_chain_score: tx.risk_score > 70 ? 85 : 10,
        counterparty_risk_score: tx.risk_score > 50 ? 65 : 20,
        heuristic_flags: heuristicFlags,
        ml_isolation_score: Number((tx.risk_score / 100).toFixed(4)),
        confidence_pct: 95,
        summary: tx.ai_interpretation || "Standard transaction volume within normal statistical profile.",
        decision_reasoning: tx.ai_decision_note || "Algorithmic confirmation and balance velocity verified against peer group.",
        assessed_by: "BitFlow-AI-HeuristicEngine-v3",
        created_at: tx.created_at,
      };
      this.risk_assessments.set(row.id, row);
    }
  }

  private seedWalletFeatures(): void {
    for (const w of this.wallets.values()) {
      const walletTxs = Array.from(this.transactions.values()).filter(
        (t) => t.sender_address === w.address || t.receiver_address === w.address
      );
      const isHighRisk = w.is_flagged || walletTxs.some((t) => t.risk_score >= 70);

      const row: WalletFeatureRow = {
        id: `wf-${w.id}`,
        wallet_address: w.address,
        inflow_btc_24h: Number((w.total_received_btc * 0.15).toFixed(4)),
        outflow_btc_24h: Number((w.total_sent_btc * 0.15).toFixed(4)),
        tx_count_24h: Math.max(1, Math.round(walletTxs.length * 0.2)),
        inflow_btc_7d: w.total_received_btc,
        outflow_btc_7d: w.total_sent_btc,
        tx_count_7d: walletTxs.length,
        avg_holding_duration_sec: isHighRisk ? 120 : 86400 * 3,
        unique_counterparties_count: Math.max(2, walletTxs.length),
        velocity_zscore: isHighRisk ? 3.42 : 0.45,
        amount_zscore: w.balance_btc > 10 ? 2.85 : 0.2,
        fan_in_ratio: isHighRisk ? 0.85 : 0.1,
        fan_out_ratio: isHighRisk ? 0.75 : 0.15,
        rapid_forwarding_rate: isHighRisk ? 0.92 : 0.05,
        cluster_affinity_score: isHighRisk ? 88 : 12,
        risk_level: isHighRisk ? "HIGH" : "LOW",
        last_calculated_at: new Date().toISOString(),
      };
      this.wallet_features.set(row.id, row);
    }
  }

  private seedNetworkEdgesAndClusters(): void {
    let edgeIdx = 1;
    for (const tx of this.transactions.values()) {
      const isMultiHop = tx.risk_score >= 70;
      const row: NetworkEdgeRow = {
        id: `edge-${String(edgeIdx).padStart(4, "0")}`,
        transaction_id: tx.id,
        source_wallet: tx.sender_address,
        target_wallet: tx.receiver_address,
        source_member_id: tx.member_id ? tx.member_id.replace("mem-", "").toUpperCase() : null,
        target_member_id: null,
        amount_btc: tx.amount_btc,
        amount_usd: tx.amount_usd,
        hop_order: isMultiHop ? (edgeIdx % 4) + 1 : 1,
        flow_type: isMultiHop ? "PEELING_CHAIN" : tx.is_whale ? "RAPID_FORWARD" : "DIRECT",
        is_cycle: tx.risk_score >= 85 && edgeIdx % 5 === 0,
        latency_seconds: isMultiHop ? 90 : 3600,
        created_at: tx.created_at,
      };
      this.network_edges.set(row.id, row);
      edgeIdx++;
    }

    // Seed 4 suspicious network clusters
    const clusters: NetworkClusterRow[] = [
      {
        id: "clu-001",
        cluster_name: "Syndicate Alpha - 4-Hop Peeling Chain",
        cluster_type: "MULTI_HOP_SYNDICATE",
        root_wallet: "bc1qexample001syntheticbitcoindemo",
        wallet_count: 5,
        transaction_count: 8,
        total_volume_btc: 12.45,
        risk_level: "CRITICAL",
        associated_member_ids: ["M001", "M002", "M003", "M010"],
        heuristic_signature: "PEELING_SHA256_ALPHA_9918",
        detected_at: "2026-08-10T12:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: "clu-002",
        cluster_name: "Fan-In Aggregation Hub Beta",
        cluster_type: "CONVERGENCE_HUB",
        root_wallet: "bc1qexample025syntheticbitcoindemo",
        wallet_count: 6,
        transaction_count: 14,
        total_volume_btc: 8.92,
        risk_level: "CRITICAL",
        associated_member_ids: ["M025", "M026", "M027", "M028"],
        heuristic_signature: "FANIN_SHA256_BETA_3301",
        detected_at: "2026-08-11T14:30:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: "clu-003",
        cluster_name: "Circular Wash Trading Loop Gamma",
        cluster_type: "CIRCULAR_WASH",
        root_wallet: "bc1qexample040syntheticbitcoindemo",
        wallet_count: 4,
        transaction_count: 11,
        total_volume_btc: 15.3,
        risk_level: "HIGH",
        associated_member_ids: ["M040", "M041", "M042"],
        heuristic_signature: "CYCLE_SHA256_GAMMA_8812",
        detected_at: "2026-08-12T16:45:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: "clu-004",
        cluster_name: "Rapid Dispersal Funnel Delta",
        cluster_type: "RAPID_DISPERSAL",
        root_wallet: "bc1qexample015syntheticbitcoindemo",
        wallet_count: 5,
        transaction_count: 9,
        total_volume_btc: 6.84,
        risk_level: "HIGH",
        associated_member_ids: ["M015", "M016", "M017"],
        heuristic_signature: "FANOUT_SHA256_DELTA_1129",
        detected_at: "2026-08-13T10:15:00Z",
        updated_at: new Date().toISOString(),
      },
    ];

    for (const c of clusters) {
      this.network_clusters.set(c.id, c);
    }
  }

  private seedAlerts(): void {
    const alertsList: AlertRow[] = [
      {
        id: "alt-001",
        alert_code: "ALT-9001",
        title: "SUSPICIOUS TRANSACTION NETWORK DETECTED",
        alert_type: "NETWORK_CONVERGENCE",
        severity: "CRITICAL",
        risk_score: 94,
        status: "NEW",
        wallet_address: "bc1qexample001syntheticbitcoindemo",
        transaction_id: "tx-demo-tx-001-bitflow",
        flow_summary: "X → A → B → C → F (4 Hops, 3.42 BTC forwarded)",
        reasons: [
          "Multi-hop relay with minimal holding time (< 90 seconds)",
          "Destination account flagged for Review status",
          "Layering signature detected matching peeling chain heuristics",
        ],
        dedup_count: 3,
        last_event_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "alt-002",
        alert_code: "ALT-9002",
        title: "RAPID FUND FORWARDING ANOMALY",
        alert_type: "RAPID_FORWARDING",
        severity: "HIGH",
        risk_score: 88,
        status: "INVESTIGATING",
        wallet_address: "bc1qexample010syntheticbitcoindemo",
        transaction_id: "tx-demo-tx-010-bitflow",
        flow_summary: "Received 1.25 BTC → Forwarded 1.20 BTC in 90 seconds",
        reasons: [
          "Forwarding ratio: 96%",
          "Time difference: 90 seconds",
          "Sudden velocity spike from historically low frequency account",
        ],
        dedup_count: 1,
        last_event_at: new Date(Date.now() - 300000).toISOString(),
        created_at: new Date(Date.now() - 300000).toISOString(),
        updated_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "alt-003",
        alert_code: "ALT-9003",
        title: "POTENTIAL FAN-IN CONCENTRATION PATTERN",
        alert_type: "FAN_IN",
        severity: "CRITICAL",
        risk_score: 91,
        status: "NEW",
        wallet_address: "bc1qexample025syntheticbitcoindemo",
        transaction_id: "tx-demo-tx-025-bitflow",
        flow_summary: "5 Source Wallets → 1 Destination (5.82 BTC)",
        reasons: [
          "5 distinct counterparty wallets funneled into single address within 10 minutes",
          "Aggregated total exceeds 5 BTC threshold",
          "Receiver profile under AML review",
        ],
        dedup_count: 5,
        last_event_at: new Date(Date.now() - 720000).toISOString(),
        created_at: new Date(Date.now() - 720000).toISOString(),
        updated_at: new Date(Date.now() - 720000).toISOString(),
      },
      {
        id: "alt-004",
        alert_code: "ALT-9004",
        title: "WHALE SPIKE & RAPID DISPERSION",
        alert_type: "FAN_OUT",
        severity: "HIGH",
        risk_score: 82,
        status: "ACKNOWLEDGED",
        wallet_address: "bc1qexample050syntheticbitcoindemo",
        transaction_id: "tx-demo-tx-050-bitflow",
        flow_summary: "1 Whale Deposit → Dispersed into 8 micro-outputs",
        reasons: [
          "Smurfing / structuring indicator flagged by Isolation Forest",
          "High transaction fee paid to expedite block inclusion",
        ],
        dedup_count: 2,
        acknowledged_by: "a1b2c3d4-e5f6-7890-abcd-222222222222",
        acknowledged_at: new Date(Date.now() - 600000).toISOString(),
        last_event_at: new Date(Date.now() - 1200000).toISOString(),
        created_at: new Date(Date.now() - 1200000).toISOString(),
        updated_at: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: "alt-005",
        alert_code: "ALT-9005",
        title: "CIRCULAR VALUE FLOW DETECTED",
        alert_type: "CIRCULAR_FLOW",
        severity: "HIGH",
        risk_score: 79,
        status: "NEW",
        wallet_address: "bc1qexample040syntheticbitcoindemo",
        transaction_id: "tx-demo-tx-040-bitflow",
        flow_summary: "A → B → C → A (Cycle length 3, 2.15 BTC net flow)",
        reasons: [
          "Cycle loop identified across 3 intermediate addresses",
          "Artificial volume inflation / wash transaction pattern",
        ],
        dedup_count: 4,
        last_event_at: new Date(Date.now() - 1800000).toISOString(),
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    for (const a of alertsList) {
      this.alerts.set(a.id, a);
    }
  }

  private seedInvestigations(): void {
    const invId = "inv-001";
    const caseRow: InvestigationRow = {
      id: invId,
      case_number: "INV-2026-001",
      title: "Syndicate Alpha: 4-Hop Multi-Account Peeling Chain Investigation",
      target_wallet: "bc1qexample001syntheticbitcoindemo",
      target_member_id: "M001",
      target_tx_id: "DEMO-TX-001-BITFLOW",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      lead_analyst: "Senior AML Detective",
      lead_analyst_id: "a1b2c3d4-e5f6-7890-abcd-222222222222",
      risk_score: 94,
      detected_patterns: [
        "Multi-Hop Relay (< 90s latency)",
        "Rapid Forwarding (96% volume)",
        "Counterparty Profile Flagged",
        "Layering / Peeling Chain",
      ],
      findings:
        "Subject wallet bc1qexample001 synthetic account initiated a rapid series of transfers through M002, M003, and M010 with less than 2 minutes holding time per hop. 3.42 BTC was layered into external addresses. Nominee KYC cross-checks show common IP addresses across 3 member profiles.",
      conclusion: "Recommend freezing connected accounts and filing SAR report to compliance authorities.",
      evidence_payload: {
        totalHops: 4,
        aggregatedBtc: 3.42,
        involvedMembers: ["M001", "M002", "M003", "M010"],
      },
      created_at: "2026-08-12T10:00:00Z",
      updated_at: new Date().toISOString(),
    };
    this.investigations.set(invId, caseRow);

    const events: InvestigationEventRow[] = [
      {
        id: "inve-001",
        investigation_id: invId,
        event_type: "ALERT_LINKED",
        description: "Case automatically provisioned from critical alert ALT-9001 (Multi-hop relay detection).",
        severity: "critical",
        analyst_name: "BitFlow Threat Engine",
        created_at: "2026-08-12T10:00:00Z",
        event_payload: { alertId: "ALT-9001" },
      },
      {
        id: "inve-002",
        investigation_id: invId,
        event_type: "NOTE",
        description: "Lead Analyst assigned to case. Queried KYC registry for M001 and connected counterparty M002.",
        severity: "info",
        analyst_name: "Senior AML Detective",
        created_at: "2026-08-12T10:30:00Z",
        event_payload: {},
      },
      {
        id: "inve-003",
        investigation_id: invId,
        event_type: "EVIDENCE_ADDED",
        description: "Graph traversal confirmed 4-hop chain X -> A -> B -> C -> F. Peeling chain layering confirmed.",
        severity: "warning",
        analyst_name: "Senior AML Detective",
        created_at: "2026-08-12T11:15:00Z",
        evidence_reference: "CYTOSCAPE-GRAPH-SNAPSHOT-ALPHA-01",
        event_payload: {},
      },
    ];

    for (const ev of events) {
      this.investigation_events.set(ev.id, ev);
    }
  }

  private seedDataImports(): void {
    const imports: DataImportRow[] = [
      {
        id: "imp-001",
        import_code: "IMP-INIT-001",
        filename: "BitFlow_100_Members_Profile_Accounts_KYC_Nominee_Demo.xlsx",
        file_type: "XLSX",
        records_found: 100,
        records_imported: 100,
        duplicates_count: 0,
        invalid_count: 0,
        status: "SUCCESS",
        file_size_bytes: 48320,
        checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        imported_by: "System Initialization Routine",
        imported_at: "2026-08-01T09:00:00Z",
      },
      {
        id: "imp-002",
        import_code: "IMP-INIT-002",
        filename: "BitFlow_100_Members_All_Transactions_Demo.xlsx",
        file_type: "XLSX",
        records_found: 100,
        records_imported: 100,
        duplicates_count: 0,
        invalid_count: 0,
        status: "SUCCESS",
        file_size_bytes: 62450,
        checksum_sha256: "84d89877f0d4041efb6bf91a16f0248f2fd573e6af05c19f96bedb9f882f7882",
        imported_by: "System Initialization Routine",
        imported_at: "2026-08-01T09:15:00Z",
      },
    ];

    for (const imp of imports) {
      this.data_imports.set(imp.id, imp);
    }
  }

  private seedAuditLogs(): void {
    const logs: AuditLogRow[] = [
      {
        id: "aud-001",
        username: "system_kernel",
        action: "DATABASE_INITIALIZED",
        resource: "POSTGRESQL_ENGINE",
        details: "BitFlow 14 PostgreSQL tables successfully provisioned with constraints, indexes, and synthetic seeds.",
        ip_address: "127.0.0.1",
        created_at: "2026-08-01T09:00:00Z",
      },
      {
        id: "aud-002",
        username: "admin_soc",
        action: "SYSTEM_BOOT",
        resource: "SOC_PLATFORM",
        details: "Cyber Threat Intelligence platform online. Real-time telemetry listening on /ws/live.",
        ip_address: "10.0.4.12",
        created_at: "2026-08-01T09:30:00Z",
      },
      {
        id: "aud-003",
        username: "lead_analyst",
        action: "INVESTIGATION_CREATED",
        resource: "INVESTIGATION",
        resource_id: "INV-2026-001",
        details: "Opened formal investigation for Syndicate Alpha peeling chain.",
        ip_address: "10.0.4.15",
        created_at: "2026-08-12T10:00:00Z",
      },
    ];

    for (const log of logs) {
      this.audit_logs.set(log.id, log);
    }
  }

  // ===========================================================================
  // Telemetry & Introspection Methods
  // ===========================================================================

  public getTableStatistics(): Array<{
    name: string;
    category: string;
    rowCount: number;
    columnCount: number;
    primaryKey: string;
    indexCount: number;
    description: string;
  }> {
    const stats: Array<{
      name: string;
      category: string;
      rowCount: number;
      columnCount: number;
      primaryKey: string;
      indexCount: number;
      description: string;
    }> = [];

    for (const [tableName, meta] of Object.entries(POSTGRESQL_TABLES_METADATA)) {
      let count = 0;
      switch (tableName) {
        case "users": count = this.users.size; break;
        case "members": count = this.members.size; break;
        case "accounts": count = this.accounts.size; break;
        case "wallets": count = this.wallets.size; break;
        case "transactions": count = this.transactions.size; break;
        case "risk_assessments": count = this.risk_assessments.size; break;
        case "wallet_features": count = this.wallet_features.size; break;
        case "network_edges": count = this.network_edges.size; break;
        case "network_clusters": count = this.network_clusters.size; break;
        case "alerts": count = this.alerts.size; break;
        case "investigations": count = this.investigations.size; break;
        case "investigation_events": count = this.investigation_events.size; break;
        case "audit_logs": count = this.audit_logs.size; break;
        case "data_imports": count = this.data_imports.size; break;
      }

      stats.push({
        name: meta.name,
        category: meta.category,
        rowCount: count,
        columnCount: meta.columns.length,
        primaryKey: meta.primaryKey,
        indexCount: meta.indexes.length,
        description: meta.description,
      });
    }

    return stats;
  }

  public getTableData(tableName: string, limit: number = 50, offset: number = 0): {
    total: number;
    limit: number;
    offset: number;
    schema: TableDefinition | null;
    rows: any[];
  } {
    const schema = POSTGRESQL_TABLES_METADATA[tableName] || null;
    let allRows: any[] = [];

    switch (tableName) {
      case "users":
        // Strip hashed password for security
        allRows = Array.from(this.users.values()).map(({ hashed_password, ...rest }) => rest);
        break;
      case "members":
        allRows = Array.from(this.members.values());
        break;
      case "accounts":
        allRows = Array.from(this.accounts.values());
        break;
      case "wallets":
        allRows = Array.from(this.wallets.values());
        break;
      case "transactions":
        allRows = Array.from(this.transactions.values());
        break;
      case "risk_assessments":
        allRows = Array.from(this.risk_assessments.values());
        break;
      case "wallet_features":
        allRows = Array.from(this.wallet_features.values());
        break;
      case "network_edges":
        allRows = Array.from(this.network_edges.values());
        break;
      case "network_clusters":
        allRows = Array.from(this.network_clusters.values());
        break;
      case "alerts":
        allRows = Array.from(this.alerts.values());
        break;
      case "investigations":
        allRows = Array.from(this.investigations.values());
        break;
      case "investigation_events":
        allRows = Array.from(this.investigation_events.values());
        break;
      case "audit_logs":
        allRows = Array.from(this.audit_logs.values());
        break;
      case "data_imports":
        allRows = Array.from(this.data_imports.values());
        break;
      default:
        allRows = [];
    }

    return {
      total: allRows.length,
      limit,
      offset,
      schema,
      rows: allRows.slice(offset, offset + limit),
    };
  }

  public getHealth(): {
    status: "HEALTHY" | "DEGRADED";
    dialect: string;
    engine: string;
    version: string;
    tablesConfigured: number;
    activeTables: number;
    totalRows: number;
    uptimeSeconds: number;
    initializedAt: string;
    connectionPool: {
      maxConnections: number;
      activeClients: number;
      idleClients: number;
      latencyMs: number;
    };
  } {
    const stats = this.getTableStatistics();
    const totalRows = stats.reduce((sum, s) => sum + s.rowCount, 0);

    return {
      status: "HEALTHY",
      dialect: "PostgreSQL 16.2 (PostgresEngine Relational Core)",
      engine: "BitFlow Relational Memory Engine with PostgreSQL DDL Synchronization",
      version: "16.2-BitFlow-SOC-v2",
      tablesConfigured: Object.keys(POSTGRESQL_TABLES_METADATA).length,
      activeTables: stats.filter((s) => s.rowCount > 0).length,
      totalRows,
      uptimeSeconds: Math.round((Date.now() - new Date(this.initializedAt).getTime()) / 1000),
      initializedAt: this.initializedAt,
      connectionPool: {
        maxConnections: 20,
        activeClients: 3,
        idleClients: 17,
        latencyMs: 1.4,
      },
    };
  }
}

// Global singleton instance
export const postgresEngine = new PostgresEngine();
