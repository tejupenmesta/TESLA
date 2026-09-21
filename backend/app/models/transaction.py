import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Boolean, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tx_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    tx_hash: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    member_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), nullable=True, index=True)
    wallet_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("wallets.id", ondelete="SET NULL"), nullable=True, index=True)
    sender_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sender_address: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    receiver_address: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    receiver_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    amount_usd: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    network_fee_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00001000"), nullable=False)
    fee_rate_sat_vb: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("15.00"), nullable=False)
    vsize: Mapped[int] = mapped_column(Integer, default=225, nullable=False)
    confirmations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    block_height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    payment_phase: Mapped[str] = mapped_column(String(50), default="Payment", nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="Success", nullable=False)
    direction: Mapped[str] = mapped_column(String(50), default="Outgoing", nullable=False)
    tx_type: Mapped[str] = mapped_column(String(50), default="Wallet transfer", nullable=False)
    mempool_status: Mapped[str] = mapped_column(String(50), default="Confirmed", nullable=False)
    is_whale: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    whale_tier: Mapped[str | None] = mapped_column(String(50), default="Small/Regular", nullable=True)
    risk_flag: Mapped[str] = mapped_column(String(50), default="Normal", nullable=False, index=True)
    risk_score: Mapped[int] = mapped_column(Integer, default=10, nullable=False, index=True)
    ai_interpretation: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_decision_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_tx_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    member = relationship("Member", back_populates="transactions")
    wallet = relationship("Wallet", back_populates="transactions")
    risk_assessment = relationship("RiskAssessment", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="transaction")
