# ConvoLens

ConvoLens is a voice- and chat-enabled analytics platform built for analyzing customer service conversations. Developed for the [VCon Hackathon 2025](https://github.com/vcon-dev/tadhack-2025), ConvoLens uses a hybrid of structured SQL querying and RAG (Retrieval-Augmented Generation) to deliver deep insights into customer interactions.

## 🌐 Live Demo
Coming soon...

---

## 📁 Dataset

We used synthetic `.vcon.json` call data from **Aquidneck Yacht Brokers**, available [here](https://github.com/vcon-dev/tadhack-2025/tree/main).

---

## ⚙️ Architecture Overview

### 🔄 Data Ingestion
- Parses `.vcon.json` files using a Python script.
- Embeds call transcripts using **OpenAI Embeddings API**.
- Inserts data into **Supabase**:
  - `fact_calls`: call metadata, transcripts, embeddings
  - `dim_agent`, `dim_customer`, `dim_date`: dimension tables
  - `pgvector`: used for semantic search

### 🧠 AI Logic (Backend)
- Built with **FastAPI**
- Handles both text and voice queries
- Determines whether to use:
  - **SQL Query** (for structured questions)
  - **RAG + Embedding Search** (for semantic questions)
  - **Google Meet Scheduling** (for meeting-related prompts)
- Returns **human-like answers** using OpenAI completions

### 🖥️ Frontend (Next.js)
- **Dashboard**: High-level call metrics and KPIs
- **Conversations**: Searchable list of calls with sentiment, issue types, etc.
- **Analytics**: Agent-level performance insights
- **Chat**: Ask anything about your call center
- **Voice Assistant**: Powered by **Vapi**, send spoken queries

---

## 🧰 Tech Stack

| Layer          | Technology                        |
|----------------|------------------------------------|
| Frontend       | Next.js (React)                   |
| Backend        | FastAPI (Python)                  |
| Database       | Supabase (Postgres + pgvector)    |
| AI             | OpenAI (Embeddings + Completion)  |
| Voice Assistant| Vapi.ai                           |
| Meeting API    | Google Meet (Calendar API)        |

---

## 📦 Folder Structure

```bash
.
├── api/                          # FastAPI backend
│   ├── main.py
|
├── yacht-analytics-dashboard/    # Next.js frontend
│   ├── app/
│   ├── components/
│   └── hooks/
│   └── lib/
│   └── piblic/
│   └── styles/
│   └── components.json
│   └── next.config.mjs
│   └── package-lock.json
│   └── package.json
│   └── pnpm-lock.yaml
│   └── postcss.config.mjs
│   └── tailwind.config.ts
│   └── tsconfig.json
|
├── db_ingestion/                 # Python scripts for ingestion
│   └── config.py
│   └── ingest_vcon.py
|
├── supabase/                     # SQL schema & functions
│   └── schema.sql
│   └── supabase_functions/
│       └── get_call_center_metrics.sql
│       └── get_call_summary.sql
│       └── get_daily_resolution_status.sql
│       └── get_daily_sentiment_pct.sql
│       └── get_issue_counts.sql
│       └── get_issue_distribution.sql
│       └── get_weekday_call_counts.sql
│       └── match_calls.sql
│       └── search_similar_calls.sql
|
├── .env.example
└── README.md
