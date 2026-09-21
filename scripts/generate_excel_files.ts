import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { SEED_MEMBERS, SEED_TRANSACTIONS } from "../src/data/seedData";

console.log("Generating BitFlow synthetic demo Excel workbooks...");

// 1. BitFlow_100_Members_All_Transactions_Demo.xlsx
const wbTx = XLSX.utils.book_new();
const txRows = SEED_TRANSACTIONS.map((t) => ({
  "Member ID": t.memberId,
  "Example Person Name": t.senderName,
  "Sender Account / BTC Address": t.senderAddress,
  "Receiver / Transferred Account": t.receiverAddress,
  "Receiver Example Name": t.receiverName,
  "Transaction ID": t.id,
  "Date": t.date,
  "Time": t.time,
  "Amount (BTC)": t.amountBtc,
  "Approx. Payment Value (USD)": t.amountUsd,
  "Network Fee (BTC)": t.networkFeeBtc,
  "Fee Rate (sat/vB)": t.feeRateSatVb,
  "Transaction Size (vBytes)": t.vsize,
  "Payment Phase": t.paymentPhase,
  "Payment Status": t.paymentStatus,
  "Confirmations": t.confirmations,
  "Block Height": t.blockHeight !== null ? t.blockHeight : "Not confirmed",
  "Direction": t.direction,
  "Transaction Type": t.txType,
  "Mempool Status": t.mempoolStatus,
  "Whale Tier": t.whaleTier,
  "Risk Flag": t.riskFlag,
  "AI Interpretation": t.aiInterpretation,
  "Data Source": "Synthetic demo record for BitFlow testing; not a real person's transaction. (DATA_SOURCE = SYNTHETIC_DEMO_EXCEL)",
}));
const wsTx = XLSX.utils.json_to_sheet(txRows);
XLSX.utils.book_append_sheet(wbTx, wsTx, "Transactions_100");

const txRiskMetadata = SEED_TRANSACTIONS.map((t) => ({
  "Member ID": t.memberId,
  "Transaction ID": t.id,
  "Payment Status": t.paymentStatus,
  "Confirmations": t.confirmations,
  "Block Height": t.blockHeight !== null ? t.blockHeight : "Not confirmed",
  "Existing Risk Flag": t.riskFlag,
  "Demo Risk Level": t.riskScore >= 75 ? "Critical" : t.riskScore >= 50 ? "High" : t.riskScore >= 25 ? "Medium" : "Low",
  "AI Checks Applied": "Velocity check; fee anomaly check; confirmation verification; isolation forest outlier baseline.",
  "AI Decision Note": t.aiDecisionNote || "Synthetic demo — not a financial decision. Automated pattern analysis only.",
  "Verification Note": "No real person / account verification performed. Synthetic benchmark dataset.",
}));
const wsTxMeta = XLSX.utils.json_to_sheet(txRiskMetadata);
XLSX.utils.book_append_sheet(wbTx, wsTxMeta, "Risk_Metadata");

const txFilePath = path.join(process.cwd(), "BitFlow_100_Members_All_Transactions_Demo.xlsx");
XLSX.writeFile(wbTx, txFilePath);
console.log(`Generated: ${txFilePath}`);

// 2. BitFlow_100_Members_Profile_Accounts_KYC_Nominee_Demo.xlsx
const wbProfile = XLSX.utils.book_new();

// Sheet 1: Overview
const overviewRows = [
  { Field: "Purpose", Value: "BitFlow 100-member synthetic demo dataset for a Bitcoin transaction monitoring project." },
  { Field: "Important", Value: "ALL names, addresses, account numbers, ID references, nominees and contact details are fictional placeholders." },
  { Field: "Privacy", Value: "No real Aadhaar/PAN/passport/driver-license numbers are included. ID fields are deliberately masked/non-valid demo references." },
  { Field: "Use", Value: "Suitable for UI demos, dashboards, database testing, analytics and hackathon presentations." },
  { Field: "Source", Value: "DATA_SOURCE = SYNTHETIC_DEMO_EXCEL" },
  { Field: "Structure", Value: "Member Profiles, Account Details, Demo KYC, Nominees, Transaction Summary, Risk & AI Metadata." },
];
const wsOverview = XLSX.utils.json_to_sheet(overviewRows);
XLSX.utils.book_append_sheet(wbProfile, wsOverview, "Dataset_Info");

// Sheet 2: Member_Profiles
const profileRows = SEED_MEMBERS.map((m) => ({
  "Member ID": m.memberId,
  "Example Person Name": m.name,
  "Demo Email": m.email,
  "Demo Phone": m.phone,
  "City": m.city,
  "Country": m.country,
  "Age (Demo)": m.age,
  "Occupation (Demo)": m.occupation,
  "Profile Status": m.profileStatus,
  "Profile Created": m.profileCreated,
}));
const wsProfiles = XLSX.utils.json_to_sheet(profileRows);
XLSX.utils.book_append_sheet(wbProfile, wsProfiles, "Member_Profiles");

// Sheet 3: Account_Details
const accountRows = SEED_MEMBERS.map((m) => ({
  "Member ID": m.memberId,
  "Account Holder": m.name,
  "Demo Bank/Account ID": m.accountId,
  "Demo Routing/IFSC Ref": m.routingRef,
  "Demo BTC Wallet Address": m.btcWalletAddress,
  "Account Type": m.accountType,
  "Custody Model": m.custodyModel,
  "Account Status": m.accountStatus,
  "Account Created": m.accountCreated,
}));
const wsAccounts = XLSX.utils.json_to_sheet(accountRows);
XLSX.utils.book_append_sheet(wbProfile, wsAccounts, "Account_Details");

// Sheet 4: Demo_KYC
const kycRows = SEED_MEMBERS.map((m) => ({
  "Member ID": m.memberId,
  "Name": m.name,
  "ID Proof Type": m.idProofType,
  "Synthetic ID Reference": m.syntheticIdRef,
  "KYC Status": m.kycStatus,
  "Verification Date": m.verificationDate,
  "Document Note": "No real document stored. Masked synthetic reference.",
  "KYC Case ID": m.kycCaseId,
}));
const wsKyc = XLSX.utils.json_to_sheet(kycRows);
XLSX.utils.book_append_sheet(wbProfile, wsKyc, "Demo_KYC");

// Sheet 5: Nominees
const nomineeRows = SEED_MEMBERS.map((m) => ({
  "Member ID": m.memberId,
  "Account Holder": m.name,
  "Nominee Example Name": m.nomineeName,
  "Relationship": m.nomineeRelationship,
  "Demo Nominee Phone": m.nomineePhone,
  "Demo Nominee Email": m.nomineeEmail,
  "Nominee Reference": m.nomineeRef,
  "Data Note": "Synthetic only. Fictional placeholder.",
}));
const wsNominees = XLSX.utils.json_to_sheet(nomineeRows);
XLSX.utils.book_append_sheet(wbProfile, wsNominees, "Nominees");

const profileFilePath = path.join(process.cwd(), "BitFlow_100_Members_Profile_Accounts_KYC_Nominee_Demo.xlsx");
XLSX.writeFile(wbProfile, profileFilePath);
console.log(`Generated: ${profileFilePath}`);
console.log("Excel Generation Complete.");
