-- =============================================================================
-- BitFlow Cyber Threat Intelligence & AML Platform
-- Production PostgreSQL Database DDL Schema (14 Tables)
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USERS TABLE
-- Core platform credentials, identity, and RBAC roles
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    role VARCHAR(50) NOT NULL DEFAULT 'ANALYST', -- 'ADMIN', 'ANALYST', 'VIEWER'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 2. MEMBERS TABLE
-- Synthetic KYC demo profiles, personal identity, and risk ratings (M001-M100)
-- =============================================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(32) NOT NULL UNIQUE, -- e.g. M001, M002 ... M100
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    occupation VARCHAR(100),
    annual_income_inr NUMERIC(18, 2),
    profile_status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Review', 'Suspended'
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'Verified', -- 'Verified', 'Pending', 'Flagged'
    synthetic_id_ref VARCHAR(128),
    nominee_name VARCHAR(255),
    nominee_relation VARCHAR(100),
    risk_rating VARCHAR(50) NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Critical'
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_profile_status ON members(profile_status);
CREATE INDEX IF NOT EXISTS idx_members_kyc_status ON members(kyc_status);
CREATE INDEX IF NOT EXISTS idx_members_risk_rating ON members(risk_rating);

CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 3. ACCOUNTS TABLE
-- Financial custody and fiat/banking settlement accounts linked to members
-- =============================================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(64) NOT NULL UNIQUE, -- e.g. DEMO-BANK-000001
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL DEFAULT 'BitFlow Treasury Bank',
    account_type VARCHAR(50) NOT NULL DEFAULT 'Savings', -- 'Savings', 'Current', 'Escrow', 'Custody'
    ifsc_code VARCHAR(32) DEFAULT 'BITF0001928',
    branch VARCHAR(100) DEFAULT 'Main FinTech Hub',
    balance_fiat NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Frozen', 'Closed', 'Restricted'
    daily_limit_fiat NUMERIC(18, 2) DEFAULT 1000000.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_member_id ON accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 4. WALLETS TABLE
-- Bitcoin cryptocurrency on-chain addresses, balances, and custody tiers
-- =============================================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(128) NOT NULL UNIQUE, -- bc1qexample...
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    label VARCHAR(100),
    wallet_type VARCHAR(50) NOT NULL DEFAULT 'SegWit (Native)', -- 'SegWit (Native)', 'Taproot', 'Legacy', 'Multisig'
    balance_btc NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    unconfirmed_btc NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    total_received_btc NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    total_sent_btc NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    tx_count INTEGER NOT NULL DEFAULT 0,
    derivation_path VARCHAR(100) DEFAULT "m/84'/0'/0'/0/0",
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_member_id ON wallets(member_id);
CREATE INDEX IF NOT EXISTS idx_wallets_account_id ON wallets(account_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance_btc ON wallets(balance_btc DESC);
CREATE INDEX IF NOT EXISTS idx_wallets_is_flagged ON wallets(is_flagged);

CREATE TRIGGER trg_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 5. TRANSACTIONS TABLE
-- Bitcoin on-chain and mempool ledger settlement records
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_id VARCHAR(128) NOT NULL UNIQUE, -- e.g. DEMO-TX-001-BITFLOW
    tx_hash VARCHAR(128) UNIQUE, -- On-chain 64-char hex hash
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_address VARCHAR(128) NOT NULL,
    receiver_address VARCHAR(128) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    amount_btc NUMERIC(18, 8) NOT NULL,
    amount_usd NUMERIC(18, 2) NOT NULL,
    network_fee_btc NUMERIC(18, 8) NOT NULL DEFAULT 0.00001000,
    fee_rate_sat_vb NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    vsize INTEGER NOT NULL DEFAULT 225,
    confirmations INTEGER NOT NULL DEFAULT 0,
    block_height INTEGER,
    payment_phase VARCHAR(50) NOT NULL DEFAULT 'Payment', -- 'Pre-Payment', 'Payment', 'Post-Payment'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Success', -- 'Success', 'Pending', 'Failed'
    direction VARCHAR(50) NOT NULL DEFAULT 'Outgoing', -- 'Incoming', 'Outgoing', 'Internal'
    tx_type VARCHAR(50) NOT NULL DEFAULT 'Wallet transfer', -- 'Wallet transfer', 'Exchange transfer', 'P2P'
    mempool_status VARCHAR(50) NOT NULL DEFAULT 'Confirmed', -- 'Confirmed', 'In Mempool', 'Accelerated'
    is_whale BOOLEAN NOT NULL DEFAULT FALSE,
    whale_tier VARCHAR(50) DEFAULT 'Small/Regular', -- 'Small/Regular', 'Tier-1 Whale', 'Tier-2 Whale', 'Mega Whale'
    risk_flag VARCHAR(50) NOT NULL DEFAULT 'Normal', -- 'Normal', 'Review', 'High Risk', 'Critical'
    risk_score INTEGER NOT NULL DEFAULT 10, -- 0-100
    ai_interpretation TEXT,
    ai_decision_note TEXT,
    raw_tx_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_tx_id ON transactions(tx_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_address ON transactions(sender_address);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_address ON transactions(receiver_address);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_score ON transactions(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_flag ON transactions(risk_flag);
CREATE INDEX IF NOT EXISTS idx_transactions_is_whale ON transactions(is_whale);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 6. RISK_ASSESSMENTS TABLE
-- Explainable ML and rule-based risk evaluation factors and reasoning
-- =============================================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    wallet_address VARCHAR(128) NOT NULL,
    composite_score INTEGER NOT NULL, -- 0-100
    risk_tier VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    velocity_score INTEGER NOT NULL DEFAULT 0,
    amount_anomaly_score INTEGER NOT NULL DEFAULT 0,
    fan_in_out_score INTEGER NOT NULL DEFAULT 0,
    peeling_chain_score INTEGER NOT NULL DEFAULT 0,
    counterparty_risk_score INTEGER NOT NULL DEFAULT 0,
    heuristic_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    ml_isolation_score NUMERIC(6, 4) DEFAULT 0.0000,
    confidence_pct INTEGER NOT NULL DEFAULT 95,
    summary TEXT NOT NULL,
    decision_reasoning TEXT NOT NULL,
    assessed_by VARCHAR(100) DEFAULT 'BitFlow-AI-HeuristicEngine-v3',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_tx_id ON risk_assessments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_wallet_address ON risk_assessments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_tier ON risk_assessments(risk_tier);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_composite_score ON risk_assessments(composite_score DESC);

-- =============================================================================
-- 7. WALLET_FEATURES TABLE
-- Rolling statistical features, z-scores, velocity, and entropy tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS wallet_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(128) NOT NULL UNIQUE,
    inflow_btc_24h NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    outflow_btc_24h NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    tx_count_24h INTEGER NOT NULL DEFAULT 0,
    inflow_btc_7d NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    outflow_btc_7d NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    tx_count_7d INTEGER NOT NULL DEFAULT 0,
    avg_holding_duration_sec INTEGER NOT NULL DEFAULT 86400,
    unique_counterparties_count INTEGER NOT NULL DEFAULT 1,
    velocity_zscore NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    amount_zscore NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    fan_in_ratio NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    fan_out_ratio NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    rapid_forwarding_rate NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    cluster_affinity_score INTEGER NOT NULL DEFAULT 0,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_features_address ON wallet_features(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_features_velocity_zscore ON wallet_features(velocity_zscore DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_features_risk_level ON wallet_features(risk_level);

-- =============================================================================
-- 8. NETWORK_EDGES TABLE
-- Directed graph fund transfer edges for graph traversal and hop identification
-- =============================================================================
CREATE TABLE IF NOT EXISTS network_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    source_wallet VARCHAR(128) NOT NULL,
    target_wallet VARCHAR(128) NOT NULL,
    source_member_id VARCHAR(32),
    target_member_id VARCHAR(32),
    amount_btc NUMERIC(18, 8) NOT NULL,
    amount_usd NUMERIC(18, 2) NOT NULL,
    hop_order INTEGER NOT NULL DEFAULT 1,
    flow_type VARCHAR(50) NOT NULL DEFAULT 'DIRECT', -- 'DIRECT', 'PEELING_CHAIN', 'RAPID_FORWARD', 'FAN_IN', 'FAN_OUT'
    is_cycle BOOLEAN NOT NULL DEFAULT FALSE,
    latency_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_network_edges_source ON network_edges(source_wallet);
CREATE INDEX IF NOT EXISTS idx_network_edges_target ON network_edges(target_wallet);
CREATE INDEX IF NOT EXISTS idx_network_edges_tx_id ON network_edges(transaction_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_flow_type ON network_edges(flow_type);

-- =============================================================================
-- 9. NETWORK_CLUSTERS TABLE
-- Entity clusters, multi-input heuristic groups, and peeling syndicates
-- =============================================================================
CREATE TABLE IF NOT EXISTS network_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_name VARCHAR(100) NOT NULL UNIQUE,
    cluster_type VARCHAR(50) NOT NULL, -- 'MULTI_HOP_SYNDICATE', 'RAPID_DISPERSAL', 'CIRCULAR_WASH', 'CONVERGENCE_HUB'
    root_wallet VARCHAR(128) NOT NULL,
    wallet_count INTEGER NOT NULL DEFAULT 1,
    transaction_count INTEGER NOT NULL DEFAULT 1,
    total_volume_btc NUMERIC(18, 8) NOT NULL DEFAULT 0.00000000,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'MEDIUM', 'HIGH', 'CRITICAL'
    associated_member_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    heuristic_signature VARCHAR(128) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_network_clusters_type ON network_clusters(cluster_type);
CREATE INDEX IF NOT EXISTS idx_network_clusters_risk ON network_clusters(risk_level);
CREATE INDEX IF NOT EXISTS idx_network_clusters_root ON network_clusters(root_wallet);

CREATE TRIGGER trg_network_clusters_updated_at
    BEFORE UPDATE ON network_clusters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 10. ALERTS TABLE
-- Deduplicated SOC threat alerts and alert state lifecycle
-- =============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_code VARCHAR(32) NOT NULL UNIQUE, -- e.g. ALT-9001
    title VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'NETWORK_CONVERGENCE', 'RAPID_FORWARDING', 'FAN_IN', 'FAN_OUT', 'CIRCULAR_FLOW', 'WHALE_SPIKE'
    severity VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    risk_score INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- 'NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'
    wallet_address VARCHAR(128) NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    flow_summary TEXT,
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    dedup_count INTEGER NOT NULL DEFAULT 1,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    last_event_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_alert_code ON alerts(alert_code);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_wallet ON alerts(wallet_address);
CREATE INDEX IF NOT EXISTS idx_alerts_risk_score ON alerts(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 11. INVESTIGATIONS TABLE
-- Formal case dossiers created by analysts for compliance reporting
-- =============================================================================
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(32) NOT NULL UNIQUE, -- e.g. INV-2026-001
    title VARCHAR(255) NOT NULL,
    target_wallet VARCHAR(128) NOT NULL,
    target_member_id VARCHAR(32),
    target_tx_id VARCHAR(128),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'CLOSED'
    priority VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    lead_analyst VARCHAR(255) NOT NULL,
    lead_analyst_id UUID REFERENCES users(id) ON DELETE SET NULL,
    risk_score INTEGER NOT NULL DEFAULT 50,
    detected_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
    findings TEXT NOT NULL,
    conclusion TEXT,
    evidence_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_investigations_case_number ON investigations(case_number);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_target_wallet ON investigations(target_wallet);
CREATE INDEX IF NOT EXISTS idx_investigations_risk_score ON investigations(risk_score DESC);

CREATE TRIGGER trg_investigations_updated_at
    BEFORE UPDATE ON investigations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 12. INVESTIGATION_EVENTS TABLE
-- Chronological audit timeline logs tied to specific investigation dossiers
-- =============================================================================
CREATE TABLE IF NOT EXISTS investigation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL DEFAULT 'NOTE', -- 'ALERT_LINKED', 'NOTE', 'WALLET_TAGGED', 'EVIDENCE_ADDED', 'STATUS_CHANGE'
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
    analyst_name VARCHAR(255) NOT NULL,
    analyst_id UUID REFERENCES users(id) ON DELETE SET NULL,
    evidence_reference VARCHAR(255),
    event_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investigation_events_inv_id ON investigation_events(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_events_created_at ON investigation_events(created_at ASC);

-- =============================================================================
-- 13. AUDIT_LOGS TABLE
-- SOC security access, analyst decisions, and administrative actions
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'LOGIN', 'ACKNOWLEDGE_ALERT', 'CREATE_CASE', 'EXPORT_REPORT'
    resource VARCHAR(100) NOT NULL, -- e.g. 'ALERT', 'INVESTIGATION', 'TRANSACTION', 'WALLET'
    resource_id VARCHAR(128),
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    user_agent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- 14. DATA_IMPORTS TABLE
-- Ingestion tracking for Excel workbooks and synthetic bulk datasets
-- =============================================================================
CREATE TABLE IF NOT EXISTS data_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_code VARCHAR(32) NOT NULL UNIQUE, -- e.g. IMP-INIT-001
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL DEFAULT 'XLSX', -- 'XLSX', 'CSV', 'JSON'
    records_found INTEGER NOT NULL DEFAULT 0,
    records_imported INTEGER NOT NULL DEFAULT 0,
    duplicates_count INTEGER NOT NULL DEFAULT 0,
    invalid_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(100) NOT NULL DEFAULT 'SUCCESS',
    file_size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    imported_by VARCHAR(100) DEFAULT 'System Ingestion Worker',
    imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_imports_code ON data_imports(import_code);
CREATE INDEX IF NOT EXISTS idx_data_imports_status ON data_imports(status);
CREATE INDEX IF NOT EXISTS idx_data_imports_imported_at ON data_imports(imported_at DESC);
