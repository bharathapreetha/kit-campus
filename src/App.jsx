
import { useRef, useState } from "react";
import "./App.css";

const API_BASE_URL = "https://kit-campus-backend.onrender.com";

const courses = [
  {
    name: "B.Sc Computer Science",
    duration: "3 Years",
    description: "Learn programming, software development and computer fundamentals."
  },
  {
    name: "BCA",
    duration: "3 Years",
    description: "Build your skills in application development and technology."
  },
  {
    name: "BBA",
    duration: "3 Years",
    description: "Explore business management, leadership and entrepreneurship."
  },
  {
    name: "MCA",
    duration: "2 Years",
    description: "Advance your knowledge in computer applications and IT."
  }
];

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState(
    "Click the microphone to talk to us."
  );
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");

  const [assistantMessage, setAssistantMessage] = useState(
    "Hello! I'm your college admission assistant. Click the microphone and ask me anything about our college."
  );

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  const startRecording = async () => {
    try {
      setTranscript("");
      setAnswer("");
      setAssistantMessage("Hello! How can I help you?");
      setStatus("Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const mimeType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setStatus("Processing your question...");

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType
        });

        stream.getTracks().forEach((track) => track.stop());

        const formData = new FormData();
        formData.append("audio", audioBlob, "question.webm");

        try {
          // STEP 1: Deepgram Speech-to-Text
          const response = await fetch(
            `${API_BASE_URL}/transcribe`,
            {
              method: "POST",
              body: formData
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "Transcription failed");
          }

          const userQuestion = data.transcript?.trim();

          if (!userQuestion) {
            throw new Error("No speech detected. Please try again.");
          }

          setTranscript(userQuestion);

          // STEP 2: Send transcript to Gemini
          setStatus("Understanding your question...");

          const chatResponse = await fetch(
            `${API_BASE_URL}/ask`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                transcript: userQuestion
              })
            }
          );

          const chatData = await chatResponse.json();

          if (!chatResponse.ok) {
            throw new Error(
              chatData.detail || "Unable to get Gemini response"
            );
          }

          const assistantAnswer = chatData.answer;

          if (!assistantAnswer) {
            throw new Error("Assistant returned an empty answer.");
          }

          setAnswer(assistantAnswer);

          // STEP 3: Send Gemini answer to Deepgram TTS
          setStatus("Preparing voice response...");

          const speechResponse = await fetch(
            `${API_BASE_URL}/speak`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                transcript: assistantAnswer
              })
            }
          );

          if (!speechResponse.ok) {
            const errorData = await speechResponse.json();
            throw new Error(
              errorData.detail || "Unable to generate speech"
            );
          }

          // STEP 4: Play assistant voice
          const audioBlob = await speechResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          setStatus("Speaking...");

          const audio = new Audio(audioUrl);

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setStatus("Done! Ask me another question.");
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            setStatus("Unable to play audio. Check your headset.");
          };

          await audio.play();

        } catch (error) {
          console.error("Assistant error:", error);
          setStatus(error.message || "Unable to process your question.");
        }
      };

      recorder.start();
      setIsRecording(true);
      setStatus("Listening... Speak your question now.");

    } catch (error) {
      console.error("Microphone error:", error);
      setStatus("Please allow microphone access and try again.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h2>Knotopian Institute of Technology (KIT)</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="subtitle">WELCOME TO KIT</p>
          <h1>Learn Today. Lead Tomorrow.</h1>

          <p>
            Empowering students with knowledge, skills and
            opportunities to build a successful future.
          </p>

          <a href="#courses" className="primary-btn">
            Explore Courses
          </a>
        </div>
      </section>

      <section className="about" id="about">
        <h2>About Our College</h2>

        <p>
          Knotopian Institute of Technology (KIT) is committed
          to providing quality education, practical learning and
          an environment where students can discover their
          potential and achieve their goals.
        </p>
      </section>

      <section className="courses" id="courses">
        <h2>Our Courses</h2>

        <p className="section-description">
          Explore our academic programs and find your future.
        </p>

        <div className="course-grid">
          {courses.map((course, index) => (
            <div className="course-card" key={index}>
              <h3>{course.name}</h3>
              <span>{course.duration}</span>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="talk" id="contact">
        <h2>Need Help With Admissions?</h2>

        <p>
          Have questions about courses, eligibility or admissions?
          Our AI voice assistant is here to help.
        </p>

        <div className="assistant-box">
          <div className="assistant-icon">🎙️</div>

          <h3>Talk to Us</h3>

          <p>{assistantMessage}</p>

          {!isRecording ? (
            <button className="mic-btn" onClick={startRecording}>
              🎤
            </button>
          ) : (
            <button className="stop-btn" onClick={stopRecording}>
              ⏹ Stop Recording
            </button>
          )}

          <p className="status-text">{status}</p>

          {transcript && (
            <div className="transcript-box">
              <strong>You said:</strong>
              <p>{transcript}</p>
            </div>
          )}

          {answer && (
            <div className="assistant-response">
              <strong>Assistant:</strong>
              <p>{answer}</p>
            </div>
          )}
        </div>
      </section>

      <footer>
        © 2026 KIT. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
