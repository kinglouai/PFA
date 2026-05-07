"""
Custom exception classes and the global exception handler for FastAPI.
"""


class AppException(Exception):
    """
    Standard application exception.
    Caught by the global exception handler and returned as a
    { success: false, message: str, data: null } response.
    """

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
