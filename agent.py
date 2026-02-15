from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import StateGraph
from dotenv import load_dotenv
import os
import asyncio
import operator
import json
from langchain_core.messages import AnyMessage
from typing_extensions import Annotated, TypedDict
from mcp_use import MCPAgent, MCPClient

# Load environment variables
load_dotenv()

# Ensure Groq API key is set
if not os.environ.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = os.getenv("groq_api_key")

# Initialize Groq LLM model
model = ChatGroq(model_name="meta-llama/llama-4-scout-17b-16e-instruct")

# Define Graph State
class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]


# -------------------------------
# MCP + LLM Hybrid Agent Node
# -------------------------------
async def mcp_call(state: GraphState) -> GraphState:
    """
    1. Calls MCP server (PubMed retrieval)
    2. Uses LLM to generate structured clinical perspective
    """

    # Load MCP config
    with open("config_mcp.json", "r") as f:
        config = json.load(f)

    # Create MCP client
    client = MCPClient.from_dict(config)

    # Create MCP agent (LLM + tool)
    mcp_agent = MCPAgent(model, client=client)

    # Extract user query
    query = state["messages"][-1].content

    # Step 1: Retrieve literature via MCP
    mcp_response = await mcp_agent.run(query)

    # Step 2: Ask LLM to interpret and summarize
    summary_prompt = [
        SystemMessage(content="""
You are a clinical decision support assistant.

Based on the retrieved medical literature below:

1. Provide a concise summary.
2. Offer clinical interpretation.
3. Mention possible causes.
4. Suggest next steps (non-diagnostic).
5. Include a disclaimer that this is not medical advice.
"""),
        HumanMessage(content=f"""
User Query:
{query}

Retrieved Medical Literature:
{mcp_response}

Now provide your structured clinical perspective.
""")
    ]

    llm_response = model.invoke(summary_prompt)

    # Combine MCP + LLM output
    final_output = f"""
🔎 Retrieved Medical Literature:
{mcp_response}

--------------------------------------------------------

🧠 AI Clinical Perspective:
{llm_response.content}
"""

    return {"messages": [AIMessage(content=final_output)]}


# -------------------------------
# Build LangGraph
# -------------------------------
graph = StateGraph(GraphState)
graph.add_node("mcp_call", mcp_call)
graph.set_entry_point("mcp_call")
graph.set_finish_point("mcp_call")

app = graph.compile()


# -------------------------------
# Public Interface for app.py
# -------------------------------
def get_response(query: str) -> str:
    """Interface for app.py to get a response from the agent."""
    initial_state = {"messages": [HumanMessage(content=query)]}

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(app.ainvoke(initial_state))
        loop.close()

        return result["messages"][-1].content

    except Exception as e:
        return f"Error in agent: {e}"


# -------------------------------
# Standalone CLI Mode
# -------------------------------
if __name__ == "__main__":
    while True:
        print("\n--- AI Medical Agent ---")
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break

        print("Agent:", get_response(user_input))
