from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from app.db.database import Base, engine
# from app.db.models import User, Conversation, Message
from app.api.routes import chat, health
# from app.api.routes import auth, history

# Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

app.include_router(health.router, prefix="/api",  tags=["Health"])
app.include_router(chat.router,   prefix="/api",  tags=["Chat"])

# --- uncomment when DB is ready ---
# app.include_router(auth.router,    prefix="/api/auth", tags=["Auth"])
# app.include_router(history.router, prefix="/api",      tags=["History"])
