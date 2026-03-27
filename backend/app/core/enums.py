from enum import Enum


class AssetType(str, Enum):
    STOCK = "stock"
    MEMECOIN = "memecoin"
    CRYPTO = "crypto"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class SignalStrength(str, Enum):
    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"


class TradeDirection(str, Enum):
    LONG = "long"
    SHORT = "short"


class TradeStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class IntegrationStatus(str, Enum):
    UNCONFIGURED = "unconfigured"
    CONFIGURED = "configured"
    ERROR = "error"
    TESTING = "testing"


class DataFreshness(str, Enum):
    LIVE = "live"
    CACHED = "cached"
    STATIC = "static"
    MOCK = "mock"
