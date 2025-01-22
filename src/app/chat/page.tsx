"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import {
  createThread,
  addMessageToThread,
  runAssistantOnThread,
  fetchThreadMessages,
  createAssistant,
  createVectorStore
} from "../utils/openai";

const ChatPage: React.FC = () => {
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: number; role: string; content: string }[]
  >([]);
  const [conversations, setConversations] = useState<
    { id: number; title: string }[]
  >([{ id: 1, title: "Conversation 1" }]);

  // Initialize assistant ID on component mount
  useEffect(() => {
    const fetchAssistantId = async () => {
      try {
        // Replace with your logic to retrieve the assistant ID
        const storedAssistantId = localStorage.getItem('assistantId');
        console.log(storedAssistantId);
        setAssistantId(storedAssistantId);
      } catch (error) {
        console.error("Error fetching assistant ID:", error);
      }
    };

    fetchAssistantId();
  }, []);

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

  const handleNewConversation = async () => {
    try {
      const threadId = await createThread("Start a new conversation");
      setThreadId(threadId);
      setConversations([
        ...conversations,
        { id: Date.now(), title: `Conversation ${conversations.length + 1}` },
      ]);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    console.log(threadId, assistantId);
    if (!threadId || !assistantId) {
      console.error("Thread or Assistant ID not initialized");
      return;
    }

    setMessages([...messages, { id: Date.now(), role: "user", content }]);

    try {
      await addMessageToThread(threadId, content);
      const runId = await runAssistantOnThread(threadId, assistantId);
      console.log('runId', runId);
      if (runId) {
        const assistantMessages = await fetchThreadMessages(threadId, runId);
        setMessages((prev) => [
          ...prev,
          ...assistantMessages.map((msg) => ({
            id: Date.now(),
            role: msg.role,
            content: msg.content[0].type === "text" ? msg.content[0].text.value : "Error con el mensaje",
          })),
        ]);
      }
    } catch (error) {
      console.error("Error during message exchange:", error);
    }
  };

  return (
    assistantId ? (
      <div className="flex h-screen bg-background">
        <Sidebar
          conversations={conversations}
          onNewConversation={handleNewConversation}
          onSelectConversation={() => {
            // Handle conversation selection
          }}
        />
        <div className="flex flex-col flex-1 p-4 space-y-4">
          <ChatWindow messages={messages} />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    ) : (
      <p>Loading...</p>
    )
  );
};

export default ChatPage;
