# 📚 StudyAI — AI Study Assistant Platform

> Transform your study materials into summaries, flashcards, quizzes, and personalized insights using **GPT-4** and **Gemini AI**.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **PDF / DOCX Upload** | Upload study material (PDF, DOCX, TXT) |
| 🧠 **AI Summaries** | Instant structured bullet-point summaries |
| 🃏 **Flashcards** | Flip-card flashcards with spaced repetition |
| ❓ **Quiz Generator** | MCQ quiz with scoring + explanations |
| 💬 **AI Chat Assistant** | Ask anything about your document |
| 📊 **Study Analytics** | Quiz performance charts & learning profile |
| 💡 **Personalized Insights** | AI study plan & recommendations |
| 🔍 **Document Search** | Find documents by title or tag |
| 🌗 **Dark / Light Mode** | Toggle between themes |
| 🔐 **Auth System** | JWT-based register/login |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS v3, Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| AI | OpenAI GPT-4o Mini + Google Gemini 1.5 Flash |
| PDF | pdf-parse + mammoth |
| Charts | Recharts |

---

## 📁 Project Structure

```
AI-Study-Assistant/
├── backend/
│   ├── config/         # DB, OpenAI, Gemini clients
│   ├── controllers/    # Auth, Document, AI, Progress
│   ├── middleware/     # JWT auth, Multer upload, Error handler
│   ├── models/         # User, Document, Flashcard, Quiz, ChatHistory, StudyInsight
│   ├── routes/         # /api/auth, /api/documents, /api/ai, /api/progress
│   ├── utils/          # Text extractor, helpers
│   ├── uploads/        # Stored files (gitignored)
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/ # Sidebar, StatCard, FlipCard, QuizCard, ChatBox, FileUpload
    │   ├── context/    # AuthContext, ThemeContext
    │   ├── pages/      # Landing, Auth, Dashboard, DocumentView, Analytics, Search, Profile
    │   └── services/   # api, documentService, aiService, progressService
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Clone / Navigate

```bash
cd "AI-Study-Assistant"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ai-study-assistant
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## 🔑 API Keys Setup

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Paste in `OPENAI_API_KEY`

### Google Gemini API Key
1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Paste in `GEMINI_API_KEY`

### MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a DB user
4. Get the connection string
5. Replace `MONGODB_URI` in `.env`

---

## 📡 API Reference

### Auth
```
POST /api/auth/register   — Register
POST /api/auth/login      — Login
GET  /api/auth/me         — Get profile
PUT  /api/auth/update     — Update profile
```

### Documents
```
POST   /api/documents/upload  — Upload PDF/DOCX
GET    /api/documents         — List documents
GET    /api/documents/:id     — Get document
PATCH  /api/documents/:id     — Update title/tags
DELETE /api/documents/:id     — Delete document
```

### AI Engine
```
POST /api/ai/summarize/:docId           — Generate summary
POST /api/ai/flashcards/:docId          — Generate flashcards
GET  /api/ai/flashcards/:docId          — Get saved flashcards
PATCH /api/ai/flashcards/:cardId/favorite — Toggle favorite
POST /api/ai/quiz/:docId                — Generate quiz
POST /api/ai/quiz/:quizId/submit        — Submit quiz answers
POST /api/ai/chat/:docId                — Send chat message
POST /api/ai/insights/:docId            — Generate insights
GET  /api/ai/insights/:docId            — Get saved insights
```

### Progress
```
GET /api/progress/stats            — Dashboard stats
GET /api/progress/activity         — Activity feed
GET /api/progress/quiz-performance — Quiz history
```

---

## 🌍 Deployment

### Backend (Railway / Render)
1. Push code to GitHub
2. Connect to Railway or Render
3. Set environment variables from `.env`
4. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` env var to your backend URL
2. Update `vite.config.js` proxy to backend URL
3. Deploy `frontend/` folder

---

## 🤖 AI Provider Logic

The app uses a smart auto-routing system:
- **Gemini** → Summaries, Chat, Insights (conversational tasks)
- **OpenAI GPT-4** → Flashcards, Quiz (structured JSON tasks)
- Users can override this in **Profile → AI Provider settings**

---

## 📜 License

MIT — Free to use and modify for educational purposes.
