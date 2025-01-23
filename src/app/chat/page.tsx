"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { initializeAssistantAndStore } from "../utils/openai";
import { useAssistantStore } from "../store/assistantStore";
import { Conversation } from "../interfaces/assistant";
import {
  createThread,
  addMessageToThread,
  runAssistantOnThread,
  fetchThreadMessages,
} from "../utils/openai";

import {
  createConversation,
  getAllConversations,
  createMessage,
  getConversationById,
  getMessages
} from "../utils/assistantApi";

interface LocalMessage {
  id: number;      // local unique ID for rendering
  role: string;    // "user" or "assistant"
  content: string;
}

const ChatPage: React.FC = () => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const assistantId = useAssistantStore((state) => state.assistantId);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { assistantId: initAssistantId, vectorStoreId } =
          await initializeAssistantAndStore();
        console.log("Initialized assistant & vector store:", {
          initAssistantId,
          vectorStoreId,
        });

        // If you want to load existing conversations from Xano
        const existing = await getAllConversations();
        // inverse order
        existing.reverse();
        setConversations(existing);
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    initialize();
  }, []);

  // Creates a new "thread" on the front end (OpenAI logic) 
  // and also a new conversation in Xano
  const handleNewConversation = async () => {
    try {
      if (!assistantId) {
        console.error("Assistant ID not initialized");
        return;
      }

      // 1) Create a new thread with openai.ts
      const newThreadId = await createThread("Start a new conversation");
      setThreadId(newThreadId);

      // 2) Store it in Xano
      const newConvTitle = `Conversation ${conversations.length + 1}`;
      const newConv = await createConversation(assistantId, newThreadId, newConvTitle);

      // 3) Update local state
      setConversations((prev) => [...prev, newConv]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  // Send user message to the AI, store it in Xano
  const handleSendMessage = async (content: string) => {
    if (!assistantId) {
      console.error("Assistant ID not initialized");
      return;
    }

    // Optimistically show it in local chat window
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content },
    ]);

    try {
      // Ensure we have a thread
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread("Start a new conversation");
        setThreadId(currentThreadId);
      }

      // Also ensure we have an active conversation in Xano
      let conversationId = activeConversationId;
      if (!conversationId) {
        const newConvTitle = `Conversation ${conversations.length + 1}`;
        const newConv = await createConversation(assistantId, currentThreadId, newConvTitle);
        setConversations((prev) => [...prev, newConv]);
        conversationId = newConv.id;
        setActiveConversationId(conversationId);
      }

      await addMessageToThread(currentThreadId, content);

      if (conversationId) {
        await createMessage(conversationId, "user", content);
      }

      // 3) Run the assistant (OpenAI) logic
      const runId = await runAssistantOnThread(currentThreadId, assistantId);

      // 4) Fetch the assistant’s messages from your local AI
      if (runId) {
        const assistantMessages = await fetchThreadMessages(currentThreadId, runId);

        // For each assistant message, update local & Xano
        for (const msg of assistantMessages) {
          const textContent =
            msg.content[0].type === "text"
              ? msg.content[0].text.value
              : "Error in message content";

          // Local state
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: msg.role, content: textContent },
          ]);

          // Xano
          if (conversationId) {
            await createMessage(conversationId, msg.role, textContent);
          }
        }
      }
    } catch (error) {
      console.error("Error during message exchange:", error);
    }
  };


  const handleSelectConversation = async (conversationId: number) => {
    try {
      // 1) Fetch the conversation from Xano
      const fetchedMessages = await getMessages(conversationId);

      setActiveConversationId(conversationId);
      setThreadId(fetchedMessages.thread_id);

      const localMsgFormat = fetchedMessages.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));

      // order by id
      localMsgFormat.sort((a, b) => a.id - b.id);

      // 6) Finally, set the messages to display in ChatWindow
      setMessages(localMsgFormat);
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  };

  return assistantId ? (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={conversations.map((c) => ({
          id: c.id,
          title: c.title || `Conv ${c.id}`,
        }))}
        onNewConversation={handleNewConversation}
        onSelectConversation={(id) => handleSelectConversation(Number(id))}
      />
      <div className="flex flex-col flex-1 p-4 space-y-4">
        <ChatWindow messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  ) : (
    <p>Loading assistant...</p>
  );
};

export default ChatPage;
