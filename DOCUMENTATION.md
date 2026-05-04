# Callus Admissions Agent: Official Documentation

## 1. Project Overview
**Callus Admissions Agent** is a state-of-the-art, AI-powered platform designed to help high school students craft winning college applications. The platform acts as a digital admissions consultant, guiding students through a structured workflow to generate, evaluate, and refine their personal statements and supplemental essays.

---

## 2. Technology Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion (Animations), Lucide-React (Icons).
- **Backend:** FastAPI (Python), SQLAlchemy (ORM).
- **Database:** TiDB Cloud (MySQL-compatible Serverless DB).
- **AI Integration:** OpenRouter API (using high-end free models like GPT-OSS 120B).
- **Authentication:** JWT-based secure login with Email OTP verification.

---

## 3. Key Features
### 🎓 Intelligent Student Profiling
Students start by providing their background, target universities, and a short bio. The AI uses this context to personalize every subsequent interaction.

### 🎙️ The "Story-First" Interview
Instead of staring at a blank page, students engage in a 10-15 minute interview with the AI counselor. The AI asks probing questions to extract unique stories, values, and personal growth moments.

### 📝 Automated Essay Drafting
Once the interview is complete, the AI transforms the raw transcript into a structured, narrative-driven essay draft tailored to the student's voice.

### 📊 Professional Scoring & Evaluation
The "Score" module evaluates drafts across five critical admissions criteria:
- **Narrative Depth:** How well the story is told.
- **Authentic Voice:** Whether it sounds like a real student.
- **Emotional Impact:** The "pull" of the essay.
- **Prompt Alignment:** Relevance to the Common App or specific prompts.
- **Originality:** Uniqueness of the perspective.

### 🛠️ Precision Refinement
Students can give specific instructions (e.g., "Make the introduction more hook-driven" or "Cut 50 words") and the AI will rewrite the draft while maintaining the core story.

### 🏢 Supplemental Strategic Guidance
Beyond the personal statement, the tool helps helps students tackle school-specific supplemental prompts by providing strategic outlines and "What they look for" reports.

---

## 4. Feature Walkthrough (How to Use)

### Step 1: Onboarding
1.  **Register:** Create an account with your email.
2.  **Verify:** Check your email for a 6-digit OTP code to verify your account.
3.  **Setup Profile:** Fill in your "Target Universities" and a brief "Bio." This is the foundation for the AI's logic.

### Step 2: The Interview
1.  Go to the **Studio** (Chat page).
2.  Answer the AI Counselor's questions. Be honest and descriptive.
3.  When you feel you've shared enough, click **"Generate Draft"**.

### Step 3: Drafting & Scoring
1.  Review your generated essay in the **Draft Essay** tab.
2.  Switch to the **Score** tab and click **"Evaluate Draft"**. 
3.  Read the **Verdict** and identify areas for improvement.

### Step 4: Refinement
1.  If the score is low in "Voice" or "Narrative," go to the **Refine** tab.
2.  Type an instruction like: *"Make the ending more reflective about my growth."*
3.  The new draft will appear in the Essay tab.

### Step 5: Supplemental Support
1.  In the **Supplemental** tab, enter a school (e.g., "Harvard") and their prompt.
2.  Click **"Generate Guidance"** to get a strategic breakdown of how to win over that specific committee.

### Step 6: Managing Your Work
1.  Use the **"Save"** icon on any score report or supplemental guide.
2.  Go to your **Profile Dashboard** to see all your "Saved Work."
3.  From there, you can view, copy, or delete your previous sessions.

---

## 5. Maintenance & Setup

### Local Development
- **Backend:** `python -m uvicorn main:app --reload` (Run from within the `backend` folder).
- **Frontend:** `npm run dev` (Run from within the `frontend` folder).

### Production Hosting
- **Backend:** Hosted on **Render.com** (linked to GitHub).
- **Frontend:** Hosted on **Vercel** (linked to GitHub).
- **Database:** Managed via **TiDB Cloud Dashboard**.

---

## 6. Security & Best Practices
- **Environment Variables:** All API keys and DB credentials must stay in `.env` and should **never** be pushed to GitHub.
- **CORS:** Ensure the backend `main.py` allows your Vercel domain to prevent blocked requests.
- **Token Expiry:** User sessions are valid for 7 days via JWT.
