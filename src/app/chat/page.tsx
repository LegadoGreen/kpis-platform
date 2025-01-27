"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useAssistantStore } from "../store/assistantStore";
import { Conversation, LocalMessage } from "../interfaces/assistant";
import {
  initializeAssistantAndStore,
  createThread,
  addMessageToThread,
  runAssistantOnThread,
  fetchThreadMessages,
  getImageFromContent  
} from "../utils/openai";
import {
  createConversation,
  getAllConversations,
  createMessage,
  getMessages,
} from "../utils/assistantApi";
import LogoMessage from "../components/LogoMessage";

// Helper function to convert an ArrayBuffer to base64 (client-safe)
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

        // Optionally load existing conversations from Xano (reverse order)
        const existing = await getAllConversations();
        existing.reverse();
        setConversations(existing);
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };
    initialize();
  }, []);

  const handleNewConversation = async () => {
    try {
      if (!assistantId) {
        console.error("Assistant ID not initialized");
        return;
      }

      // 1) Create a new thread with openai.ts
      const newThreadId = await createThread("Start a new conversation");
      setThreadId(newThreadId);

      // 2) Store the conversation in Xano
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

  const handleSendMessage = async (content: string) => {
    if (!assistantId) {
      console.error("Assistant ID not initialized");
      return;
    }

    // Optimistically show user message in local chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        type: "text",
        content: content,
      },
    ]);

    try {
      // Ensure we have a thread
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread("Start a new conversation");
        setThreadId(currentThreadId);
      }

      let conversationId = activeConversationId;
      if (!conversationId) {
        const newConvTitle = `Conversation ${conversations.length + 1}`;
        const newConv = await createConversation(assistantId, currentThreadId, newConvTitle);
        setConversations((prev) => [...prev, newConv]);
        conversationId = newConv.id;
        setActiveConversationId(conversationId);
      }

      await addMessageToThread(currentThreadId as string, content);

      if (conversationId) {
        await createMessage(conversationId, "user", content);
      }

      const runId = await runAssistantOnThread(currentThreadId as string, assistantId);

      if (runId) {
        const assistantMessages = await fetchThreadMessages(currentThreadId as string, runId);

        for (const singleResponse of assistantMessages) {
          for (const piece of singleResponse.content) {
            // TEXT
            if (piece.type === "text") {
              const textContent = piece.text?.value || "";
              
              // Add to local state
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  role: singleResponse.role,
                  type: "text",
                  content: textContent,
                },
              ]);

              // Save the text content to Xano
              if (conversationId) {
                await createMessage(conversationId, singleResponse.role, textContent);
              }
            }
            // IMAGE
            else if (piece.type === "image_file" && piece.image_file?.file_id) {
              const fileId = piece.image_file.file_id;
              
              if (conversationId) {
                await createMessage(conversationId, singleResponse.role, fileId);
              }

              try {
                const arrayBuffer = await getImageFromContent(fileId);

                // Convert to base64
                const base64String = bufferToBase64(arrayBuffer as unknown as ArrayBuffer);
                const dataUrl = `data:image/png;base64,${base64String}`;

                // Add to local state
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    role: singleResponse.role, 
                    type: "image",
                    content: dataUrl,
                    fileId: fileId,
                  },
                ]);
              } catch (err) {
                console.error("Error fetching image from file_id:", fileId, err);
              }
            } else {
              console.warn("Unknown content type:", piece);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during message exchange:", error);
    }
  };

  // ---------------------------------
  // 5) Select an existing conversation
  // ---------------------------------
  const handleSelectConversation = async (conversationId: number) => {
    try {
      const fetchedMessages = await getMessages(conversationId);

      setActiveConversationId(conversationId);
      setThreadId(fetchedMessages.thread_id);

      // We stored text messages as text content, but images as file_id
      const localMsgFormat: LocalMessage[] = await Promise.all(
        fetchedMessages.messages.map(async (msg): Promise<LocalMessage> => {
          const maybeFileId = msg.content;
          const isFileId = maybeFileId?.startsWith("file-");

          if (isFileId) {
            const arrayBuffer = await getImageFromContent(maybeFileId);
            // Convert to base64
            const base64String = bufferToBase64(arrayBuffer as unknown as ArrayBuffer);
            const dataUrl = `data:image/png;base64,${base64String}`;

            return {
              id: msg.id,
              role: msg.role as "user" | "assistant",
              type: "image",
              content: dataUrl,
              fileId: maybeFileId,
            };
          } else {
            // It's text
            return {
              id: msg.id,
              role: msg.role,
              type: "text",
              content: msg.content,
            };
          }
        })
      );

      localMsgFormat.sort((a, b) => a.id - b.id);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LogoMessage message="Cargando Asistente..." />
    </div>
  );
};

export default ChatPage;
