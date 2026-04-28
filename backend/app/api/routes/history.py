from fastapi import APIRouter
from app.agents.chat_agent import conn

router = APIRouter()


@router.get("/conversations")
def get_conversations():
    cursor = conn.execute(
        "SELECT DISTINCT thread_id FROM checkpoints ORDER BY thread_id DESC"
    )
    threads = cursor.fetchall()
    return [{"conversation_id": row[0], "title": f"Conversation {row[0]}"} for row in threads]


@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(conversation_id: str):
    cursor = conn.execute(
        """
        SELECT checkpoint FROM checkpoints
        WHERE thread_id = ?
        ORDER BY checkpoint_id ASC
        """,
        (conversation_id,)
    )
    rows = cursor.fetchall()
    return {"conversation_id": conversation_id, "total": len(rows)}


# --- with DB + Auth (uncomment when ready) ---
# from fastapi import Depends
# from sqlalchemy.orm import Session
# from app.api.dependencies import get_db, get_current_user
# from app.db.models.conversation import Conversation
# from app.db.models.user import User
#
# @router.get("/conversations")
# def get_conversations(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     return (
#         db.query(Conversation)
#         .filter(Conversation.user_id == current_user.id)
#         .order_by(Conversation.updated_at.desc())
#         .all()
#     )
#
# @router.get("/conversations/{conversation_id}/messages")
# def get_messages(
#     conversation_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     return (
#         db.query(Message)
#         .filter(Message.conversation_id == conversation_id)
#         .order_by(Message.created_at.asc())
#         .all()
#     )
