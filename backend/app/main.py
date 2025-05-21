
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, notes, doubts, flashcards, podcasts
import uvicorn

app = FastAPI(
    title=settings.APP_NAME,
    description="API for StudySpark - AI-powered study assistant",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event handlers for database connections
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(doubts.router, prefix="/api/doubts", tags=["Doubt Clarification"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(podcasts.router, prefix="/api/podcasts", tags=["Podcasts"])


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to StudySpark API"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
