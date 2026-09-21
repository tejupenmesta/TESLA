import { SEED_MEMBERS, SEED_TRANSACTIONS, DemoMember, DemoTransaction } from "../data/seedData";

export type ScamPersonRole =
  | "SCAMMER_X"
  | "MULE_A"
  | "MULE_B"
  | "MULE_C"
  | "MULE_D"
  | "MULE_E"
  | "MULE_F";

export interface ScamNode {
  id: string;
  role: ScamPersonRole;
  roleShort: string;
  roleName: string;
  roleBadgeColor: string;
  hopIndex: number;
  taintScore: number;
  status: "SCAM_ORIGINATOR" | "MULE_DETECTED" | "FROZEN_BY_AML" | "FLAGGED_RESTRICTED" | "INVESTIGATING";
  member: DemoMember;
  banking: {
    bankName: string;
    accountId: string;
    routingRef: string;
    branch: string;
    fiatBalance: number;
    accountType: string;
    accountStatus: string;
    dailyLimit: number;
    isFrozen: boolean;
  };
  crypto: {
    address: string;
    balanceBtc: number;
    totalSentBtc: number;
    totalReceivedBtc: number;
    txCount: number;
    walletType: "Native SegWit (P2WPKH)" | "Taproot (P2TR)";
    isBlacklisted: boolean;
  };
  forensics: {
    receivedFrom: string;
    sentTo: string;
    amountReceivedBtc: number;
    amountForwardedBtc: number;
    retainedCutBtc: number;
    retainedCutUsd: number;
    retainedCutPercent: number;
    holdingDurationSeconds: number;
    holdingDurationHuman: string;
    velocityZScore: number;
    detectedFlags: string[];
    sarRecommendation: string;
  };
  historicalTransactions: DemoTransaction[];
}

export interface ScamTransferStep {
  step: number;
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  toName: string;
  toRole: string;
  txId: string;
  amountBtc: number;
  amountUsd: number;
  holdingDuration: string;
  holdingSeconds: number;
  retainedCutBtc: number;
  feeRateSatVb: number;
  timestamp: string;
}

export interface ScamChain {
  id: string;
  title: string;
  pattern: string;
  originScammer: string;
  exitCashout: string;
  totalDisbursedBtc: number;
  totalDisbursedUsd: number;
  averageHopLatencySec: number;
  totalMuleCutsBtc: number;
  totalMuleCutsUsd: number;
  chainTaintScore: number;
  nodes: ScamNode[];
  transfers: ScamTransferStep[];
  detectionNarrative: string[];
  timeline: { time: string; event: string; severity: "critical" | "warning" | "info" }[];
}

// =============================================================================
// CANONICAL SCAM CHAIN GENERATOR (X -> A -> B -> C -> D -> E -> F)
// =============================================================================

const BTC_PRICE_USD = 64200;

export function buildCanonicalScamChain(): ScamChain {
  // Scammer X Definition (Originator)
  const scammerXMember: DemoMember = {
    memberId: "SCAM-X01",
    name: "Vikram 'Apex' Sethi",
    email: "vikram.sethi.shadow@proton-scam.test",
    phone: "+91-99887-00999",
    city: "Mumbai (Reported / IP Proxy)",
    country: "India",
    age: 34,
    occupation: "Unregistered Investment Operator (Flagged)",
    profileStatus: "Under Review",
    profileCreated: "2026-03-12",
    accountId: "DEMO-BANK-SCAM-X001",
    routingRef: "DEMO-IFSC-MUM-999",
    btcWalletAddress: "bc1qscammerxapex999syntheticdemo",
    senderAddress: "bc1qscammerxapex999syntheticdemo",
    accountType: "Private Syndicate Crypto Account",
    custodyModel: "Non-custodial HW Wallet",
    accountStatus: "Flagged for Global Seizure",
    accountCreated: "2026-03-12",
    idProofType: "Forged Aadhaar (Demo Reference)",
    syntheticIdRef: "DEMO-AADHAAR-SCAM-X01-FRAUD",
    kycStatus: "Pending (Synthetic)",
    verificationDate: "2026-03-14",
    kycCaseId: "KYC-FRAUD-ALERT-8821",
    nomineeName: "Unknown Foreign Shell Nominee",
    nomineeRelationship: "Associate",
    nomineePhone: "+91-91234-00000",
    nomineeEmail: "proxy.nominee@shell.test",
    nomineeRef: "DEMO-NOM-FRAUD-99",
  };

  // Mules A through F from SEED_MEMBERS
  const muleA = SEED_MEMBERS[0] || {
    memberId: "M001",
    name: "Aarav Kumar",
    email: "aarav.m001@example.test",
    phone: "+91-90000-10000",
    city: "Kadapa",
    country: "India",
    age: 21,
    occupation: "College Student",
    profileStatus: "Under Review",
    profileCreated: "2026-01-01",
    accountId: "DEMO-BANK-000001",
    routingRef: "DEMO-IFSC-00001",
    btcWalletAddress: "bc1qbitflowdemo0001synthetic",
    senderAddress: "bc1qexample001syntheticbitcoindemo",
    accountType: "Savings Student Account",
    custodyModel: "Synthetic Custodial Demo",
    accountStatus: "Frozen for Demo Review",
    accountCreated: "2026-07-01",
    idProofType: "Aadhaar (Demo Ref)",
    syntheticIdRef: "DEMO-AADHAAR-M001-X",
    kycStatus: "Pending (Synthetic)",
    verificationDate: "2026-08-01",
    kycCaseId: "KYC-DEMO-0001",
    nomineeName: "Varun Mishra",
    nomineeRelationship: "Parent",
    nomineePhone: "+91-91111-20000",
    nomineeEmail: "nomineem001@example.test",
    nomineeRef: "DEMO-NOM-0001",
  };

  const muleB = SEED_MEMBERS[1] || {
    memberId: "M002",
    name: "Vihaan Verma",
    email: "vihaan.m002@example.test",
    phone: "+91-90000-10001",
    city: "Hyderabad",
    country: "India",
    age: 22,
    occupation: "Junior Web Developer",
    profileStatus: "Active",
    profileCreated: "2026-02-02",
    accountId: "DEMO-BANK-000002",
    routingRef: "DEMO-IFSC-00002",
    btcWalletAddress: "bc1qbitflowdemo0002synthetic",
    senderAddress: "bc1qexample002syntheticbitcoindemo",
    accountType: "Salary Savings Account",
    custodyModel: "Synthetic Custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "PAN Card (Demo Ref)",
    syntheticIdRef: "DEMO-PAN-M002-XX",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-02",
    kycCaseId: "KYC-DEMO-0002",
    nomineeName: "Sunita Verma",
    nomineeRelationship: "Mother",
    nomineePhone: "+91-91111-20001",
    nomineeEmail: "nomineem002@example.test",
    nomineeRef: "DEMO-NOM-0002",
  };

  const muleC = SEED_MEMBERS[2] || {
    memberId: "M003",
    name: "Aditya Nair",
    email: "aditya.m003@example.test",
    phone: "+91-90000-10002",
    city: "Bangalore",
    country: "India",
    age: 23,
    occupation: "Freelance Graphic Artist",
    profileStatus: "Active",
    profileCreated: "2026-03-03",
    accountId: "DEMO-BANK-000003",
    routingRef: "DEMO-IFSC-00003",
    btcWalletAddress: "bc1qbitflowdemo0003synthetic",
    senderAddress: "bc1qexample003syntheticbitcoindemo",
    accountType: "Individual Savings Account",
    custodyModel: "Synthetic Custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Passport (Demo Ref)",
    syntheticIdRef: "DEMO-PASSPORT-M003-",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-03",
    kycCaseId: "KYC-DEMO-0003",
    nomineeName: "Ishaan Chauhan",
    nomineeRelationship: "Brother",
    nomineePhone: "+91-91111-20002",
    nomineeEmail: "nomineem003@example.test",
    nomineeRef: "DEMO-NOM-0003",
  };

  const muleD = SEED_MEMBERS[3] || {
    memberId: "M004",
    name: "Arjun Joshi",
    email: "arjun.m004@example.test",
    phone: "+91-90000-10003",
    city: "Vijayawada",
    country: "India",
    age: 24,
    occupation: "UI/UX Designer",
    profileStatus: "Active",
    profileCreated: "2026-04-04",
    accountId: "DEMO-BANK-000004",
    routingRef: "DEMO-IFSC-00004",
    btcWalletAddress: "bc1qbitflowdemo0004synthetic",
    senderAddress: "bc1qexample004syntheticbitcoindemo",
    accountType: "Savings Account",
    custodyModel: "Synthetic Custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Driving Licence (Demo Ref)",
    syntheticIdRef: "DEMO-DRIVING-M004-XX",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-04",
    kycCaseId: "KYC-DEMO-0004",
    nomineeName: "Manish Pillai",
    nomineeRelationship: "Guardian",
    nomineePhone: "+91-91111-20003",
    nomineeEmail: "nomineem004@example.test",
    nomineeRef: "DEMO-NOM-0004",
  };

  const muleE = SEED_MEMBERS[4] || {
    memberId: "M005",
    name: "Rohan Malhotra",
    email: "rohan.m005@example.test",
    phone: "+91-90000-10004",
    city: "Visakhapatnam",
    country: "India",
    age: 25,
    occupation: "E-Commerce Courier",
    profileStatus: "Active",
    profileCreated: "2026-05-05",
    accountId: "DEMO-BANK-000005",
    routingRef: "DEMO-IFSC-00005",
    btcWalletAddress: "bc1qbitflowdemo0005synthetic",
    senderAddress: "bc1qexample005syntheticbitcoindemo",
    accountType: "Current Account",
    custodyModel: "Synthetic Custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Aadhaar (Demo Ref)",
    syntheticIdRef: "DEMO-AADHAAR-M005-X",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-05",
    kycCaseId: "KYC-DEMO-0005",
    nomineeName: "Harsh Bose",
    nomineeRelationship: "Cousin",
    nomineePhone: "+91-91111-20004",
    nomineeEmail: "nomineem005@example.test",
    nomineeRef: "DEMO-NOM-0005",
  };

  const muleF = SEED_MEMBERS[5] || {
    memberId: "M006",
    name: "Rahul Chauhan",
    email: "rahul.m006@example.test",
    phone: "+91-90000-10005",
    city: "Chennai",
    country: "India",
    age: 29,
    occupation: "P2P OTC Crypto Trader",
    profileStatus: "Under Review",
    profileCreated: "2026-06-06",
    accountId: "DEMO-BANK-000006",
    routingRef: "DEMO-IFSC-00006",
    btcWalletAddress: "bc1qbitflowdemo0006synthetic",
    senderAddress: "bc1qexample006syntheticbitcoindemo",
    accountType: "Commercial Merchant Account",
    custodyModel: "Synthetic Custodial Demo",
    accountStatus: "Restricted",
    accountCreated: "2026-07-01",
    idProofType: "Passport (Demo Ref)",
    syntheticIdRef: "DEMO-PASSPORT-M006-",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-06",
    kycCaseId: "KYC-DEMO-0006",
    nomineeName: "Pooja Chauhan",
    nomineeRelationship: "Spouse",
    nomineePhone: "+91-91111-20005",
    nomineeEmail: "nomineem006@example.test",
    nomineeRef: "DEMO-NOM-0006",
  };

  // Build the 7 nodes
  const nodes: ScamNode[] = [
    // 0: SCAMMER (X)
    {
      id: "node-x",
      role: "SCAMMER_X",
      roleShort: "Scammer (X)",
      roleName: "Scammer (X) - Fraud Syndicate Originator",
      roleBadgeColor: "bg-red-500/20 text-red-400 border-red-500/50",
      hopIndex: 0,
      taintScore: 100,
      status: "SCAM_ORIGINATOR",
      member: scammerXMember,
      banking: {
        bankName: "BitFlow Global Banking Hub",
        accountId: scammerXMember.accountId,
        routingRef: scammerXMember.routingRef,
        branch: "Mumbai Offshore Cyber Unit",
        fiatBalance: 2450000,
        accountType: scammerXMember.accountType,
        accountStatus: "Flagged for Global Seizure",
        dailyLimit: 5000000,
        isFrozen: true,
      },
      crypto: {
        address: scammerXMember.senderAddress,
        balanceBtc: 8.452,
        totalSentBtc: 14.85,
        totalReceivedBtc: 23.302,
        txCount: 42,
        walletType: "Taproot (P2TR)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: "Illicit Phishing / Ransomware Vault",
        sentTo: `${muleA.name} (Person A)`,
        amountReceivedBtc: 4.85,
        amountForwardedBtc: 4.85,
        retainedCutBtc: 0,
        retainedCutUsd: 0,
        retainedCutPercent: 0,
        holdingDurationSeconds: 0,
        holdingDurationHuman: "Immediate Outflow",
        velocityZScore: 5.84,
        detectedFlags: [
          "Originator of stolen funds disbursement (4.85 BTC)",
          "Matches known crypto-drainer signature",
          "Attempted micro-layering to bypass CEX AML alarms",
        ],
        sarRecommendation: "FILE IMMEDIATE EMERGENCY SAR + INTERPOL RED NOTICE",
      },
      historicalTransactions: [
        {
          id: "DEMO-TX-SCAM-01",
          memberId: scammerXMember.memberId,
          senderName: "Victim Corporate Treasury",
          senderAddress: "bc1qvictimcorporate999phished",
          receiverAddress: scammerXMember.senderAddress,
          receiverName: scammerXMember.name,
          date: "2026-08-01",
          time: "08:12:00",
          amountBtc: 4.85,
          amountUsd: 311370,
          networkFeeBtc: 0.00015,
          feeRateSatVb: 42,
          vsize: 320,
          paymentPhase: "Payment",
          paymentStatus: "Success",
          confirmations: 1200,
          blockHeight: 914000,
          direction: "Incoming",
          txType: "Wallet transfer",
          mempoolStatus: "Confirmed",
          whaleTier: "Whale Alert",
          riskFlag: "High",
          riskScore: 99,
          aiInterpretation: "Originating illicit inbound transfer from victimized entity.",
          aiDecisionNote: "Flagged by ransomware watchguard.",
          isWhale: true,
        },
      ],
    },

    // 1: PERSON (A) - Mule Hop 1
    {
      id: "node-a",
      role: "MULE_A",
      roleShort: "Person (A)",
      roleName: "Person (A) - Layer 1 Inflow Mule",
      roleBadgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      hopIndex: 1,
      taintScore: 98,
      status: "MULE_DETECTED",
      member: muleA,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: muleA.accountId,
        routingRef: muleA.routingRef,
        branch: "Kadapa Main Branch",
        fiatBalance: 584200,
        accountType: muleA.accountType,
        accountStatus: "Restricted (AML Hold)",
        dailyLimit: 100000,
        isFrozen: true,
      },
      crypto: {
        address: muleA.senderAddress,
        balanceBtc: 0.15,
        totalSentBtc: 4.70,
        totalReceivedBtc: 4.85,
        txCount: 8,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: `${scammerXMember.name} (Scammer X)`,
        sentTo: `${muleB.name} (Person B)`,
        amountReceivedBtc: 4.85,
        amountForwardedBtc: 4.70,
        retainedCutBtc: 0.15,
        retainedCutUsd: Math.round(0.15 * BTC_PRICE_USD),
        retainedCutPercent: 3.09,
        holdingDurationSeconds: 68,
        holdingDurationHuman: "68 seconds (Rapid Mule Relay)",
        velocityZScore: 4.92,
        detectedFlags: [
          "Direct recipient of 4.85 BTC from Scammer (X)",
          "Forwarded 96.9% of funds in only 68 seconds",
          "Retained 0.15 BTC (~$9,630 USD) mule commission",
          "Student KYC profile inconsistent with 4.85 BTC transfer volume",
        ],
        sarRecommendation: "FREEZE BANK ACCOUNT + ISSUE MULE RECRUITMENT INQUIRY",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === "M001").slice(0, 4),
    },

    // 2: PERSON (B) - Mule Hop 2
    {
      id: "node-b",
      role: "MULE_B",
      roleShort: "Person (B)",
      roleName: "Person (B) - Layer 2 Smurfing Relay",
      roleBadgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/50",
      hopIndex: 2,
      taintScore: 93,
      status: "MULE_DETECTED",
      member: muleB,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: muleB.accountId,
        routingRef: muleB.routingRef,
        branch: "Hyderabad Cyber City Branch",
        fiatBalance: 920000,
        accountType: muleB.accountType,
        accountStatus: "Restricted",
        dailyLimit: 250000,
        isFrozen: true,
      },
      crypto: {
        address: muleB.senderAddress,
        balanceBtc: 0.15,
        totalSentBtc: 4.55,
        totalReceivedBtc: 4.70,
        txCount: 14,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: `${muleA.name} (Person A)`,
        sentTo: `${muleC.name} (Person C)`,
        amountReceivedBtc: 4.70,
        amountForwardedBtc: 4.55,
        retainedCutBtc: 0.15,
        retainedCutUsd: Math.round(0.15 * BTC_PRICE_USD),
        retainedCutPercent: 3.19,
        holdingDurationSeconds: 84,
        holdingDurationHuman: "84 seconds",
        velocityZScore: 4.31,
        detectedFlags: [
          "Layer 2 mule node in sequential peeling relay",
          "Forwarded 4.55 BTC to Person C within 84 seconds",
          "Kept 0.15 BTC mule cut in local wallet",
          "Zero legitimate commerce invoice found",
        ],
        sarRecommendation: "RESTRICT FIAT ON-RAMP + TRACE NOMINEE LINK",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === "M002").slice(0, 4),
    },

    // 3: PERSON (C) - Mule Hop 3
    {
      id: "node-c",
      role: "MULE_C",
      roleShort: "Person (C)",
      roleName: "Person (C) - Layer 3 Intermediary Aggregator",
      roleBadgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      hopIndex: 3,
      taintScore: 87,
      status: "MULE_DETECTED",
      member: muleC,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: muleC.accountId,
        routingRef: muleC.routingRef,
        branch: "Bangalore Indiranagar Branch",
        fiatBalance: 615000,
        accountType: muleC.accountType,
        accountStatus: "Restricted",
        dailyLimit: 300000,
        isFrozen: true,
      },
      crypto: {
        address: muleC.senderAddress,
        balanceBtc: 0.15,
        totalSentBtc: 4.40,
        totalReceivedBtc: 4.55,
        txCount: 19,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: `${muleB.name} (Person B)`,
        sentTo: `${muleD.name} (Person D)`,
        amountReceivedBtc: 4.55,
        amountForwardedBtc: 4.40,
        retainedCutBtc: 0.15,
        retainedCutUsd: Math.round(0.15 * BTC_PRICE_USD),
        retainedCutPercent: 3.30,
        holdingDurationSeconds: 95,
        holdingDurationHuman: "95 seconds",
        velocityZScore: 3.88,
        detectedFlags: [
          "Sequential hop 3 in peeling chain",
          "Holding duration < 100 seconds",
          "High sat/vB priority fee used to bypass next block",
        ],
        sarRecommendation: "FREEZE BITFLOW WALLET + SUSPEND WITHDRAWALS",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === "M003").slice(0, 4),
    },

    // 4: PERSON (D) - Mule Hop 4
    {
      id: "node-d",
      role: "MULE_D",
      roleShort: "Person (D)",
      roleName: "Person (D) - Layer 4 Structured Conduit",
      roleBadgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      hopIndex: 4,
      taintScore: 81,
      status: "MULE_DETECTED",
      member: muleD,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: muleD.accountId,
        routingRef: muleD.routingRef,
        branch: "Vijayawada MG Road Branch",
        fiatBalance: 420000,
        accountType: muleD.accountType,
        accountStatus: "Restricted",
        dailyLimit: 200000,
        isFrozen: true,
      },
      crypto: {
        address: muleD.senderAddress,
        balanceBtc: 0.15,
        totalSentBtc: 4.25,
        totalReceivedBtc: 4.40,
        txCount: 11,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: `${muleC.name} (Person C)`,
        sentTo: `${muleE.name} (Person E)`,
        amountReceivedBtc: 4.40,
        amountForwardedBtc: 4.25,
        retainedCutBtc: 0.15,
        retainedCutUsd: Math.round(0.15 * BTC_PRICE_USD),
        retainedCutPercent: 3.41,
        holdingDurationSeconds: 71,
        holdingDurationHuman: "71 seconds",
        velocityZScore: 3.65,
        detectedFlags: [
          "Layer 4 peeling conduit",
          "Transferred 4.25 BTC to Person E",
          "Dormant account activated specifically for this relay",
        ],
        sarRecommendation: "BLOCK KYC LEVEL 2 + SUBMIT AML TRANSACTION ALERT",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === "M004").slice(0, 4),
    },

    // 5: PERSON (E) - Mule Hop 5
    {
      id: "node-e",
      role: "MULE_E",
      roleShort: "Person (E)",
      roleName: "Person (E) - Layer 5 Pre-Exit Conduit",
      roleBadgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      hopIndex: 5,
      taintScore: 76,
      status: "MULE_DETECTED",
      member: muleE,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: muleE.accountId,
        routingRef: muleE.routingRef,
        branch: "Visakhapatnam Beach Road Branch",
        fiatBalance: 730000,
        accountType: muleE.accountType,
        accountStatus: "Restricted",
        dailyLimit: 400000,
        isFrozen: true,
      },
      crypto: {
        address: muleE.senderAddress,
        balanceBtc: 0.15,
        totalSentBtc: 4.10,
        totalReceivedBtc: 4.25,
        txCount: 16,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: `${muleD.name} (Person D)`,
        sentTo: `${muleF.name} (Person F)`,
        amountReceivedBtc: 4.25,
        amountForwardedBtc: 4.10,
        retainedCutBtc: 0.15,
        retainedCutUsd: Math.round(0.15 * BTC_PRICE_USD),
        retainedCutPercent: 3.53,
        holdingDurationSeconds: 62,
        holdingDurationHuman: "62 seconds (Rapid Relay)",
        velocityZScore: 3.94,
        detectedFlags: [
          "Penultimate mule node in chain",
          "Relayed 4.10 BTC to OTC desk wallet of Person F",
          "Holding duration under 65 seconds indicates scripted bot automation",
        ],
        sarRecommendation: "FREEZE FIAT ACCOUNT + REPORT TO FIU-IND",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === "M005").slice(0, 4),
    },

    // 6: PERSON (F) - Mule Hop 6 (Exit / Cash-out)
    {
      id: "node-f",
      role: "MULE_F",
      roleShort: "Person (F)",
      roleName: "Person (F) - Layer 6 Off-Ramp / Cash-Out Mule",
      roleBadgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      hopIndex: 6,
      taintScore: 71,
      status: "MULE_DETECTED",
      member: muleF,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: muleF.accountId,
        routingRef: muleF.routingRef,
        branch: "Chennai Anna Salai Branch",
        fiatBalance: 3200000,
        accountType: muleF.accountType,
        accountStatus: "Restricted (Under Investigation)",
        dailyLimit: 2000000,
        isFrozen: true,
      },
      crypto: {
        address: muleF.senderAddress,
        balanceBtc: 4.10,
        totalSentBtc: 2.10,
        totalReceivedBtc: 6.20,
        txCount: 31,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: `${muleE.name} (Person E)`,
        sentTo: "Pending P2P Cashout / LocalBank Cash Conversion",
        amountReceivedBtc: 4.10,
        amountForwardedBtc: 0,
        retainedCutBtc: 4.10,
        retainedCutUsd: Math.round(4.10 * BTC_PRICE_USD),
        retainedCutPercent: 100,
        holdingDurationSeconds: 0,
        holdingDurationHuman: "Active / Accumulating at Endpoint",
        velocityZScore: 4.78,
        detectedFlags: [
          "Terminal node in 6-hop money laundering chain",
          "Accumulating 4.10 BTC for off-ramp fiat liquidation",
          "Unregistered OTC trading pattern flagged",
          "Multiple foreign IP logins detected within 24h",
        ],
        sarRecommendation: "EMERGENCY ASSET FREEZE + NOTIFY REGULATORY ENFORCEMENT",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === "M006").slice(0, 4),
    },
  ];

  // Build the 6 sequential transfers
  const transfers: ScamTransferStep[] = [
    {
      step: 1,
      fromId: "node-x",
      fromName: "Vikram Sethi (Scammer X)",
      fromRole: "Scammer (X)",
      toId: "node-a",
      toName: "Aarav Kumar (Person A)",
      toRole: "Mule (A)",
      txId: "DEMO-TX-SCAM-HOP1",
      amountBtc: 4.85,
      amountUsd: +(4.85 * BTC_PRICE_USD).toFixed(2),
      holdingDuration: "68 sec",
      holdingSeconds: 68,
      retainedCutBtc: 0.15,
      feeRateSatVb: 38,
      timestamp: "10:14:02 UTC",
    },
    {
      step: 2,
      fromId: "node-a",
      fromName: "Aarav Kumar (Person A)",
      fromRole: "Mule (A)",
      toId: "node-b",
      toName: "Vihaan Verma (Person B)",
      toRole: "Mule (B)",
      txId: "DEMO-TX-SCAM-HOP2",
      amountBtc: 4.70,
      amountUsd: +(4.70 * BTC_PRICE_USD).toFixed(2),
      holdingDuration: "84 sec",
      holdingSeconds: 84,
      retainedCutBtc: 0.15,
      feeRateSatVb: 36,
      timestamp: "10:15:10 UTC",
    },
    {
      step: 3,
      fromId: "node-b",
      fromName: "Vihaan Verma (Person B)",
      fromRole: "Mule (B)",
      toId: "node-c",
      toName: "Aditya Nair (Person C)",
      toRole: "Mule (C)",
      txId: "DEMO-TX-SCAM-HOP3",
      amountBtc: 4.55,
      amountUsd: +(4.55 * BTC_PRICE_USD).toFixed(2),
      holdingDuration: "95 sec",
      holdingSeconds: 95,
      retainedCutBtc: 0.15,
      feeRateSatVb: 41,
      timestamp: "10:16:34 UTC",
    },
    {
      step: 4,
      fromId: "node-c",
      fromName: "Aditya Nair (Person C)",
      fromRole: "Mule (C)",
      toId: "node-d",
      toName: "Arjun Joshi (Person D)",
      toRole: "Mule (D)",
      txId: "DEMO-TX-SCAM-HOP4",
      amountBtc: 4.40,
      amountUsd: +(4.40 * BTC_PRICE_USD).toFixed(2),
      holdingDuration: "71 sec",
      holdingSeconds: 71,
      retainedCutBtc: 0.15,
      feeRateSatVb: 35,
      timestamp: "10:18:09 UTC",
    },
    {
      step: 5,
      fromId: "node-d",
      fromName: "Arjun Joshi (Person D)",
      fromRole: "Mule (D)",
      toId: "node-e",
      toName: "Rohan Malhotra (Person E)",
      toRole: "Mule (E)",
      txId: "DEMO-TX-SCAM-HOP5",
      amountBtc: 4.25,
      amountUsd: +(4.25 * BTC_PRICE_USD).toFixed(2),
      holdingDuration: "62 sec",
      holdingSeconds: 62,
      retainedCutBtc: 0.15,
      feeRateSatVb: 39,
      timestamp: "10:19:20 UTC",
    },
    {
      step: 6,
      fromId: "node-e",
      fromName: "Rohan Malhotra (Person E)",
      fromRole: "Mule (E)",
      toId: "node-f",
      toName: "Rahul Chauhan (Person F)",
      toRole: "Mule (F - Exit)",
      txId: "DEMO-TX-SCAM-HOP6",
      amountBtc: 4.10,
      amountUsd: +(4.10 * BTC_PRICE_USD).toFixed(2),
      holdingDuration: "Pending Exit",
      holdingSeconds: 0,
      retainedCutBtc: 4.10,
      feeRateSatVb: 44,
      timestamp: "10:20:22 UTC",
    },
  ];

  return {
    id: "SCAM-CHAIN-001-X-A-F",
    title: "Canonical 6-Hop Mule Syndicate: Scammer (X) → (A) → (B) → (C) → (D) → (E) → (F)",
    pattern: "SEQUENTIAL_PEELING_RELAY",
    originScammer: "Vikram 'Apex' Sethi (Scammer X)",
    exitCashout: "Rahul Chauhan (Person F - OTC Off-Ramp)",
    totalDisbursedBtc: 4.85,
    totalDisbursedUsd: +(4.85 * BTC_PRICE_USD).toFixed(2),
    averageHopLatencySec: 76.0,
    totalMuleCutsBtc: 0.75,
    totalMuleCutsUsd: +(0.75 * BTC_PRICE_USD).toFixed(2),
    chainTaintScore: 97,
    nodes,
    transfers,
    detectionNarrative: [
      "CRITICAL THREAT: Automated money mule ring detected originating from flagged Scammer (X).",
      "Illicit funds of 4.85 BTC (~$311,370 USD) were systematically forwarded across 6 sequential hops with an average relay time of only 76 seconds.",
      "Each intermediary mule (A, B, C, D, E) retained exactly 0.15 BTC (~$9,630 USD) as a 3.1%–3.5% commission fee before forwarding remaining funds.",
      "Terminal destination Person (F) is an unregistered OTC desk account attempting to off-ramp 4.10 BTC to fiat.",
      "All 7 associated accounts have been automatically cross-referenced against the synthetic banking ledger and flagged for freeze action.",
    ],
    timeline: [
      { time: "10:14:02 UTC", event: "Scammer (X) executes initial disbursement of 4.85 BTC to Person (A)", severity: "critical" },
      { time: "10:15:10 UTC", event: "Person (A) retains 0.15 BTC commission; forwards 4.70 BTC to Person (B) within 68s", severity: "warning" },
      { time: "10:16:34 UTC", event: "Person (B) retains 0.15 BTC commission; forwards 4.55 BTC to Person (C) within 84s", severity: "warning" },
      { time: "10:18:09 UTC", event: "Person (C) retains 0.15 BTC commission; forwards 4.40 BTC to Person (D) within 95s", severity: "warning" },
      { time: "10:19:20 UTC", event: "Person (D) retains 0.15 BTC commission; forwards 4.25 BTC to Person (E) within 71s", severity: "warning" },
      { time: "10:20:22 UTC", event: "Person (E) forwards 4.10 BTC to Person (F); triggers multi-hop correlation alert", severity: "critical" },
      { time: "10:20:25 UTC", event: "BitFlow AML Engine confirms 6-hop syndicate; recommends freeze across all 7 accounts", severity: "critical" },
    ],
  };
}

// =============================================================================
// DYNAMIC SCAM CHAIN TRACER (Trace ANY Member as Scammer X)
// =============================================================================

export function traceDynamicScamChain(originMemberId: string, initialBtc: number = 3.5): ScamChain {
  const allMembers = SEED_MEMBERS;
  const startIndex = Math.max(0, allMembers.findIndex((m) => m.memberId === originMemberId));
  const baseMember = allMembers[startIndex] || allMembers[0];

  // Select 6 downstream members
  const downstream: DemoMember[] = [];
  for (let i = 1; i <= 6; i++) {
    const idx = (startIndex + i * 3) % allMembers.length;
    downstream.push(allMembers[idx]);
  }

  const roleCodes: ScamPersonRole[] = ["SCAMMER_X", "MULE_A", "MULE_B", "MULE_C", "MULE_D", "MULE_E", "MULE_F"];
  const roleNames = [
    `Scammer (X) - ${baseMember.name}`,
    `Person (A) - ${downstream[0].name}`,
    `Person (B) - ${downstream[1].name}`,
    `Person (C) - ${downstream[2].name}`,
    `Person (D) - ${downstream[3].name}`,
    `Person (E) - ${downstream[4].name}`,
    `Person (F) - ${downstream[5].name} (Terminal Exit)`,
  ];
  const roleShorts = ["Scammer (X)", "Person (A)", "Person (B)", "Person (C)", "Person (D)", "Person (E)", "Person (F)"];
  const badgeColors = [
    "bg-red-500/20 text-red-400 border-red-500/50",
    "bg-orange-500/20 text-orange-400 border-orange-500/50",
    "bg-amber-500/20 text-amber-400 border-amber-500/50",
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    "bg-purple-500/20 text-purple-400 border-purple-500/50",
  ];

  const taints = [100, 96, 91, 85, 79, 74, 69];
  let currentAmount = initialBtc;
  const cutPerHop = +(initialBtc * 0.035).toFixed(4);

  const nodes: ScamNode[] = [];
  const transfers: ScamTransferStep[] = [];

  // 1. Origin Node X
  nodes.push({
    id: `node-${baseMember.memberId.toLowerCase()}`,
    role: "SCAMMER_X",
    roleShort: "Scammer (X)",
    roleName: roleNames[0],
    roleBadgeColor: badgeColors[0],
    hopIndex: 0,
    taintScore: 100,
    status: "SCAM_ORIGINATOR",
    member: baseMember,
    banking: {
      bankName: "BitFlow Treasury Bank",
      accountId: baseMember.accountId,
      routingRef: baseMember.routingRef,
      branch: `${baseMember.city} Central Branch`,
      fiatBalance: 1850000,
      accountType: baseMember.accountType,
      accountStatus: "Flagged for Review",
      dailyLimit: 2500000,
      isFrozen: true,
    },
    crypto: {
      address: baseMember.senderAddress,
      balanceBtc: +(initialBtc * 1.5).toFixed(4),
      totalSentBtc: initialBtc,
      totalReceivedBtc: +(initialBtc * 2.5).toFixed(4),
      txCount: 22,
      walletType: "Native SegWit (P2WPKH)",
      isBlacklisted: true,
    },
    forensics: {
      receivedFrom: "Simulated Scam Inflow",
      sentTo: downstream[0].name,
      amountReceivedBtc: initialBtc,
      amountForwardedBtc: initialBtc,
      retainedCutBtc: 0,
      retainedCutUsd: 0,
      retainedCutPercent: 0,
      holdingDurationSeconds: 0,
      holdingDurationHuman: "Origin Point",
      velocityZScore: 5.12,
      detectedFlags: [
        `Designated originator node (${baseMember.name})`,
        `Disbursed ${initialBtc} BTC into money mule conduit`,
        "Elevated velocity z-score: +5.12σ",
      ],
      sarRecommendation: "IMMEDIATE AML BLOCK + REPORT TO LOCAL FIU",
    },
    historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === baseMember.memberId).slice(0, 4),
  });

  // 2. Downstream Mules A through F
  for (let i = 0; i < 6; i++) {
    const m = downstream[i];
    const prevNode = nodes[i];
    const nextMember = i < 5 ? downstream[i + 1] : null;

    const amountIn = currentAmount;
    const cut = i < 5 ? cutPerHop : amountIn; // Last node keeps or holds for exit
    const amountOut = i < 5 ? +(amountIn - cut).toFixed(4) : 0;
    const holdingSec = 60 + ((i * 17) % 55);

    nodes.push({
      id: `node-${m.memberId.toLowerCase()}`,
      role: roleCodes[i + 1],
      roleShort: roleShorts[i + 1],
      roleName: roleNames[i + 1],
      roleBadgeColor: badgeColors[i + 1],
      hopIndex: i + 1,
      taintScore: taints[i + 1],
      status: "MULE_DETECTED",
      member: m,
      banking: {
        bankName: "BitFlow Treasury Bank",
        accountId: m.accountId,
        routingRef: m.routingRef,
        branch: `${m.city} Branch`,
        fiatBalance: 650000 + i * 80000,
        accountType: m.accountType,
        accountStatus: "Restricted (Under Review)",
        dailyLimit: 500000,
        isFrozen: true,
      },
      crypto: {
        address: m.senderAddress,
        balanceBtc: cut,
        totalSentBtc: amountOut,
        totalReceivedBtc: amountIn,
        txCount: 12 + i * 3,
        walletType: "Native SegWit (P2WPKH)",
        isBlacklisted: true,
      },
      forensics: {
        receivedFrom: prevNode.member.name,
        sentTo: nextMember ? nextMember.name : "Cash-out OTC Desk",
        amountReceivedBtc: amountIn,
        amountForwardedBtc: amountOut,
        retainedCutBtc: cut,
        retainedCutUsd: Math.round(cut * BTC_PRICE_USD),
        retainedCutPercent: +((cut / (amountIn || 1)) * 100).toFixed(1),
        holdingDurationSeconds: holdingSec,
        holdingDurationHuman: i < 5 ? `${holdingSec} seconds` : "Holding at Terminal Exit",
        velocityZScore: +(4.2 - i * 0.2).toFixed(2),
        detectedFlags: [
          `Hop ${i + 1} accomplice detected in scam routing chain`,
          `Received ${amountIn} BTC from ${prevNode.member.name}`,
          i < 5 ? `Forwarded ${amountOut} BTC in ${holdingSec} seconds` : "Terminal off-ramp accumulation node",
          `Retained commission cut: ${cut} BTC (~$${Math.round(cut * BTC_PRICE_USD).toLocaleString()} USD)`,
        ],
        sarRecommendation: "FREEZE ASSOCIATED BANK ACCOUNT + AUDIT PREVIOUS INFLOWS",
      },
      historicalTransactions: SEED_TRANSACTIONS.filter((t) => t.memberId === m.memberId).slice(0, 4),
    });

    // Transfer Step
    transfers.push({
      step: i + 1,
      fromId: prevNode.id,
      fromName: `${prevNode.member.name} (${prevNode.roleShort})`,
      fromRole: prevNode.roleShort,
      toId: `node-${m.memberId.toLowerCase()}`,
      toName: `${m.name} (${roleShorts[i + 1]})`,
      toRole: roleShorts[i + 1],
      txId: `DEMO-TX-DYNAMIC-HOP${i + 1}`,
      amountBtc: amountIn,
      amountUsd: +(amountIn * BTC_PRICE_USD).toFixed(2),
      holdingDuration: i < 5 ? `${holdingSec} sec` : "Exit Node",
      holdingSeconds: holdingSec,
      retainedCutBtc: cut,
      feeRateSatVb: 28 + i * 3,
      timestamp: `10:${(12 + i * 2).toString().padStart(2, "0")}:15 UTC`,
    });

    currentAmount = amountOut;
  }

  const totalCuts = +(nodes.slice(1, 6).reduce((acc, n) => acc + n.forensics.retainedCutBtc, 0)).toFixed(4);

  return {
    id: `SCAM-CHAIN-${baseMember.memberId}-DYNAMIC`,
    title: `Dynamic Scam Trace: ${baseMember.name} (X) → Multi-Hop Mule Chain to ${downstream[5].name} (F)`,
    pattern: "DYNAMIC_TAINT_TRAVERSAL",
    originScammer: `${baseMember.name} (${baseMember.memberId})`,
    exitCashout: `${downstream[5].name} (${downstream[5].memberId})`,
    totalDisbursedBtc: initialBtc,
    totalDisbursedUsd: +(initialBtc * BTC_PRICE_USD).toFixed(2),
    averageHopLatencySec: 72.4,
    totalMuleCutsBtc: totalCuts,
    totalMuleCutsUsd: +(totalCuts * BTC_PRICE_USD).toFixed(2),
    chainTaintScore: 95,
    nodes,
    transfers,
    detectionNarrative: [
      `DYNAMIC TRACE COMPLETE: Analyzed 6-hop downstream graph originating from ${baseMember.name}.`,
      `Initial scam disbursement of ${initialBtc} BTC traversed 6 intermediary mule accounts.`,
      `All 6 recipient accounts (A through F) exhibit characteristic rapid forwarding (< 110s) with peeling commissions retained.`,
      "Taint decay calculated according to FIFO proportional dispersion heuristics.",
      "Recommended action: Execute coordinated bank freeze across all 7 accounts to prevent fiat off-ramping.",
    ],
    timeline: [
      { time: "Just now", event: `Initiated forensic BFS taint traversal from source: ${baseMember.name}`, severity: "info" },
      { time: "Step 1-2", event: `Discovered rapid relay through ${downstream[0].name} (A) and ${downstream[1].name} (B)`, severity: "warning" },
      { time: "Step 3-4", event: `Taint propagated through ${downstream[2].name} (C) and ${downstream[3].name} (D)`, severity: "warning" },
      { time: "Step 5-6", event: `Final off-ramp consolidation identified at ${downstream[5].name} (F)`, severity: "critical" },
      { time: "Conclusion", event: `Syndicate containment status: 7 of 7 accounts flagged for immediate freeze`, severity: "critical" },
    ],
  };
}
