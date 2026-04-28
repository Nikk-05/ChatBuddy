from langchain_core.messages import HumanMessage, AIMessageChunk
from app.agents.chat_agent import chat_workflow, stream_workflow


def get_ai_response(message: str, conversation_id: int) -> dict:
    config = {"configurable": {"thread_id": str(conversation_id)}}
    result = chat_workflow.invoke(
        {"messages": [HumanMessage(content=message)]},
        config=config,
    )
    return {
        "reply": result["reply"],
        "suggestions": result["suggestions"],
        "is_code": result["is_code"],
        "conversation_id": conversation_id,
    }


async def stream_ai_response(message: str, conversation_id: int):
    config = {"configurable": {"thread_id": str(conversation_id)}}
    async for msg_chunk, _ in stream_workflow.astream(
        {"messages": [HumanMessage(content=message)]},
        config=config,
        stream_mode="messages",
    ):
        if isinstance(msg_chunk, AIMessageChunk) and msg_chunk.content:
            yield msg_chunk.content
