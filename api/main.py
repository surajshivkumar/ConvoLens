# main.py - FastAPI Call Center RAG Backend with SQL + RAG hybrid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import openai
import os
from datetime import datetime, timedelta
from supabase import create_client, Client
import asyncio
from dotenv import load_dotenv
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

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
    allow_origins=["http://localhost:3001", "https://yourdomain.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
GOOGLE_CALENDAR_CREDENTIALS = os.getenv("GOOGLE_CALENDAR_CREDENTIALS")
CAL_ID = os.getenv("CALENDAR_ID")

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


# --- Prompt Classifier ---
async def classify_prompt(prompt: str) -> str:
    guide = f"""
You are a classifier. Return one word only: "sql", "rag", or "schedule".

Return:
- "sql" → for questions about counts, summaries, filters, or structured data eg. How many calls took place on May 21st 2025?
- "rag" → for fuzzy, conversational, or semantic questions eg. Were there any calls about cancellations?
- "schedule" → if the prompt is about creating calendar events, booking meetings, or scheduling something eg. Can you schedule a call with ralph tomorrow at 6pm?

Prompt: "{prompt}"

Classification:
"""
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": guide}],
        temperature=0,
    )
    return response.choices[0].message.content.strip().lower()


# --- RAG Helpers ---
async def get_embedding(text: str) -> List[float]:
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-ada-002", input=text.strip()
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")


async def extract_datetime_from_prompt(prompt: str) -> Optional[datetime]:
    guide = f"""
You are a helpful assistant that extracts datetime from natural language.

Given a user prompt like:
- "schedule a call at 4 PM today"
- "set up a ngmeeti tomorrow at 10:30am"
- "book something on Friday at 3pm"

Return the time in this format (ISO 8601): "YYYY-MM-DDTHH:MM:SS"

If you cannot confidently find a datetime, just return "none".

Today is: {datetime.now().strftime('%A, %B %d, %Y')}

Prompt: "{prompt}"

Extracted datetime:
"""
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": guide}],
        temperature=0,
    )
    dt_string = response.choices[0].message.content.strip()
    if dt_string.lower() == "none":
        return None
    try:
        return datetime.fromisoformat(dt_string)
    except Exception as e:
        print(f"Parse error: {e}, raw output: {dt_string}")
        return None


async def extract_meeting_title(prompt: str) -> str:
    guide = f"""
You are a helpful assistant that generates a clean, human-readable meeting title based on a user's scheduling prompt.

Examples:
- "schedule a call with Ralph today at 7 pm" → "Call with Ralph"
- "set up a sync with Alice and Bob tomorrow" → "Sync with Alice and Bob"
- "book a quick chat with HR at 4 PM" → "Chat with HR"
- "schedule a planning meeting with marketing" → "Planning Meeting with Marketing"
- "set a follow-up call with John" → "Follow-up Call with John"

Prompt: "{prompt}"

Meeting title:
"""
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": guide}],
        temperature=0,
    )
    return response.choices[0].message.content.strip().strip('"')


async def search_call_database(
    query_embedding: List[float], limit: int = 5
) -> List[Dict]:
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


def schedule_call_event(
    start_dt: datetime, summary="Call with agent", timezone="America/New_York"
):
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    SERVICE_ACCOUNT_FILE = GOOGLE_CALENDAR_CREDENTIALS
    CALENDAR_ID = CAL_ID
    SCOPES = ["https://www.googleapis.com/auth/calendar"]

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = build("calendar", "v3", credentials=credentials)

    end_dt = start_dt + timedelta(minutes=30)

    event = {
        "summary": summary,
        "description": "Call scheduled via FastAPI + service account",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": timezone},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": timezone},
        "attendees": [],
    }

    event_result = service.events().insert(calendarId=CALENDAR_ID, body=event).execute()
    return event_result.get("htmlLink")


# --- SQL Helpers ---
async def generate_sql(prompt: str) -> str:
    sql_guide = f"""
You are an SQL assistant. Given a user question about a call center database, return only the SQL query (PostgreSQL), no explanation.

Tables available:
- fact_calls(call_id, agent_id, customer_id, date_id, duration_seconds, call_timestamp, disposition, direction, transcript, summary, embedding, audio_url, issue_type, sentiment, sentiment_score, resolved, agent_politeness, agent_professionalism, process_adherence)

Prompt: "{prompt}"

SQL:
"""
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": sql_guide}],
        temperature=0.1,
    )
    return response.choices[0].message.content.strip()


async def run_sql_query(sql: str):
    try:
        response = supabase.rpc("run_sql", {"query": sql}).execute()
        return response.data[0]["result"]
    except Exception as e:
        return [{"error": str(e)}]


async def answer_with_sql_result(
    user_prompt: str, sql_result: List[Dict[str, Any]]
) -> str:
    table_preview = json.dumps(sql_result, indent=2)
    prompt = f"""
You are a helpful assistant. A user asked the following question:

"{user_prompt}"

Here is the SQL query result:
{table_preview}

Based on this result, provide a clear and concise answer to the user in plain English. If possible, summarize in one or two sentences.
Return your response in this exact format:

{{
    "answer": "provide a clear and concise answer to the user in plain English."
}}

DO NOT TALK ABOUT HOW YOU GOT THIS RESPONSE like "based on the SQL query result.".
"""
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


# --- RAG Answer Generator ---
async def answer_with_rag(question: str, context_docs: List[Dict[str, Any]]) -> str:
    # Serialize retrieved calls
    context_json = "\n\n---\n\n".join(json.dumps(doc, indent=2) for doc in context_docs)

    prompt = f"""
You are a helpful assistant analyzing customer service call center data. Below is a list of call records (in JSON format), each containing metadata and transcripts.

Your task:
- Use this data to answer the user's question in a clear and informative way
- Mention only the most relevant calls
- Include details like call_id, agent_id, issue_type, sentiment, and a brief summary of each relevant call

Call Data:
{context_json}

User Question:
{question}

Instructions:
1. Analyze the call transcripts and metadata
2. Provide a 2–4 paragraph answer addressing the user's question
3. Highlight which calls support your answer and why
4. For each relevant call, extract:
   - call_id
   - agent_id
   - call_timestamp
   - issue_type
   - sentiment
   - summary (shortened if necessary)
   - transcript snippet (first 1–2 sentences that are most relevant)

Respond in *valid JSON* using the format:

{{
  "answer": "Your response here (2–4 paragraphs)",
  "confidence": "high/medium/low",
  "sources": [
    {{
      "call_id": "string",
      "agent_id": "string",
      "agent_name":"string",
      "customer_name":"string",
      "call_timestamp": "ISO timestamp",
      "issue_type": "string",
      "sentiment": "string",
      "summary": "short summary of the call",
      "relevance": "why this call supports the answer",
      "transcript_snippet": "most relevant part of the transcript"
    }}
  ]
}}

Do NOT include any made-up data. Only use values present in the JSON above. Include only calls that are clearly relevant. Return valid JSON only.
"""

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


# --- API Endpoints ---
@app.get("/")
async def root():
    return {
        "message": "Call Center RAG API",
        "status": "running",
        "endpoints": {"chat": "/api/chat", "health": "/health"},
    }


@app.get("/health")
async def health_check():
    try:
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
    try:
        mode = await classify_prompt(request.question)

        if mode == "sql":
            sql = await generate_sql(request.question)
            result = await run_sql_query(sql.rstrip(";"))
            if isinstance(result, list) and result and "error" in result[0]:
                raise HTTPException(status_code=500, detail=result[0]["error"])
            if not result:
                return ChatResponse(
                    answer="No data found for the query.",
                    sources=[],
                    context_used=[],
                    timestamp=datetime.now().isoformat(),
                )
            final_answer = await answer_with_sql_result(request.question, result)
            return ChatResponse(
                answer=final_answer,
                sources=[],
                context_used=[json.dumps(result[:1])],
                timestamp=datetime.now().isoformat(),
            )

        elif mode == "schedule":
            dt = await extract_datetime_from_prompt(request.question)
            if not dt:
                raise HTTPException(
                    status_code=400, detail="Could not extract time from your prompt."
                )

            title = await extract_meeting_title(request.question)

            try:
                link = schedule_call_event(start_dt=dt, summary=title)
                responseSchedule = f"""Scheduled a meeting titled {title} at {dt.strftime('%I:%M %p on %B %d')}.\nHere's your event: {link}"""

                responseSchedule = json.dumps({"answer": responseSchedule})
                sourcesString = json.dumps({"link": link})
                return ChatResponse(
                    answer=responseSchedule,
                    # answer=
                    sources=[{"link": link}],
                    context_used=[request.question],
                    timestamp=datetime.now().isoformat(),
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Scheduling failed: {str(e)}"
                )

        else:
            query_embedding = await get_embedding(request.question)
            similar_calls = await search_call_database(query_embedding, limit=5)
            if not similar_calls:
                return ChatResponse(
                    answer="No relevant transcripts found.",
                    sources=[],
                    context_used=[],
                    timestamp=datetime.now().isoformat(),
                )
            final_answer = await answer_with_rag(request.question, similar_calls)
            return ChatResponse(
                answer=final_answer,
                sources=[
                    CallSource(
                        call_id=call["call_id"],
                        agent_id=call.get("agent_id"),
                        summary=(
                            (call.get("summary")[:200] + "...")
                            if call.get("summary")
                            else None
                        ),
                        sentiment=call.get("sentiment"),
                        issue_type=call.get("issue_type"),
                        call_timestamp=call.get("call_timestamp"),
                        similarity=round(call.get("similarity", 0), 3),
                    ).dict()
                    for call in similar_calls
                ],
                context_used=[
                    call.get("transcript", "")[:200] + "..." for call in similar_calls
                ],
                timestamp=datetime.now().isoformat(),
            )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/calls")
async def get_recent_calls(limit: int = 20):
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
    try:
        total_response = (
            supabase.table("fact_calls").select("call_id", count="exact").execute()
        )
        total_calls = total_response.count if total_response.count else 0

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
