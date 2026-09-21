import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Member(Base):
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    member_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    annual_income_inr: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    profile_status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False, index=True)
    kyc_status: Mapped[str] = mapped_column(String(50), default="Verified", nullable=False, index=True)
    synthetic_id_ref: Mapped[str | None] = mapped_column(String(128), nullable=True)
    nominee_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nominee_relation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    risk_rating: Mapped[str] = mapped_column(String(50), default="Low", nullable=False, index=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="memberships")
    accounts = relationship("Account", back_populates="member", cascade="all, delete-orphan")
    wallets = relationship("Wallet", back_populates="member", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="member")
