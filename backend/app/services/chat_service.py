# from sqlalchemy.orm import Session
# from app.db.models.conversation import Conversation
from app.services.ai_service import get_ai_response


def handle_chat(message: str, conversation_id: int | None) -> dict:

    # --- DB logic (uncomment when ready) ---
    # if not conversation_id:
    #     convo = Conversation(user_id=user_id, title=message[:50])
    #     db.add(convo)
    #     db.commit()
    #     db.refresh(convo)
    #     conversation_id = convo.id

    conversation_id = conversation_id or 1  # temp default thread

    response = get_ai_response(message, conversation_id)
    return {
        "reply": response["reply"],
        "suggestions": response["suggestions"],
        "is_code": response["is_code"],
        "conversation_id": response["conversation_id"],
    }
