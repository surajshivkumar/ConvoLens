import os
import json
import hashlib
from datetime import datetime
from openai import OpenAI
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY, VCON_FOLDER

# Supabase & OpenAI setup
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_id(email, phone):
    return hashlib.md5((email or "" + phone or "").encode()).hexdigest()

def classify_transcript(transcript):
    prompt = f"""
You are analyzing a transcript between a support agent and a customer.

Return a JSON object with:
1. issue_type: One of these:
   - Returns & Refunds
   - Shipping & Logistics
   - Order Issues
   - Equipment Support
   - Business Services
   - Account Management
   - Appointments & Scheduling

2. sentiment: "positive" or "negative"

3. sentiment_score: A float from 0.0 (very negative) to 1.0 (very positive)

4. resolved: true or false

5. agent_politeness: A float between 0.0 and 1.0 (based on use of customer name, “please”, “thank you”)

6. agent_professionalism: A float between 0.0 and 1.0 (if agent introduced self, confirmed information, set expectations)

7. process_adherence: A float between 0.0 and 1.0 (if agent followed procedures like verifying email/order, giving confirmation)

Transcript:
\"\"\"
{transcript}
\"\"\"

Respond with a JSON object using the exact keys: issue_type, sentiment, sentiment_score, resolved, agent_politeness, agent_professionalism, process_adherence.
"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

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
                issue_type = None
                sentiment = None
                sentiment_score = None
                resolved = None
                agent_politeness = None
                agent_professionalism = None
                process_adherence = None

                if transcript:
                    # Embedding
                    emb_resp = client.embeddings.create(
                        model="text-embedding-ada-002",
                        input=transcript
                    )
                    embedding = emb_resp.data[0].embedding

                    # Classification
                    classification = classify_transcript(transcript)
                    issue_type = classification.get("issue_type")
                    sentiment = classification.get("sentiment")
                    sentiment_score = classification.get("sentiment_score")
                    resolved = classification.get("resolved")
                    agent_politeness = classification.get("agent_politeness")
                    agent_professionalism = classification.get("agent_professionalism")
                    process_adherence = classification.get("process_adherence")

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
                    "audio_url": audio_url,
                    "issue_type": issue_type,
                    "sentiment": sentiment,
                    "sentiment_score": sentiment_score,
                    "resolved": resolved,
                    "agent_politeness": agent_politeness,
                    "agent_professionalism": agent_professionalism,
                    "process_adherence": process_adherence
                }).execute()

                print(f"✅ Inserted: {filename}")

            except Exception as e:
                print(f"❌ Error in {filename}: {e}")
