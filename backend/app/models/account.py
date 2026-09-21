import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    account_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name: Mapped[str] = mapped_column(String(100), default="BitFlow Treasury Bank", nullable=False)
    account_type: Mapped[str] = mapped_column(String(50), default="Savings", nullable=False)
    ifsc_code: Mapped[str | None] = mapped_column(String(32), default="BITF0001928", nullable=True)
    branch: Mapped[str | None] = mapped_column(String(100), default="Main FinTech Hub", nullable=True)
    balance_fiat: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False, index=True)
    daily_limit_fiat: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), default=Decimal("1000000.00"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    member = relationship("Member", back_populates="accounts")
    wallets = relationship("Wallet", back_populates="account")
