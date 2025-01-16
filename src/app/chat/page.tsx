"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState([
    { id: 1, title: "Conversation 1" },
    { id: 2, title: "Conversation 2" },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, role: "user", content: "Hello" },
    { id: 2, role: "system", content: "Hi there! How can I assist you?" },
  ]);

  const handleNewConversation = () => {
    const newConv = { id: Date.now(), title: `Conversation ${conversations.length + 1}` };
    setConversations([...conversations, newConv]);
    setSelectedConversation(newConv.id);
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
    // Fetch messages for the selected conversation
  };

  const handleSendMessage = (content: string) => {
    setMessages([...messages, { id: Date.now(), role: "user", content }]);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />
      <div className="flex flex-col flex-1">
        <ChatWindow messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
