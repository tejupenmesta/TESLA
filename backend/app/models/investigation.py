import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    case_number: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_wallet: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    target_member_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    target_tx_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="OPEN", nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(50), default="HIGH", nullable=False)
    lead_analyst: Mapped[str] = mapped_column(String(255), nullable=False)
    lead_analyst_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    risk_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False, index=True)
    detected_patterns: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    findings: Mapped[str] = mapped_column(Text, nullable=False)
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    events = relationship("InvestigationEvent", back_populates="investigation", cascade="all, delete-orphan")
