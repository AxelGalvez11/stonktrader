def mask_secret(secret: str | None) -> str | None:
    """Return a masked version of a secret for display. Never returns the full value."""
    if not secret:
        return None
    if len(secret) <= 8:
        return "****"
    return secret[:4] + "****" + secret[-4:]


def is_configured(secret: str | None) -> bool:
    """True if the secret is non-empty."""
    return bool(secret and len(secret.strip()) > 0)
