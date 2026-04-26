from langchain_core.messages import HumanMessage, AIMessage
from app.agents.chat_agent import chat_workflow

def get_ai_response(message: str, conversation_id: int) -> str:
    config = {"configurable":{"thread_id":str(conversation_id)}}
    inital_state = {
        "messages":[HumanMessage(content = message)]
    }
    result = chat_workflow.invoke(inital_state, config = config)
    return result["messages"][-1].content