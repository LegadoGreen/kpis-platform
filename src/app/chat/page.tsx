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
  >([{ id: 1, title: "Conversation 1" }]);

  const assistantId = useAssistantStore((state) => state.assistantId);

  useEffect(() => {
    const initialize = async () => {
      const { assistantId } = await initializeAssistantAndStore();
      console.log("Assistant initialized with ID:", assistantId);
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
    if (!threadId || !assistantId) {
      console.error("Thread or Assistant ID not initialized");
      return;
    }

    setMessages([...messages, { id: Date.now(), role: "user", content }]);

    try {
      await addMessageToThread(threadId, content);
      const runId = await runAssistantOnThread(threadId, assistantId);
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
      <p>Loading assistant...</p>
    )
  );
};

export default ChatPage;
