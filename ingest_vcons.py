import os
import json
import openai
import hashlib
from datetime import datetime
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY, VCON_FOLDER

# Setup
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

def generate_id(email, phone):
    return hashlib.md5((email or "" + phone or "").encode()).hexdigest()

# Process all .vcon.json files
for filename in os.listdir(VCON_FOLDER):
    if filename.endswith(".vcon.json"):
        path = os.path.join(VCON_FOLDER, filename)
        with open(path, "r") as f:
            try:
                data = json.load(f)
                call_id = data["uuid"]
                timestamp = data["created_at"]
                date_id = datetime.fromisoformat(timestamp).date().isoformat()

                dialog = data.get("dialog", [{}])[0]
                duration = dialog.get("duration", 0)
                disposition = dialog.get("meta", {}).get("disposition")
                direction = dialog.get("meta", {}).get("direction")
                audio_url = dialog.get("url")

                agent = next((p for p in data["parties"] if p["role"] == "agent"), {})
                customer = next((p for p in data["parties"] if p["role"] == "customer"), {})

                agent_id = agent.get("id")
                customer_id = generate_id(customer.get("mailto"), customer.get("tel"))

                if agent_id:
                    supabase.table("dim_agents").upsert({
                        "agent_id": agent_id,
                        "name": agent.get("name"),
                        "email": agent.get("mailto")
                    }).execute()

                supabase.table("dim_customers").upsert({
                    "customer_id": customer_id,
                    "name": customer.get("name"),
                    "email": customer.get("mailto"),
                    "phone": customer.get("tel")
                }).execute()

                transcript = ""
                summary = ""
                for analysis in data.get("analysis", []):
                    if analysis["type"] == "transcript":
                        transcript = analysis["body"].get("transcript", "")
                    elif analysis["type"] == "summary":
                        summary = analysis["body"]

                embedding = None
                if transcript:
                    emb_resp = openai.embeddings.create(
                        model="text-embedding-ada-002",
                        input=transcript
                    )
                    embedding = emb_resp.data[0].embedding

                supabase.table("fact_calls").insert({
                    "call_id": call_id,
                    "agent_id": agent_id,
                    "customer_id": customer_id,
                    "date_id": date_id,
                    "duration_seconds": int(duration),
                    "call_timestamp": timestamp,
                    "disposition": disposition,
                    "direction": direction,
                    "transcript": transcript,
                    "summary": summary,
                    "embedding": embedding,
                    "audio_url": audio_url
                }).execute()

                print(f"✅ Inserted: {filename}")

            except Exception as e:
                print(f"❌ Error in {filename}: {e}")
