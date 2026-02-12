from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv
import os
import asyncio
import operator
import json
from langchain_core.messages import AnyMessage, AIMessage
from typing_extensions import Annotated, TypedDict
from mcp_use import MCPAgent, MCPClient

load_dotenv()

# Ensure API key is set
if not os.environ.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = os.getenv("groq_api_key")

model = ChatGroq(model_name="meta-llama/llama-4-scout-17b-16e-instruct") # Updated model name to a known valid one or kept user's if sure

class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]

async def mcp_call(state: GraphState) -> GraphState:
    """Calls the MCP server with the current graph state and updates the graph state with the response"""
    
    with open("config_mcp.json", "r") as f:
        config = json.load(f)
  
    client = MCPClient.from_dict(config)

    mcp_agent = MCPAgent(model, client=client)
    
    query = state["messages"][-1].content
    
    
    response_content = await mcp_agent.run(query)
    
    return {"messages": [AIMessage(content=str(response_content))]}




graph = StateGraph(GraphState)
graph.add_node("mcp_call", mcp_call)

graph.set_entry_point("mcp_call")
graph.set_finish_point("mcp_call") 

app = graph.compile()

def get_response(query: str) -> str:
    """Interface for app.py to get a response from the agent."""
    initial_state = {"messages": [HumanMessage(content=query)]}
    # Run the graph (asyncio.run might be needed if calling from sync code, 
    # but langgraph compile() returns a runnable that handles async often, 
    # however mcp_call is async. Let's try invoke first, if it fails we might need async handling)
    
    # specific handling for async node in sync context if needed
    try:
        # For simplicity in this environment, we'll try standard invoke. 
        # If mcp_call is async, we might need ayncio.run on app.invoke if app is compiled as async
        # But langgraph's compile usually returns a sync-compatible invoker if nodes are mixed? 
        # Actually, if nodes are async, invoke needs to be awaited or we use asyncio.run
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(app.ainvoke(initial_state))
        loop.close()
        
        # Extract last message content
        return result["messages"][-1].content
    except Exception as e:
        return f"Error in agent: {e}"

if __name__ == "__main__":
    while True:
        print("\n--- AI Medical Agent ---")
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        
        print("Agent:", get_response(user_input))

