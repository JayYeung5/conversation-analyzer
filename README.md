# Conversation Analyzer

Analyze meetings, lectures, or talks from audio/video **or** a pasted transcript. Get a structured summary, topic weights & durations, keyword frequencies (with charts), off-topic moments, and the full transcript. Results are saved to Firestore and can be downloaded as JSON.

🔗 **Live Demo:** https://conversation-analyzer-3fxf.vercel.app/

---

## Features

- Upload audio/video (MP3/WAV/MP4) or paste a transcript
- Transcription via Deepgram → LLM analysis via Groq
- Structured Summary (Main Points / Action Items / Decisions)
- Topic Weights & Durations, Keyword Frequency (Recharts)
- Off-topic segments
- Collapsible sections + “Expand all / Collapse all”
- Download raw analysis JSON
- Mobile-friendly UI (no horizontal scroll)

---

## Tech Stack

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **Firebase Firestore**
- **Deepgram** (transcription), **Groq** (LLM)
- **Recharts** (data visualization)

---

## Future Improvements

- Detect speakers and per-speaker summaries
- Account login and history tracking

---

## Getting Started (Local)

```bash
git clone https://github.com/JayYeung5/conversation-analyzer.git
cd conversation-analyzer
npm install
npm run dev
