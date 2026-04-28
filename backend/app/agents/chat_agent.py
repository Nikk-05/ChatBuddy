from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from typing import TypedDict, Annotated, Optional
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
from langgraph.graph.message import add_messages
from pydantic import BaseModel
from app.config import settings
import sqlite3
import os

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.8, google_api_key=settings.GOOGLE_API_KEY)


class ChatOutput(BaseModel):
    reply: str
    suggestions: list[str] = []
    is_code: bool = False


structured_llm = llm.with_structured_output(ChatOutput)

# Database instance — absolute path so the same DB is used regardless of working directory
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'chatbuddy.db')
conn = sqlite3.connect(database=DB_PATH, check_same_thread=False)
memory = SqliteSaver(conn, serde=JsonPlusSerializer())
memory.setup()


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    reply: Optional[str]
    suggestions: Optional[list[str]]
    is_code: Optional[bool]


SYSTEM_MESSAGE = SystemMessage(content=(
    "You are Alexa AI, a helpful and friendly assistant. "
    "Always respond in a clear, concise, and conversational tone."
))


def chat_node(state: ChatState) -> ChatState:
    messages = [SYSTEM_MESSAGE] + state["messages"]
    output: ChatOutput = structured_llm.invoke(messages)
    return {
        "messages": [AIMessage(content=output.reply)],
        "reply": output.reply,
        "suggestions": output.suggestions,
        "is_code": output.is_code,
    }


def build_workflow():
    graph = StateGraph(ChatState)
    graph.add_node("chat_node", chat_node)
    graph.add_edge(START, "chat_node")
    graph.add_edge("chat_node", END)
    return graph.compile(checkpointer=memory)


# Streaming uses plain LLM (no structured output) so tokens arrive as readable text,
# not JSON tool-call fragments.
def stream_node(state: ChatState) -> ChatState:
    messages = [SYSTEM_MESSAGE] + state["messages"]
    output = llm.invoke(messages)
    return {
        "messages": [AIMessage(content=output.content)],
        "reply": output.content,
        "suggestions": [],
        "is_code": False,
    }


def build_stream_workflow():
    graph = StateGraph(ChatState)
    graph.add_node("stream_node", stream_node)
    graph.add_edge(START, "stream_node")
    graph.add_edge("stream_node", END)
    return graph.compile(checkpointer=memory)


chat_workflow = build_workflow()
stream_workflow = build_stream_workflow()