import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Boolean, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    address: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    wallet_type: Mapped[str] = mapped_column(String(50), default="SegWit (Native)", nullable=False)
    balance_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    unconfirmed_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    total_received_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    total_sent_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    tx_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    derivation_path: Mapped[str | None] = mapped_column(String(100), default="m/84'/0'/0'/0/0", nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    last_activity_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    member = relationship("Member", back_populates="wallets")
    account = relationship("Account", back_populates="wallets")
    transactions = relationship("Transaction", back_populates="wallet")
