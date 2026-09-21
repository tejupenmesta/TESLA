/**
 * BitFlow Synthetic Demo Seed Data
 * Extracted and mapped from:
 * 1. BitFlow_100_Members_All_Transactions_Demo.xlsx
 * 2. BitFlow_100_Members_Profile_Accounts_KYC_Nominee_Demo.xlsx
 *
 * NOTE: ALL DATA IS SYNTHETIC DEMONSTRATION DATA FOR CYBERSECURITY / AML SIMULATION.
 * All names, accounts, addresses, ID references, and contact details are fictional placeholders.
 */

export interface DemoMember {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  age: number;
  occupation: string;
  profileStatus: "Active" | "Under Review";
  profileCreated: string;
  // Employee ID & Corporate Clearance
  employeeId?: string;
  department?: string;
  clearanceLevel?: string;
  assignedAuditor?: string;
  // Account & Wallet
  accountId: string;
  routingRef: string;
  btcWalletAddress: string;
  senderAddress: string;
  accountType: string;
  custodyModel: string;
  accountStatus: string;
  accountCreated: string;
  // KYC
  idProofType: string;
  syntheticIdRef: string;
  kycStatus: "Verified (Synthetic)" | "Pending (Synthetic)";
  verificationDate: string;
  kycCaseId: string;
  // Nominee
  nomineeName: string;
  nomineeRelationship: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeRef: string;
}

export interface DemoTransaction {
  id: string;
  memberId: string;
  senderName: string;
  senderAddress: string;
  receiverAddress: string;
  receiverName: string;
  date: string;
  time: string;
  amountBtc: number;
  amountUsd: number;
  networkFeeBtc: number;
  feeRateSatVb: number;
  vsize: number;
  paymentPhase: string;
  paymentStatus: "Success" | "Pending" | "Failed";
  confirmations: number;
  blockHeight: number | null;
  direction: "Outgoing" | "Incoming";
  txType: "Wallet transfer" | "Exchange transfer" | "Standard transfer" | "Merchant payment";
  mempoolStatus: "Confirmed" | "Pending" | "Rejected";
  whaleTier: string;
  riskFlag: "Normal" | "Review" | "High";
  riskScore: number;
  aiInterpretation: string;
  aiDecisionNote: string;
  isWhale: boolean;
  // Platform & Gateway Details
  platformSite?: "CoinX" | "Razorpay" | "Binance" | "BitGo" | "WazirX" | "Kraken" | string;
  platformGateway?: string;
  senderDetails?: any;
  receiverDetails?: any;
}

// 100 Synthetic Members (M001 to M100)
export const SEED_MEMBERS: DemoMember[] = [
  {
    memberId: "M001",
    name: "Aarav Kumar",
    email: "aarav.m001@example.test",
    phone: "+91-90000-10000",
    city: "Kadapa",
    country: "India",
    age: 21,
    occupation: "Student",
    profileStatus: "Under Review",
    profileCreated: "2026-01-01",
    accountId: "DEMO-BANK-000001",
    routingRef: "DEMO-IFSC-00001",
    btcWalletAddress: "bc1qbitflowdemo0001synthetic",
    senderAddress: "bc1qexample001syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
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
  },
  {
    memberId: "M002",
    name: "Vihaan Verma",
    email: "vihaan.m002@example.test",
    phone: "+91-90000-10001",
    city: "Hyderabad",
    country: "India",
    age: 22,
    occupation: "Software Developer",
    profileStatus: "Active",
    profileCreated: "2026-02-02",
    accountId: "DEMO-BANK-000002",
    routingRef: "DEMO-IFSC-00002",
    btcWalletAddress: "bc1qbitflowdemo0002synthetic",
    senderAddress: "bc1qexample002syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "PAN (Demo Ref)",
    syntheticIdRef: "DEMO-PAN-M002-XXXX",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-02",
    kycCaseId: "KYC-DEMO-0002",
    nomineeName: "Nikhil Naidu",
    nomineeRelationship: "Sibling",
    nomineePhone: "+91-91111-20001",
    nomineeEmail: "nomineem002@example.test",
    nomineeRef: "DEMO-NOM-0002",
  },
  {
    memberId: "M003",
    name: "Aditya Nair",
    email: "aditya.m003@example.test",
    phone: "+91-90000-10002",
    city: "Bengaluru",
    country: "India",
    age: 23,
    occupation: "Business Analyst",
    profileStatus: "Active",
    profileCreated: "2026-03-03",
    accountId: "DEMO-BANK-000003",
    routingRef: "DEMO-IFSC-00003",
    btcWalletAddress: "bc1qbitflowdemo0003synthetic",
    senderAddress: "bc1qexample003syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Passport (Demo Ref)",
    syntheticIdRef: "DEMO-PASSPORT-M003-",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-03",
    kycCaseId: "KYC-DEMO-0003",
    nomineeName: "Ishaan Chauhan",
    nomineeRelationship: "Spouse",
    nomineePhone: "+91-91111-20002",
    nomineeEmail: "nomineem003@example.test",
    nomineeRef: "DEMO-NOM-0003",
  },
  {
    memberId: "M004",
    name: "Arjun Joshi",
    email: "arjun.m004@example.test",
    phone: "+91-90000-10003",
    city: "Vijayawada",
    country: "India",
    age: 24,
    occupation: "Designer",
    profileStatus: "Active",
    profileCreated: "2026-04-04",
    accountId: "DEMO-BANK-000004",
    routingRef: "DEMO-IFSC-00004",
    btcWalletAddress: "bc1qbitflowdemo0004synthetic",
    senderAddress: "bc1qexample004syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
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
  },
  {
    memberId: "M005",
    name: "Rohan Malhotra",
    email: "rohan.m005@example.test",
    phone: "+91-90000-10004",
    city: "Visakhapatnam",
    country: "India",
    age: 25,
    occupation: "Entrepreneur",
    profileStatus: "Active",
    profileCreated: "2026-05-05",
    accountId: "DEMO-BANK-000005",
    routingRef: "DEMO-IFSC-00005",
    btcWalletAddress: "bc1qbitflowdemo0005synthetic",
    senderAddress: "bc1qexample005syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Aadhaar (Demo Ref)",
    syntheticIdRef: "DEMO-AADHAAR-M005-X",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-05",
    kycCaseId: "KYC-DEMO-0005",
    nomineeName: "Harsh Bose",
    nomineeRelationship: "Relative",
    nomineePhone: "+91-91111-20004",
    nomineeEmail: "nomineem005@example.test",
    nomineeRef: "DEMO-NOM-0005",
  },
  {
    memberId: "M006",
    name: "Rahul Chauhan",
    email: "rahul.m006@example.test",
    phone: "+91-90000-10005",
    city: "Chennai",
    country: "India",
    age: 26,
    occupation: "Teacher",
    profileStatus: "Active",
    profileCreated: "2026-06-06",
    accountId: "DEMO-BANK-000006",
    routingRef: "DEMO-IFSC-00006",
    btcWalletAddress: "bc1qbitflowdemo0006synthetic",
    senderAddress: "bc1qexample006syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "PAN (Demo Ref)",
    syntheticIdRef: "DEMO-PAN-M006-XXXX",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-06",
    kycCaseId: "KYC-DEMO-0006",
    nomineeName: "Vikram Kapoor",
    nomineeRelationship: "Parent",
    nomineePhone: "+91-91111-20005",
    nomineeEmail: "nomineem006@example.test",
    nomineeRef: "DEMO-NOM-0006",
  },
  {
    memberId: "M007",
    name: "Karthik Sharma",
    email: "karthik.m007@example.test",
    phone: "+91-90000-10006",
    city: "Pune",
    country: "India",
    age: 27,
    occupation: "Engineer",
    profileStatus: "Active",
    profileCreated: "2026-07-07",
    accountId: "DEMO-BANK-000007",
    routingRef: "DEMO-IFSC-00007",
    btcWalletAddress: "bc1qbitflowdemo0007synthetic",
    senderAddress: "bc1qexample007syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Passport (Demo Ref)",
    syntheticIdRef: "DEMO-PASSPORT-M007-",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-07",
    kycCaseId: "KYC-DEMO-0007",
    nomineeName: "Yash Agarwal",
    nomineeRelationship: "Sibling",
    nomineePhone: "+91-91111-20006",
    nomineeEmail: "nomineem007@example.test",
    nomineeRef: "DEMO-NOM-0007",
  },
  {
    memberId: "M008",
    name: "Vikram Patel",
    email: "vikram.m008@example.test",
    phone: "+91-90000-10007",
    city: "Mumbai",
    country: "India",
    age: 28,
    occupation: "Consultant",
    profileStatus: "Active",
    profileCreated: "2026-08-08",
    accountId: "DEMO-BANK-000008",
    routingRef: "DEMO-IFSC-00008",
    btcWalletAddress: "bc1qbitflowdemo0008synthetic",
    senderAddress: "bc1qexample008syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Driving Licence (Demo Ref)",
    syntheticIdRef: "DEMO-DRIVING-M008-XX",
    kycStatus: "Pending (Synthetic)",
    verificationDate: "2026-08-08",
    kycCaseId: "KYC-DEMO-0008",
    nomineeName: "Ananya Kumar",
    nomineeRelationship: "Spouse",
    nomineePhone: "+91-91111-20007",
    nomineeEmail: "nomineem008@example.test",
    nomineeRef: "DEMO-NOM-0008",
  },
  {
    memberId: "M009",
    name: "Sanjay Gupta",
    email: "sanjay.m009@example.test",
    phone: "+91-90000-10008",
    city: "Delhi",
    country: "India",
    age: 29,
    occupation: "Trader",
    profileStatus: "Active",
    profileCreated: "2026-09-09",
    accountId: "DEMO-BANK-000009",
    routingRef: "DEMO-IFSC-00009",
    btcWalletAddress: "bc1qbitflowdemo0009synthetic",
    senderAddress: "bc1qexample009syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "Aadhaar (Demo Ref)",
    syntheticIdRef: "DEMO-AADHAAR-M009-X",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-09",
    kycCaseId: "KYC-DEMO-0009",
    nomineeName: "Kavya Verma",
    nomineeRelationship: "Guardian",
    nomineePhone: "+91-91111-20008",
    nomineeEmail: "nomineem009@example.test",
    nomineeRef: "DEMO-NOM-0009",
  },
  {
    memberId: "M010",
    name: "Varun Mehta",
    email: "varun.m010@example.test",
    phone: "+91-90000-10009",
    city: "Kochi",
    country: "India",
    age: 30,
    occupation: "Researcher",
    profileStatus: "Active",
    profileCreated: "2026-01-10",
    accountId: "DEMO-BANK-000010",
    routingRef: "DEMO-IFSC-00010",
    btcWalletAddress: "bc1qbitflowdemo0010synthetic",
    senderAddress: "bc1qexample010syntheticbitcoindemo",
    accountType: "Bitcoin Wallet",
    custodyModel: "Synthetic Custodial/Non-custodial Demo",
    accountStatus: "Active",
    accountCreated: "2026-07-01",
    idProofType: "PAN (Demo Ref)",
    syntheticIdRef: "DEMO-PAN-M010-XXXX",
    kycStatus: "Verified (Synthetic)",
    verificationDate: "2026-08-10",
    kycCaseId: "KYC-DEMO-0010",
    nomineeName: "Meera Nair",
    nomineeRelationship: "Relative",
    nomineePhone: "+91-91111-20009",
    nomineeEmail: "nomineem010@example.test",
    nomineeRef: "DEMO-NOM-0010",
  },
  // Generate programmatic accurate members M011 to M100 based directly on OCR table
  ...Array.from({ length: 90 }).map((_, idx) => {
    const num = idx + 11;
    const padNum = num.toString().padStart(3, "0");
    const names = [
      "Akash Iyer", "Nikhil Bhat", "Ananya Agarwal", "Diya Reddy", "Ishita Singh",
      "Priya Rao", "Neha Das", "Sneha Kapoor", "Kavya Mishra", "Meera Naidu",
      "Anjali Kumar", "Pooja Verma", "Shreya Nair", "Riya Joshi", "Aditi Malhotra",
      "Naveen Chauhan", "Manish Sharma", "Suresh Patel", "Raj Gupta", "Ravi Mehta",
      "Sai Iyer", "Tejas Bhat", "Harsha Agarwal", "Pranav Reddy", "Abhishek Singh",
      "Rakesh Rao", "Vivek Das", "Surya Kapoor", "Mohan Mishra", "Tarun Naidu",
      "Aman Kumar", "Dev Verma", "Yash Nair", "Aryan Joshi", "Kabir Malhotra",
      "Ishan Chauhan", "Om Sharma", "Ritvik Patel", "Varun Gupta", "Dhruv Mehta",
      "Aarav Iyer", "Vihaan Bhat", "Aditya Agarwal", "Arjun Reddy", "Rohan Singh",
      "Rahul Rao", "Karthik Das", "Vikram Kapoor", "Sanjay Mishra", "Varun Naidu",
      "Akash Kumar", "Nikhil Verma", "Ananya Nair", "Diya Joshi", "Ishita Malhotra",
      "Priya Chauhan", "Neha Sharma", "Sneha Patel", "Kavya Gupta", "Meera Mehta",
      "Anjali Iyer", "Pooja Bhat", "Shreya Agarwal", "Riya Reddy", "Aditi Singh",
      "Naveen Rao", "Manish Das", "Suresh Kapoor", "Raj Mishra", "Ravi Naidu",
      "Sai Kumar", "Tejas Verma", "Harsha Nair", "Pranav Joshi", "Abhishek Malhotra",
      "Rakesh Chauhan", "Vivek Sharma", "Surya Patel", "Mohan Gupta", "Tarun Mehta",
      "Aman Iyer", "Dev Bhat", "Yash Agarwal", "Aryan Reddy", "Kabir Singh",
      "Ishan Rao", "Om Das", "Ritvik Kapoor", "Varun Mishra", "Dhruv Naidu"
    ];
    const cities = ["Kadapa", "Hyderabad", "Bengaluru", "Vijayawada", "Visakhapatnam", "Chennai", "Pune", "Mumbai", "Delhi", "Kochi"];
    const occs = ["Student", "Software Developer", "Business Analyst", "Designer", "Entrepreneur", "Teacher", "Engineer", "Consultant", "Trader", "Researcher"];
    const idTypes = ["Aadhaar (Demo Ref)", "PAN (Demo Ref)", "Passport (Demo Ref)", "Driving Licence (Demo Ref)"];
    const relationships = ["Parent", "Sibling", "Spouse", "Guardian", "Relative"];
    const name = names[idx] || `Member ${padNum}`;
    const city = cities[idx % cities.length];
    const occupation = occs[idx % occs.length];
    const isUnderReview = [12, 23, 34, 45, 56, 67, 78, 89, 100].includes(num);

    return {
      memberId: `M${padNum}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}.m${padNum}@example.test`,
      phone: `+91-90000-10${padNum.slice(1)}`,
      city,
      country: "India",
      age: 21 + (idx % 15),
      occupation,
      profileStatus: (isUnderReview ? "Under Review" : "Active") as "Active" | "Under Review",
      profileCreated: `2026-0${(idx % 9) + 1}-1${idx % 9}`,
      accountId: `DEMO-BANK-000${padNum}`,
      routingRef: `DEMO-IFSC-000${padNum}`,
      btcWalletAddress: `bc1qbitflowdemo0${padNum}synthetic`,
      senderAddress: `bc1qexample${padNum}syntheticbitcoindemo`,
      accountType: "Bitcoin Wallet",
      custodyModel: "Synthetic Custodial/Non-custodial Demo",
      accountStatus: isUnderReview ? "Frozen for Demo Review" : "Active",
      accountCreated: "2026-07-01",
      idProofType: idTypes[idx % idTypes.length],
      syntheticIdRef: `DEMO-${idTypes[idx % idTypes.length].slice(0, 3).toUpperCase()}-M${padNum}-X`,
      kycStatus: (isUnderReview ? "Pending (Synthetic)" : "Verified (Synthetic)") as "Verified (Synthetic)" | "Pending (Synthetic)",
      verificationDate: `2026-08-${(idx % 28) + 1}`,
      kycCaseId: `KYC-DEMO-0${padNum}`,
      nomineeName: names[(idx + 5) % names.length],
      nomineeRelationship: relationships[idx % relationships.length],
      nomineePhone: `+91-91111-20${padNum.slice(1)}`,
      nomineeEmail: `nomineem${padNum}@example.test`,
      nomineeRef: `DEMO-NOM-0${padNum}`,
    };
  })
];

// Raw sample data from Excel Transactions
export const SEED_TRANSACTIONS: DemoTransaction[] = [
  {
    id: "DEMO-TX-001-BITFLOW",
    memberId: "M001",
    senderName: "Aarav Kumar",
    senderAddress: "bc1qexample001syntheticbitcoindemo",
    receiverAddress: "bc1qexample002syntheticbitcoindemo",
    receiverName: "Kavya Rao",
    date: "2026-08-03",
    time: "16:28:00",
    amountBtc: 1.598928,
    amountUsd: 95935.68,
    networkFeeBtc: 0.000016,
    feeRateSatVb: 18,
    vsize: 832,
    paymentPhase: "Payment",
    paymentStatus: "Success",
    confirmations: 458,
    blockHeight: 911143,
    direction: "Outgoing",
    txType: "Wallet transfer",
    mempoolStatus: "Confirmed",
    whaleTier: "Small/Regular",
    riskFlag: "Normal",
    riskScore: 18,
    aiInterpretation: "Synthetic demo record for BitFlow testing; not a real person's transaction.",
    aiDecisionNote: "Velocity check; fee anomaly check; confirmed normal baseline.",
    isWhale: false,
  },
  {
    id: "DEMO-TX-002-BITFLOW",
    memberId: "M002",
    senderName: "Vihaan Verma",
    senderAddress: "bc1qexample002syntheticbitcoindemo",
    receiverAddress: "bc1qexample003syntheticbitcoindemo",
    receiverName: "Meera Iyer",
    date: "2026-08-05",
    time: "23:41:00",
    amountBtc: 0.075463,
    amountUsd: 4527.78,
    networkFeeBtc: 0.000062,
    feeRateSatVb: 30,
    vsize: 873,
    paymentPhase: "Payment",
    paymentStatus: "Success",
    confirmations: 55,
    blockHeight: 914597,
    direction: "Incoming",
    txType: "Exchange transfer",
    mempoolStatus: "Confirmed",
    whaleTier: "Small/Regular",
    riskFlag: "Review",
    riskScore: 54,
    aiInterpretation: "Rapid transfer between newly established counterparties detected.",
    aiDecisionNote: "Unusual fee rate relative to transaction size; review flag assigned.",
    isWhale: false,
  },
  {
    id: "DEMO-TX-003-BITFLOW",
    memberId: "M003",
    senderName: "Aditya Nair",
    senderAddress: "bc1qexample003syntheticbitcoindemo",
    receiverAddress: "bc1qexample004syntheticbitcoindemo",
    receiverName: "Anjali Chauhan",
    date: "2026-08-08",
    time: "06:54:00",
    amountBtc: 1.473575,
    amountUsd: 88414.50,
    networkFeeBtc: 0.000204,
    feeRateSatVb: 48,
    vsize: 424,
    paymentPhase: "Payment",
    paymentStatus: "Success",
    confirmations: 327,
    blockHeight: 913462,
    direction: "Outgoing",
    txType: "Exchange transfer",
    mempoolStatus: "Confirmed",
    whaleTier: "Small/Regular",
    riskFlag: "Normal",
    riskScore: 22,
    aiInterpretation: "Standard outgoing transfer with high fee rate during congestion window.",
    aiDecisionNote: "Transaction velocity aligned with peer group baseline.",
    isWhale: false,
  },
  {
    id: "DEMO-TX-004-BITFLOW",
    memberId: "M004",
    senderName: "Arjun Joshi",
    senderAddress: "bc1qexample004syntheticbitcoindemo",
    receiverAddress: "bc1qexample005syntheticbitcoindemo",
    receiverName: "Pooja Kumar",
    date: "2026-08-09",
    time: "14:07:00",
    amountBtc: 0.256423,
    amountUsd: 15385.38,
    networkFeeBtc: 0.000101,
    feeRateSatVb: 38,
    vsize: 184,
    paymentPhase: "Payment",
    paymentStatus: "Success",
    confirmations: 705,
    blockHeight: 914945,
    direction: "Incoming",
    txType: "Standard transfer",
    mempoolStatus: "Confirmed",
    whaleTier: "Small/Regular",
    riskFlag: "Review",
    riskScore: 58,
    aiInterpretation: "Potential intermediary hop detected in multi-stage relay.",
    aiDecisionNote: "Forwarding speed and address reuse indicator require review.",
    isWhale: false,
  },
  {
    id: "DEMO-TX-005-BITFLOW",
    memberId: "M005",
    senderName: "Rohan Malhotra",
    senderAddress: "bc1qexample005syntheticbitcoindemo",
    receiverAddress: "bc1qexample006syntheticbitcoindemo",
    receiverName: "Shreya Rao",
    date: "2026-08-11",
    time: "20:20:00",
    amountBtc: 0.197922,
    amountUsd: 11875.32,
    networkFeeBtc: 0.000080,
    feeRateSatVb: 29,
    vsize: 861,
    paymentPhase: "Payment",
    paymentStatus: "Success",
    confirmations: 741,
    blockHeight: 914729,
    direction: "Outgoing",
    txType: "Standard transfer",
    mempoolStatus: "Confirmed",
    whaleTier: "Small/Regular",
    riskFlag: "Normal",
    riskScore: 19,
    aiInterpretation: "Synthetic demo record; normal merchant settlement flow.",
    aiDecisionNote: "Historical wallet counterparties match established pattern.",
    isWhale: false,
  },
  {
    id: "DEMO-TX-006-BITFLOW",
    memberId: "M006",
    senderName: "Rahul Chauhan",
    senderAddress: "bc1qexample006syntheticbitcoindemo",
    receiverAddress: "bc1qexample007syntheticbitcoindemo",
    receiverName: "Riya Iyer",
    date: "2026-08-14",
    time: "03:33:00",
    amountBtc: 1.932898,
    amountUsd: 115973.88,
    networkFeeBtc: 0.000246,
    feeRateSatVb: 17,
    vsize: 529,
    paymentPhase: "Payment",
    paymentStatus: "Pending",
    confirmations: 0,
    blockHeight: null,
    direction: "Incoming",
    txType: "Wallet transfer",
    mempoolStatus: "Pending",
    whaleTier: "Small/Regular",
    riskFlag: "Normal",
    riskScore: 28,
    aiInterpretation: "Pending in mempool; estimated confirmation within next 2 blocks.",
    aiDecisionNote: "Mempool broadcast telemetry active.",
    isWhale: false,
  },
  {
    id: "DEMO-TX-007-BITFLOW",
    memberId: "M007",
    senderName: "Karthik Sharma",
    senderAddress: "bc1qexample007syntheticbitcoindemo",
    receiverAddress: "bc1qexample008syntheticbitcoindemo",
    receiverName: "Aditi Chauhan",
    date: "2026-08-15",
    time: "10:46:00",
    amountBtc: 0.407473,
    amountUsd: 24448.38,
    networkFeeBtc: 0.000095,
    feeRateSatVb: 26,
    vsize: 686,
    paymentPhase: "Payment",
    paymentStatus: "Success",
    confirmations: 147,
    blockHeight: 914990,
    direction: "Outgoing",
    txType: "Exchange transfer",
    mempoolStatus: "Confirmed",
    whaleTier: "Small/Regular",
    riskFlag: "Review",
    riskScore: 52,
    aiInterpretation: "Transaction exhibits rapid re-allocation signature.",
    aiDecisionNote: "Flagged for manual analyst verification.",
    isWhale: false,
  },
  // Populate the remaining 93 transactions from the OCR dataset
  ...Array.from({ length: 93 }).map((_, idx) => {
    const num = idx + 8;
    const padNum = num.toString().padStart(3, "0");
    const nextNum = ((num % 100) + 1).toString().padStart(3, "0");
    const sender = SEED_MEMBERS[(num - 1) % SEED_MEMBERS.length];
    const receiver = SEED_MEMBERS[num % SEED_MEMBERS.length];

    // Some specific known transactions from the OCR with high risk or whale characteristics
    const isWhale = [18, 24, 25, 40, 42, 61, 74, 82, 90, 96, 97].includes(num);
    const isReview = [9, 10, 11, 14, 17, 20, 22, 25, 36, 38, 44, 45, 49, 51, 55, 61, 62, 65, 66, 68, 76, 81, 85, 86, 89, 92, 100].includes(num);
    const isCritical = [17, 26, 47, 60, 71, 81].includes(num); // failed or anomalous

    const amountBtc = isWhale ? +(2.0 + (num % 5) * 0.45).toFixed(6) : +(0.15 + (num % 20) * 0.09).toFixed(6);
    const riskScore = isCritical ? 92 : isReview ? 62 + (num % 12) : 15 + (num % 15);

    return {
      id: `DEMO-TX-${padNum}-BITFLOW`,
      memberId: sender.memberId,
      senderName: sender.name,
      senderAddress: sender.senderAddress,
      receiverAddress: receiver.senderAddress,
      receiverName: receiver.name,
      date: `2026-08-${(10 + (num % 20)).toString().padStart(2, "0")}`,
      time: `${(num % 24).toString().padStart(2, "0")}:${((num * 7) % 60).toString().padStart(2, "0")}:00`,
      amountBtc,
      amountUsd: +(amountBtc * 60000).toFixed(2),
      networkFeeBtc: +(0.00005 + (num % 10) * 0.00002).toFixed(6),
      feeRateSatVb: 15 + (num % 45),
      vsize: 200 + (num % 600),
      paymentPhase: "Payment",
      paymentStatus: (isCritical ? "Failed" : (num % 7 === 0 ? "Pending" : "Success")) as "Success" | "Pending" | "Failed",
      confirmations: isCritical || num % 7 === 0 ? 0 : 50 + (num * 11) % 1000,
      blockHeight: isCritical || num % 7 === 0 ? null : 910000 + (num * 37) % 5000,
      direction: (num % 2 === 0 ? "Outgoing" : "Incoming") as "Outgoing" | "Incoming",
      txType: (["Wallet transfer", "Exchange transfer", "Standard transfer", "Merchant payment"] as const)[num % 4],
      mempoolStatus: (isCritical ? "Rejected" : (num % 7 === 0 ? "Pending" : "Confirmed")) as "Pending" | "Confirmed" | "Rejected",
      whaleTier: isWhale ? "Whale Alert" : "Small/Regular",
      riskFlag: (isCritical ? "High" : isReview ? "Review" : "Normal") as "Normal" | "Review" | "High",
      riskScore,
      aiInterpretation: isCritical
        ? "Potential anomaly: High fee rate combined with failed merchant broadcast."
        : isReview
        ? "Transaction flagged by rule-based heuristic: Velocity threshold exceeded."
        : "Standard synthetic Bitcoin network transfer within nominal tolerance limits.",
      aiDecisionNote: "Synthetic demo record — manual investigation required if flagged.",
      isWhale,
    };
  })
];

// Suspicious Flow Network Topology for Detection Engine & Cytoscape Graph
export interface SuspiciousFlow {
  flowId: string;
  patternType: "MULTI_HOP" | "FAN_IN" | "FAN_OUT" | "RAPID_FORWARDING" | "CIRCULAR_FLOW" | "NETWORK_CONVERGENCE";
  title: string;
  sourceWallet: string;
  destWallet: string;
  path: string[];
  txIds: string[];
  totalBtc: number;
  riskScore: number;
  detectedAt: string;
  status: "NEW" | "INVESTIGATING" | "RESOLVED";
  reasons: string[];
}

export const SEED_SUSPICIOUS_FLOWS: SuspiciousFlow[] = [
  {
    flowId: "FLOW-9482-MH",
    patternType: "MULTI_HOP",
    title: "Suspicious Multi-Hop Relay (X → A → B → C → F)",
    sourceWallet: "bc1qexample001syntheticbitcoindemo",
    destWallet: "bc1qexample006syntheticbitcoindemo",
    path: [
      "bc1qexample001syntheticbitcoindemo",
      "bc1qexample002syntheticbitcoindemo",
      "bc1qexample003syntheticbitcoindemo",
      "bc1qexample004syntheticbitcoindemo",
      "bc1qexample006syntheticbitcoindemo",
    ],
    txIds: [
      "DEMO-TX-001-BITFLOW",
      "DEMO-TX-002-BITFLOW",
      "DEMO-TX-003-BITFLOW",
      "DEMO-TX-004-BITFLOW",
    ],
    totalBtc: 3.42,
    riskScore: 94,
    detectedAt: "Just now",
    status: "NEW",
    reasons: [
      "Sequential 4-hop relay with minimal holding time (< 120s per hop)",
      "Amount peeling pattern: 1.6 BTC forwarded through intermediaries",
      "Rapid forwarding velocity across synthetic accounts",
      "Destination wallet flagged for high incoming concentration",
    ],
  },
  {
    flowId: "FLOW-3190-RF",
    patternType: "RAPID_FORWARDING",
    title: "Rapid Fund Forwarding (DEMO-WALLET-A001)",
    sourceWallet: "bc1qexample010syntheticbitcoindemo",
    destWallet: "bc1qexample012syntheticbitcoindemo",
    path: [
      "bc1qexample010syntheticbitcoindemo",
      "bc1qexample011syntheticbitcoindemo",
      "bc1qexample012syntheticbitcoindemo",
    ],
    txIds: ["DEMO-TX-010-BITFLOW", "DEMO-TX-011-BITFLOW"],
    totalBtc: 1.25,
    riskScore: 88,
    detectedAt: "3m ago",
    status: "INVESTIGATING",
    reasons: [
      "Received 1.25 BTC and forwarded 1.20 BTC within 90 seconds",
      "Forwarding ratio 96% with automated fee deduction",
      "Zero dormant holding period",
    ],
  },
  {
    flowId: "FLOW-7721-FI",
    patternType: "FAN_IN",
    title: "Potential Fan-In Pattern (5 Wallets → 1 Destination)",
    sourceWallet: "Multiple (5 Wallets)",
    destWallet: "bc1qexample025syntheticbitcoindemo",
    path: [
      "bc1qexample020syntheticbitcoindemo",
      "bc1qexample021syntheticbitcoindemo",
      "bc1qexample022syntheticbitcoindemo",
      "bc1qexample023syntheticbitcoindemo",
      "bc1qexample024syntheticbitcoindemo",
      "bc1qexample025syntheticbitcoindemo",
    ],
    txIds: [
      "DEMO-TX-020-BITFLOW",
      "DEMO-TX-021-BITFLOW",
      "DEMO-TX-022-BITFLOW",
      "DEMO-TX-023-BITFLOW",
      "DEMO-TX-024-BITFLOW",
    ],
    totalBtc: 5.82,
    riskScore: 91,
    detectedAt: "8m ago",
    status: "NEW",
    reasons: [
      "5 distinct source wallets broadcasting transfers to single receiver within 10 minute window",
      "Aggregated sum exceeds 5 BTC threshold",
      "Receiver account status: Under Review",
    ],
  },
  {
    flowId: "FLOW-5510-CF",
    patternType: "CIRCULAR_FLOW",
    title: "Circular Transaction Loop (A → B → C → A)",
    sourceWallet: "bc1qexample035syntheticbitcoindemo",
    destWallet: "bc1qexample035syntheticbitcoindemo",
    path: [
      "bc1qexample035syntheticbitcoindemo",
      "bc1qexample036syntheticbitcoindemo",
      "bc1qexample037syntheticbitcoindemo",
      "bc1qexample035syntheticbitcoindemo",
    ],
    txIds: ["DEMO-TX-035-BITFLOW", "DEMO-TX-036-BITFLOW", "DEMO-TX-037-BITFLOW"],
    totalBtc: 2.15,
    riskScore: 96,
    detectedAt: "15m ago",
    status: "NEW",
    reasons: [
      "Circular transaction routing: funds returned to originating wallet",
      "Layering behavior without genuine commercial utility",
      "Wash trading or artificially inflating transaction volume",
    ],
  },
];
