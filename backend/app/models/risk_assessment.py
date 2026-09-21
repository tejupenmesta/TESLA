import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    wallet_address: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    composite_score: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    risk_tier: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    velocity_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    amount_anomaly_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fan_in_out_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    peeling_chain_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    counterparty_risk_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    heuristic_flags: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    ml_isolation_score: Mapped[Decimal | None] = mapped_column(Numeric(6, 4), default=Decimal("0.0000"), nullable=True)
    confidence_pct: Mapped[int] = mapped_column(Integer, default=95, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    decision_reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    assessed_by: Mapped[str | None] = mapped_column(String(100), default="BitFlow-AI-HeuristicEngine-v3", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    transaction = relationship("Transaction", back_populates="risk_assessment")
