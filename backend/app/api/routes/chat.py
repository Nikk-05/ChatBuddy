import json
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.services.chat_service import handle_chat
from app.services.ai_service import stream_ai_response
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
            detail=str(e),
        )


@router.post('/chat/stream')
async def stream_message(payload: ChatRequest):
    conversation_id = payload.conversation_id or 1

    async def event_stream():
        try:
            async for token in stream_ai_response(payload.message, conversation_id):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
