"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useAssistantStore } from "../store/assistantStore";
import { Conversation } from "../interfaces/assistant";
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
interface LocalMessage {
  id: number;
  role: "user" | "assistant";
  type: "text" | "image";   // to differentiate text vs. image
  content: string;          // text content or base64 image data
  fileId?: string;          // store file_id if it's an image
}

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

  // Store's assistant ID
  const assistantId = useAssistantStore((state) => state.assistantId);

  // ---------------------------------
  // 2) Initialization
  // ---------------------------------
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

  // ---------------------------------
  // 3) New conversation
  // ---------------------------------
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

  // ---------------------------------
  // 4) Send user message
  // ---------------------------------
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

      // Ensure we have an active conversation in Xano
      let conversationId = activeConversationId;
      if (!conversationId) {
        const newConvTitle = `Conversation ${conversations.length + 1}`;
        const newConv = await createConversation(assistantId, currentThreadId, newConvTitle);
        setConversations((prev) => [...prev, newConv]);
        conversationId = newConv.id;
        setActiveConversationId(conversationId);
      }

      // 1) Add user message to the thread
      await addMessageToThread(currentThreadId as string, content);

      // 2) Create user message in Xano
      if (conversationId) {
        await createMessage(conversationId, "user", content);
      }

      // 3) Run the assistant on this thread
      const runId = await runAssistantOnThread(currentThreadId as string, assistantId);

      // 4) Fetch assistant messages
      if (runId) {
        const assistantMessages = await fetchThreadMessages(currentThreadId as string, runId);

        // The local AI might return multiple "pieces" in a single message.
        // We'll iterate over each piece and handle text/image accordingly.
        for (const singleResponse of assistantMessages) {
          // singleResponse.content is an array: e.g. [{type: "text"}, {type: "image_file"}]
          for (const piece of singleResponse.content) {
            // TEXT
            if (piece.type === "text") {
              const textContent = piece.text?.value || "";
              
              // Add to local state
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  role: singleResponse.role, // "assistant"
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
              
              // 1) Save the file_id to Xano (instead of base64 data)
              if (conversationId) {
                await createMessage(conversationId, singleResponse.role, fileId);
              }

              // 2) Retrieve from OpenAI and store in local chat as base64
              try {
                // getImageFromFileId => you must define in utils/openai.ts
                const arrayBuffer = await getImageFromContent(fileId);

                // Convert to base64
                const base64String = bufferToBase64(arrayBuffer);
                const dataUrl = `data:image/png;base64,${base64String}`;

                // Add to local state
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    role: singleResponse.role, 
                    type: "image",
                    content: dataUrl, // base64 data URL
                    fileId: fileId,   // optional reference
                  },
                ]);
              } catch (err) {
                console.error("Error fetching image from file_id:", fileId, err);
              }
            } else {
              // Some unknown message type
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
      // 1) Fetch messages from Xano
      const fetchedMessages = await getMessages(conversationId);

      // 2) Update local states
      setActiveConversationId(conversationId);
      setThreadId(fetchedMessages.thread_id);

      // 3) Convert to LocalMessage shape
      //    We stored text messages as text content, but images as file_id
      const localMsgFormat: LocalMessage[] = fetchedMessages.messages.map((msg): LocalMessage => {
        // If you stored actual text in Xano, then it's text.
        // If you stored an image file_id, you might want to do a separate fetch here
        // or simply display a placeholder. For example:
        
        // A simple approach: treat everything as text except if it looks like file-Gxxxx...
        const maybeFileId = msg.content;
        const isFileId = maybeFileId?.startsWith("file-");

        if (isFileId) {
          // It's an image message. If you want to fetch them automatically
          // when opening a conversation, you'd replicate the logic here.
          // For brevity, let's store the file_id, but not fetch immediately:
          return {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            type: "image",
            content: "",  // or a placeholder
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
      });

      // 4) Sort by ID
      localMsgFormat.sort((a, b) => a.id - b.id);

      // 5) Set the messages to display in ChatWindow
      setMessages(localMsgFormat);
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  };

  // ---------------------------------
  // 6) Render
  // ---------------------------------
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
        {/* Pass the entire messages array to ChatWindow */}
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
