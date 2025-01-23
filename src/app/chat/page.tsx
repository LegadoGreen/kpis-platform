"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { initializeAssistantAndStore } from "../utils/openai";
import { useAssistantStore } from "../store/assistantStore";
import { 
  createThread,
  addMessageToThread,
  runAssistantOnThread,
  fetchThreadMessages 
} from "../utils/openai";

const ChatPage: React.FC = () => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: number; role: string; content: string }[]
  >([]);
  const [conversations, setConversations] = useState<
    { id: number; title: string }[]
  >([]);

  const assistantId = useAssistantStore((state) => state.assistantId);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { assistantId, vectorStoreId } = await initializeAssistantAndStore();
        console.log("Initialized assistant and vector store:", {
          assistantId,
          vectorStoreId,
        });
      } catch (error) {
        console.error("Error initializing assistant and vector store:", error);
      }
    };
  
    initialize();
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
    if (!assistantId) {
      console.error("Assistant ID not initialized");
      return;
    }
  
    // Add the user's message to the local state to display it immediately
    setMessages([...messages, { id: Date.now(), role: "user", content }]);
  
    try {
      let currentThreadId = threadId;
  
      // Check if a threadId exists; if not, create a new thread
      if (!currentThreadId) {
        currentThreadId = await createThread("Start a new conversation");
        setThreadId(currentThreadId);
  
        // Optionally update the conversations list
        setConversations((prevConversations) => [
          ...prevConversations,
          { id: Date.now(), title: `Conversation ${prevConversations.length + 1}` },
        ]);
      }
  
      // Continue with adding the message to the thread and running the assistant
      await addMessageToThread(currentThreadId, content);
      const runId = await runAssistantOnThread(currentThreadId, assistantId);
  
      if (runId) {
        const assistantMessages = await fetchThreadMessages(currentThreadId, runId);
        setMessages((prev) => [
          ...prev,
          ...assistantMessages.map((msg) => ({
            id: Date.now(),
            role: msg.role,
            content: msg.content[0].type === "text"
              ? msg.content[0].text.value
              : "Error with the message",
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
      <p>Loading assistant...</p>
    )
  );
};

export default ChatPage;
