from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None

class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = []
    is_code: bool = False
    conversation_id: int 
    