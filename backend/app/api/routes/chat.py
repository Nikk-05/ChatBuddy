from fastapi import APIRouter, HTTPException, status
# from fastapi import Depends
# from sqlalchemy.orm import Session
# from app.api.dependencies import get_db, get_current_user
# from app.db.models.user import User
from app.services.chat_service import handle_chat
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post('/chat', response_model=ChatResponse, status_code=status.HTTP_200_OK)
def send_message(payload: ChatRequest):
    try:
        result = handle_chat(payload.message, payload.conversation_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# --- with DB + Auth (uncomment when ready) ---
# @router.post('/chat', response_model=ChatResponse)
# def send_message(
#     payload: ChatRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     result = handle_chat(db, current_user.id, payload.message, payload.conversation_id)
#     return result