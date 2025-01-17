"use client";
import LoginForm from "./components/LoginForm";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { createAssistant, createVectorStore } from "./utils/openai";


export default function Home() {
  const [assistantId, setAssistantId] = useState<string | null>(null);

  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        const assistant = await createAssistant();
        const vectorStoreId = await createVectorStore(assistant);
        console.log("Assistant and Vector Store Initialized:", {
          assistantId: assistant,
          vectorStoreId,
        });
        setAssistantId(assistant);
        localStorage.setItem('assistantId', assistant);
      } catch (error) {
        console.error("Error initializing assistant:", error);
      }
    };

    initializeAssistant();
  }, []);


  return (
    assistantId ? (
      <AuthProvider>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <LoginForm />
        </div>
      </AuthProvider>
    ): (
      <p>Loading...</p>
    )
  );
}
