from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.routes import auth, journal, goals, analytics, chat

# Create all database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Self-Growth Operating System",
    description="Your personal AI mentor that remembers your journey",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://intelligent-self-growth-operating-s.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "AI OS is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}