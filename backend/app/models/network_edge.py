import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Boolean, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class NetworkEdge(Base):
    __tablename__ = "network_edges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=True, index=True)
    source_wallet: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    target_wallet: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    source_member_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    target_member_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    amount_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    amount_usd: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    hop_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    flow_type: Mapped[str] = mapped_column(String(50), default="DIRECT", nullable=False, index=True)
    is_cycle: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    latency_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
