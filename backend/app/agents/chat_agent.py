from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from pydantic import BaseModel
from app.config import settings


llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.8, google_api_key=settings.GOOGLE_API_KEY)


class ChatOutput(BaseModel):
    reply: str


structured_llm = llm.with_structured_output(ChatOutput)

checkpointer = MemorySaver()


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


SYSTEM_MESSAGE = SystemMessage(content=(
    "You are Alexa AI, a helpful and friendly assistant. "
    "Always respond in a clear, concise, and conversational tone."
))


def chat_node(state: ChatState) -> ChatState:
    messages = [SYSTEM_MESSAGE] + state["messages"]
    output: ChatOutput = structured_llm.invoke(messages)
    return {"messages": [AIMessage(content=output.reply)]}


def build_workflow():
    graph = StateGraph(ChatState)
    graph.add_node("chat_node", chat_node)
    graph.add_edge(START, "chat_node")
    graph.add_edge("chat_node", END)
    return graph.compile(checkpointer=checkpointer)


chat_workflow = build_workflow()