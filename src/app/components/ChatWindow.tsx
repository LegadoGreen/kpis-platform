import React from "react";

type ChatWindowProps = {
  messages: { id: number; role: string; content: string }[];
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-2 mb-2 rounded ${
            msg.role === "user" ? "bg-blue-100 self-end" : "bg-gray-100"
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
