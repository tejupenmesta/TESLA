import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class NetworkCluster(Base):
    __tablename__ = "network_clusters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    cluster_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    cluster_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    root_wallet: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    wallet_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    transaction_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_volume_btc: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), default="HIGH", nullable=False, index=True)
    associated_member_ids: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    heuristic_signature: Mapped[str] = mapped_column(String(128), nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
