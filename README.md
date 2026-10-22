# MindQuest

MindQuest is a React/Vite fantasy adventure for practicing small, non-clinical
wellness activities with Nova, an AI companion. It is an educational project:
emotion predictions are estimates from text and are **not** diagnoses or a
replacement for professional care.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:3000`. Node.js 20 or newer is recommended.

`GEMINI_API_KEY` is optional. Without it, MindQuest uses its local demo mode:
the local emotion classifier and safe quest/chat fallbacks remain available.
When configured, Gemini is called only from the server; the key is never sent
to the browser. Never commit `.env`.

## AI implementation

The server trains a small Multinomial Naive Bayes text classifier at startup
from the original examples in
[`server/emotionClassifier.ts`](./server/emotionClassifier.ts). It uses
lowercase tokenization, Laplace smoothing, class probabilities, and a
deterministic per-class held-out evaluation. The API exposes:

- `POST /api/predict-emotion` with `{ "text": "..." }`
- `GET /api/model-info` for model details, accuracy, precision, recall, F1,
  and the confusion matrix
- `POST /api/analyze-mood` for the game analysis payload, combining the local
  classifier with Gemini when `GEMINI_API_KEY` is configured

This intentionally lightweight baseline is easy to explain and reproduce for
a college demonstration. It should not be presented as a clinical model.

## Project structure

- `src/` — React game, Nova UI, progress persistence, and charts
- `server.ts` — Express API and Gemini provider integration
- `server/emotionClassifier.ts` — training, inference, and evaluation

## Privacy and safety

Progress and analytics are stored in the browser's local storage in this
version. They are not synchronized across devices. Avoid entering identifying
or highly sensitive information. You can clear local data through the browser
storage controls. If you may be in immediate danger or may hurt yourself,
contact local emergency services or a trusted person and seek qualified crisis
support.
