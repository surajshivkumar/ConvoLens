# main.py - FastAPI Call Center RAG Backend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import openai
import os
from datetime import datetime
from supabase import create_client, Client
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Call Center RAG API",
    description="RAG system for call center transcript analysis",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")

# Initialize clients
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# Pydantic models
class ChatRequest(BaseModel):
    question: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    context_used: List[str] = []
    timestamp: str


class CallSource(BaseModel):
    call_id: str
    agent_id: Optional[str]
    summary: Optional[str]
    sentiment: Optional[str]
    issue_type: Optional[str]
    call_timestamp: Optional[str]
    similarity: float


# Helper functions
async def get_embedding(text: str) -> List[float]:
    """Generate embedding using OpenAI Ada model"""
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-ada-002", input=text.strip()
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")


async def search_call_database(
    query_embedding: List[float], limit: int = 5
) -> List[Dict]:
    """Search for similar calls using the Supabase function"""
    try:
        response = supabase.rpc(
            "search_similar_calls",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.7,
                "match_count": limit,
            },
        ).execute()

        return response.data if response.data else []
    except Exception as e:
        print(f"Search error: {e}")
        return []


# API Endpoints


@app.get("/")
async def root():
    return {
        "message": "Call Center RAG API",
        "status": "running",
        "endpoints": {"chat": "/api/chat", "health": "/health"},
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Supabase connection
        result = supabase.table("fact_calls").select("call_id").limit(1).execute()

        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "supabase": "connected",
                "openai": "configured",
                "total_calls": len(result.data) if result.data else 0,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_calls(request: ChatRequest):
    """Main RAG endpoint for call center queries"""
    try:
        # Generate embedding for user question
        query_embedding = await get_embedding(request.question)

        # Search for relevant calls
        similar_calls = await search_call_database(query_embedding, limit=5)

        # Prepare context from retrieved calls
        context_chunks = []
        sources = []

        for call in similar_calls:
            # Use transcript or summary for context
            content = call.get("transcript") or call.get("summary", "")
            if content:
                context_chunks.append(
                    {
                        "content": content,
                        "call_id": call["call_id"],
                        "agent_id": call.get("agent_id"),
                        "sentiment": call.get("sentiment"),
                        "issue_type": call.get("issue_type"),
                        "similarity": call.get("similarity", 0),
                    }
                )

                # Track sources for response
                sources.append(
                    CallSource(
                        call_id=str(call["call_id"]),
                        agent_id=call.get("agent_id"),
                        summary=(
                            call.get("summary", "")[:200] + "..."
                            if call.get("summary")
                            else None
                        ),
                        sentiment=call.get("sentiment"),
                        issue_type=call.get("issue_type"),
                        call_timestamp=call.get("call_timestamp"),
                        similarity=round(call.get("similarity", 0), 3),
                    )
                )

        # Build context for AI
        if context_chunks:
            context_text = "\n\n---\n\n".join(
                [
                    f"Call ID: {chunk['call_id']}\n"
                    f"Agent: {chunk['agent_id'] or 'Unknown'}\n"
                    f"Sentiment: {chunk['sentiment'] or 'Unknown'}\n"
                    f"Issue Type: {chunk['issue_type'] or 'Unknown'}\n"
                    f"Content: {chunk['content'][:800]}..."
                    for chunk in context_chunks
                ]
            )
        else:
            context_text = "No relevant call data found."

        # Prepare conversation history
        history_text = ""
        if request.conversation_history:
            recent_history = request.conversation_history[-4:]  # Last 4 messages
            history_text = "\n".join(
                [
                    f"{'User' if msg.get('role') == 'user' else 'Assistant'}: {msg.get('content', '')}"
                    for msg in recent_history
                ]
            )

        # System prompt for call center RAG
        system_prompt = f"""You are a helpful AI assistant for call center analytics. You have access to call transcripts, agent performance data, and customer interaction records. Answer questions based on the provided call data accurately and helpfully.

CONVERSATION HISTORY:
{history_text}

CALL DATA CONTEXT:
{context_text}

Instructions:
- Answer based on the call transcripts and metadata provided
- Mention specific call IDs, agents, or patterns when relevant
- If analyzing sentiment or issues, reference the data you see
- If the call data doesn't contain relevant information, say so clearly
- Keep responses professional and focused on call center insights
- When discussing agent performance or customer issues, be objective and data-driven"""

        # Generate response using OpenAI
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question},
            ],
            max_tokens=800,
            temperature=0.7,
        )

        ai_response = completion.choices[0].message.content

        return ChatResponse(
            answer=ai_response,
            sources=[source.dict() for source in sources],
            context_used=[
                chunk["content"][:200] + "..." for chunk in context_chunks[:3]
            ],
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/calls")
async def get_recent_calls(limit: int = 20):
    """Get recent calls for debugging/testing"""
    try:
        response = (
            supabase.table("fact_calls")
            .select(
                "call_id, agent_id, customer_id, summary, sentiment, issue_type, call_timestamp"
            )
            .order("call_timestamp", desc=True)
            .limit(limit)
            .execute()
        )

        return {
            "calls": response.data,
            "count": len(response.data) if response.data else 0,
        }

    except Exception as e:
        print(f"Get calls error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_call_stats():
    """Get basic call center statistics"""
    try:
        # Get total calls
        total_response = (
            supabase.table("fact_calls").select("call_id", count="exact").execute()
        )
        total_calls = total_response.count if total_response.count else 0

        # Get calls with embeddings
        embedded_response = (
            supabase.table("fact_calls")
            .select("call_id", count="exact")
            .not_.is_("embedding", "null")
            .execute()
        )
        embedded_calls = embedded_response.count if embedded_response.count else 0

        return {
            "total_calls": total_calls,
            "calls_with_embeddings": embedded_calls,
            "embedding_coverage": (
                round((embedded_calls / total_calls * 100), 2) if total_calls > 0 else 0
            ),
        }

    except Exception as e:
        print(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
