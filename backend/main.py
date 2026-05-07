"""
FastAPI application entry point.
Start with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import AppException
from app.api.routes import detect, generate, validate, github, auth


app = FastAPI(
    title="CI/CD Workflow Generator",
    description="Auto-generate GitHub Actions pipeline YAML files from a project profile.",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ────────────────────────────────────────────
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Catch AppException and return standard error response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "data": None,
        },
    )


# ── Routes ───────────────────────────────────────────────────────────────
app.include_router(detect.router, prefix="/api/v1")
app.include_router(generate.router, prefix="/api/v1")
app.include_router(validate.router, prefix="/api/v1")
app.include_router(github.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Health-check / root endpoint."""
    return {
        "success": True,
        "message": "CI/CD Workflow Generator API is running.",
        "data": None,
    }
