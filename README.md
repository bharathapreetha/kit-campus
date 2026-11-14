# 🎓 Kit Campus – AI-Powered Voice Assistant

An AI-powered college website featuring an interactive voice assistant that helps prospective students explore college courses, understand admission details, and get answers to their questions through natural voice conversations.

## 🌟 Project Overview

Kit Campus aims to make college information more accessible through conversational AI.

Instead of navigating through multiple pages or searching for admission information manually, visitors can simply speak to the assistant and receive relevant answers.

The project integrates **Generative AI, Speech-to-Text, and Text-to-Speech** to create a natural voice-based interaction experience.

## ✨ Features Implemented

- 🏫 **College Homepage** – A simple homepage introducing the college.
- 🎙️ **Voice Interaction** – Users can ask questions using their microphone.
- 🗣️ **Speech-to-Text** – Converts spoken questions into text using Deepgram.
- 🧠 **AI-Powered Responses** – Uses Google Gemini to understand questions and generate conversational answers.
- 🔗 **Live College API Integration** – Fetches actual course information from the college API.
- 🔊 **Text-to-Speech** – Converts AI-generated answers into audio using Deepgram.
- 💬 **Conversation Display** – Displays the recognized question and assistant response on the website.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Backend | Python, FastAPI |
| LLM | Google Gemini API |
| Speech-to-Text | Deepgram API |
| Text-to-Speech | Deepgram API |
| API Integration | College REST API |
| Environment Management | Python Virtual Environment, `.env` |

## 🏗️ Architecture

```text
                 USER
                   |
                   v
          React.js Homepage
                   |
             Microphone
                   |
             MediaRecorder
                   |
                   v
          FastAPI Backend
                   |
                   v
             Deepgram STT
          (Speech to Text)
                   |
                   v
            User Transcript
                   |
                   v
          College Information
             REST API
                   |
                   v
              Google Gemini
            (LLM Processing)
                   |
                   v
           Generated Answer
                   |
                   v
             Deepgram TTS
          (Text to Speech)
                   |
                   v
           Audio Response
                   |
                   v
           React Audio Player
                   |
                   v
                  USER
```

## 🔄 Voice Assistant Workflow

1. The visitor opens the Kit Campus homepage.
2. The visitor clicks the microphone and asks a question.
3. React's MediaRecorder captures the audio.
4. The audio is sent to the FastAPI backend.
5. Deepgram converts the audio into text.
6. The backend retrieves relevant course information from the college API.
7. Google Gemini generates an answer using the retrieved college information.
8. Deepgram converts the answer into speech.
9. The visitor receives both a displayed text response and an audio response.

## 🧠 Generative AI Implementation

The project uses Google Gemini as its language model.

The assistant receives:
- The visitor's question.
- Live course information retrieved from the college API.
- Instructions to answer using the available college information.

The assistant is instructed not to invent unavailable college details and to direct visitors to the admission office when information is missing.

## 📂 Project Structure

```text
kit-campus/
│
├── backend/
│   ├── main.py
│   ├── .env
│   └── .venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
└── README.md
```

*Note: Update the folder structure if your actual frontend directory or files differ.*

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/bharathapreetha/kit-campus.git
cd kit-campus
```

### 2. Backend Setup

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install fastapi uvicorn python-dotenv google-genai httpx python-multipart
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
GEMINI_API_KEY=your_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
COLLEGE_API_BASE_URL=https://ht.knowvally.com
PARTICIPANT_KEY=your_participant_key
```

**Important:** Never commit your `.env` file or expose API keys in the frontend or public repository.

### 4. Run the Backend

```bash
uvicorn main:app --reload
```

Backend API:

`http://127.0.0.1:8000`

FastAPI documentation:

`http://127.0.0.1:8000/docs`

### 5. Run the Frontend

Open another terminal and navigate to your frontend directory:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🚀 Future Enhancements

The project is being developed towards a unified college voice assistant with additional capabilities:

- 🔐 Student and teacher authentication.
- 📚 Student services such as attendance, academic rules, and leave requests.
- 👩‍🏫 Teacher workflows for reviewing and approving student requests.
- 📝 Voice-based admission application submission.
- 💬 Conversation history management.
- 🧭 Intent recognition and tool-based action execution.
- 🛡️ Role-based access control and secure API integration.

## 🎯 Project Goal

To build an intelligent, voice-enabled college assistant that simplifies communication between prospective students, students, teachers, and the institution through Generative AI.

---

**Developed with ❤️ using React, FastAPI, Google Gemini, and Deepgram.**
