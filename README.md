📌 Meridian Hire AI

AI-Based Skill Assessment & Hiring System

---

🧑‍🎓 Project Overview

Meridian Hire AI is a web-based application developed to assist recruiters in evaluating candidates using Artificial Intelligence. The system takes a candidate’s resume and job description as input, performs skill extraction, conducts an adaptive interview process, and generates a structured hiring report along with a learning plan.

This project demonstrates the integration of modern web technologies with AI-driven workflows to automate and enhance the hiring process.

---

🎯 Objectives

- To automate candidate evaluation using AI
- To analyze resumes and job descriptions
- To conduct adaptive interview simulations
- To generate structured reports for recruiters
- To provide learning recommendations for candidates

---

🛠️ Technologies Used

Frontend

- React.js (Vite)
- Tailwind CSS
- React Router

Backend

- Node.js
- Express.js

Deployment

- Frontend: Vercel
- Backend: Render

---

🏗️ System Architecture

Frontend (React - Vercel)
        ↓
API Calls (/api)
        ↓
Backend (Node.js - Render)
        ↓
Processing & Response
        ↓
UI Display (Dashboard / Report)

---

📂 Project Structure

MeridianHire-AI/
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── lib/
│   └── vite.config.js
│
├── server/                # Backend (Node.js)
│   ├── routes/
│   ├── controllers/
│   └── index.js
│
└── README.md

---

⚙️ Installation & Setup

Step 1: Clone Repository

git clone https://github.com/abhiramyadav22/MeridianHire-AI.git
cd MeridianHire-AI

---

Step 2: Setup Frontend

cd client
npm install
npm run dev

Frontend runs at:

http://localhost:5173

---

Step 3: Setup Backend

cd ..
cd server
npm install
node index.js

Backend runs at:

http://localhost:3001   (or 5000 based on config)

---

🔗 API Endpoints

Method| Endpoint| Description
GET| /api/health| Check server status
POST| /api/session| Create new session
POST| /api/session/:id/initialize| Start assessment
POST| /api/session/:id/interview| Conduct interview
POST| /api/session/:id/finalize| Generate report
GET| /api/session/:id| Fetch session data

---

🌐 Environment Variables

Frontend (.env)

VITE_API_URL=http://localhost:3001/api

---

Backend (.env)

PORT=3001

---

🚀 Deployment

Frontend (Vercel)

- Import GitHub repository
- Set root directory: "client"
- Add environment variable:
  VITE_API_URL=https://your-backend-url/api

---

Backend (Render)

- Create Web Service
- Set root directory: "server"
- Build Command:
  npm install
- Start Command:
  node index.js

---

🧪 Features Explanation

1. Resume & JD Analysis

Extracts key skills and compares them with job requirements.

2. Adaptive Interview

AI generates questions dynamically based on candidate responses.

3. Scoring System

Provides a confidence score based on performance.

4. Report Generation

Displays structured hiring decision (Fit / Moderate / Reject).

5. Learning Plan

Suggests improvements for candidates.

---

⚠️ Common Issues & Solutions

❌ Failed to fetch

✔ Backend not running
✔ Wrong API URL
✔ Proxy not configured

---

❌ Vercel not updating

✔ Changes not pushed to GitHub

---

❌ Git shows “nothing to commit”

✔ File not saved
✔ Working in wrong folder

---

📸 Screenshots

(Add your project screenshots here)

---

📈 Future Enhancements

- Integration with real AI APIs
- Authentication system
- Database support (MongoDB)
- Real-time interview tracking

---

👨‍💻 Author

Abhiram Yadav
B.Tech Student (AI & ML)

---

📜 Conclusion

This project demonstrates the practical implementation of AI concepts in the hiring domain. It improves efficiency, reduces manual effort, and provides structured insights for better decision-making.

---

📄 License

This project is for educational purposes.
