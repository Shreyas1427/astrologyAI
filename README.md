# Vedaz Astro Lite

A simple, clean **AI Astrologer** demo app that collects birth details and returns astrology‑style guidance. Built to match the JD requirements: NLP + LLM (optional), rule‑based fallback, clean UI, and a free‑text question workflow.

## ✨ Features
- Birth input form: **Name, Date, Time, Place, Timezone**.
- **Rule‑based offline engine** (Sun sign + element + modality + numerology + Chinese zodiac) for instant results.
- **Free‑text Q&A**:
  - **Rule‑based guidance** (offline) OR
  - **OpenAI-powered answers** if you add your API key (client-side only; demo use).
- Export **PNG** or **PDF** report snapshot.
- Sleek UI with Tailwind + subtle motion.

> ⚠️ This is a demo—no precise astronomical calculations. Avoid medical/legal/financial absolutes in usage.

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS, Framer Motion, Lucide icons
- **NLP/AI**: Rule‑based fallback + optional OpenAI (`gpt-4o-mini`) via browser
- **Utilities**: `html-to-image`, `jspdf`, `zod`

## 🚀 Run Locally
```bash
# 1) Install deps
npm i

# 2) Start dev server
npm run dev

# 3) Open the localhost URL shown in your terminal
```

## 🔧 Configure (Optional)
To enable OpenAI answers:
1. Click **Settings** (gear icon) in the app header.
2. Paste your **OpenAI API key**.
3. Switch **Mode** to *OpenAI*.  
If you don’t add a key, the app uses the built‑in rule‑based guidance.

> Keys are stored in your browser `localStorage`. For hack/demo only.

## 🧠 How the "Astro Engine" Works
- **Sun Sign**: Date ranges (Aries→Pisces).
- **Element & Modality**: Per sign mapping.
- **Numerology**: Life Path = digit sum of DOB, with master numbers (11/22/33).
- **Chinese Zodiac**: Year mod 12 (Rat→Pig).
- **Daily Message**: Seeded from name + date for deterministic variety.
- **Q&A**: 
  - Rule-based keyword routes (career, love, study, finance, health, etc.) that adapt to sign/element/modality/life path.
  - LLM mode composes a safe system prompt from the profile and your question, returning empathetic, actionable tips.

## 🧪 Demo Script (2–5 minutes)
1. **Intro (15s)**: “This is Vedaz Astro Lite, a lightweight AI astrologer built in React.”
2. **Birth Input (45s)**: Enter name, date, time, place, timezone → *Generate Profile*.
3. **Report (45s)**: Show Sun sign, element, modality, numerology, Chinese zodiac, and the daily message.
4. **Free‑Text Question (60–90s)**: Ask a career or love question.
   - Show **Rule‑based** guidance first.
   - Switch to **OpenAI** mode (paste key) and ask again; compare depth.
5. **Export (15s)**: Click **PNG/PDF** to save the snapshot.
6. **Wrap‑up (15s)**: Summarize tech stack and how it meets the JD (NLP, LLMs, model improvements can be iterated).

## 🧯 Safety Notes
- LLM prompt steers away from deterministic claims; focuses on supportive, practical suggestions.
- Avoids health/finance absolutes; encourages agency and reflection.

## 📦 Future Enhancements (aligns with JD)
- **Add FastAPI backend** with token-protected OpenAI calls + logging.
- **Add Rasa or LangChain** for dialog flows and retrieval.
- **Recommendation engine**: personalized rituals/remedies based on behavior + sign + numerology.
- **MLOps**: capture feedback, run A/B experiments, and track with MLflow; containerize with Docker; deploy to AWS (ECS/Fargate) with monitoring.
- **Astro math**: integrate Swiss Ephemeris or flatlib for precise charts if licensing allows.

---

© 2025 Vedaz Astro Lite – demo only.
