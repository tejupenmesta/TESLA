import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class WalletFeature(Base):
    __tablename__ = "wallet_features"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    wallet_address: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    inflow_btc_24h: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    outflow_btc_24h: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    tx_count_24h: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    inflow_btc_7d: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    outflow_btc_7d: Mapped[Decimal] = mapped_column(Numeric(18, 8), default=Decimal("0.00000000"), nullable=False)
    tx_count_7d: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_holding_duration_sec: Mapped[int] = mapped_column(Integer, default=86400, nullable=False)
    unique_counterparties_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    velocity_zscore: Mapped[Decimal] = mapped_column(Numeric(8, 4), default=Decimal("0.0000"), nullable=False, index=True)
    amount_zscore: Mapped[Decimal] = mapped_column(Numeric(8, 4), default=Decimal("0.0000"), nullable=False)
    fan_in_ratio: Mapped[Decimal] = mapped_column(Numeric(6, 4), default=Decimal("0.0000"), nullable=False)
    fan_out_ratio: Mapped[Decimal] = mapped_column(Numeric(6, 4), default=Decimal("0.0000"), nullable=False)
    rapid_forwarding_rate: Mapped[Decimal] = mapped_column(Numeric(6, 4), default=Decimal("0.0000"), nullable=False)
    cluster_affinity_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), default="LOW", nullable=False, index=True)
    last_calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
