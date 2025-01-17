import React from "react";

type ChatWindowProps = {
  messages: { id: number; role: string; content: string }[];
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-6 bg-white rounded-lg shadow overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 my-2 rounded-lg ${
            msg.role === "user"
              ? "bg-textImportant text-white self-end"
              : "bg-background text-textPrimary"
          }`}
          style={{ maxWidth: "80%" }}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
