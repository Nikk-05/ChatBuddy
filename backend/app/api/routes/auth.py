from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.db.models.user import User
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model = UserResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code= 400, details = "Email already registred")
    
    user = User(email = payload.email, password = hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model = TokenResponse)
def login(payload: LoginRequest, db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code =401, details = "Invalid email or password")
    
    token = create_access_token(user.id)
    return {"access_token":token, "token_type": "bearer"}
