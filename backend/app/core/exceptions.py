from fastapi import HTTPException


class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)


class ProviderError(HTTPException):
    def __init__(self, detail: str = "Data provider error"):
        super().__init__(status_code=502, detail=detail)


class IntegrationError(HTTPException):
    def __init__(self, detail: str = "Integration error"):
        super().__init__(status_code=422, detail=detail)


class ScoringError(Exception):
    """Raised when a scoring function receives invalid input."""
