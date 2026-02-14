
import logging
import json
import os
import asyncio
import operator
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, AnyMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph
from typing_extensions import Annotated, TypedDict
from mcp_use import MCPAgent, MCPClient
from langgraph.prebuilt import ToolNode, tools_condition

# Configure logging to see tool usage
logging.basicConfig(level=logging.INFO)
logging.getLogger("mcp_use").setLevel(logging.DEBUG)

load_dotenv()

# Ensure API key is set
if not os.environ.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = os.getenv("groq_api_key")

model = ChatGroq(model_name="meta-llama/llama-4-scout-17b-16e-instruct")

class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]

async def mcp_call(state: GraphState) -> GraphState:
    """Calls the MCP server with the current graph state and updates the graph state with the response"""
    
    with open("config_mcp.json", "r") as f:
        config = json.load(f)
  
    client = MCPClient.from_dict(config)

    # Pass the model to MCPAgent
    mcp_agent = MCPAgent(model, client=client)
    
    # Get the last message content
    query = state["messages"][-1].content
    print(f"DEBUG: Processing query via MCP: {query}")
    
    response_content = await mcp_agent.run(query)
    
    return {"messages": [AIMessage(content=str(response_content))]}

def llm_call(state: GraphState) -> GraphState:
    """Calls the LLM with the current graph state and updates the graph state with the response"""
    response = model.invoke(state["messages"])
    # state["messages"].append(response) # In LangGraph using operator.add, we just return the new message(s)
    return {"messages": [response]}

# Build the graph
graph = StateGraph(GraphState)

graph.add_node("llm_call", llm_call)
graph.add_node("mcp_call", mcp_call)

# Logic: Start with mcp_call -> llm_call -> end
# Based on the notebook structure (Cell 6)
# graph.set_entry_point("mcp_call")
# graph.add_edge("mcp_call", "llm_call")
# graph.set_finish_point("llm_call")

# Wait, let's verify the notebook logic. 
# Cell 6:
# graph.set_entry_point("mcp_call")
# graph.add_edge("mcp_call", "llm_call")
# graph.set_finish_point("llm_call")

# But usually we might want to start with LLM to decide? 
# The notebook explicitly sets entry point to mcp_call. I will follow that.

graph.set_entry_point("mcp_call")
graph.add_edge("mcp_call", "llm_call")
graph.set_finish_point("llm_call")

app = graph.compile()

async def main():
    print("--- Running Debug Script ---")
    query = "What to do if i ahve high chest pain"
    
    # FIX: Wrap content in HumanMessage and pass as a list
    initial_input = {"messages": [HumanMessage(content=query)]}
    
    try:
        response = await app.ainvoke(initial_input)
        print("\n--- Final Response ---")
        print(response["messages"][-1].content)
        
        print("\n--- Full Message History ---")
        for i, msg in enumerate(response["messages"]):
            print(f"[{i}] {type(msg).__name__}: {msg.content}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
