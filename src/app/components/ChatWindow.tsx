import React from "react";
import { marked } from "marked";

type ChatWindowProps = {
  messages: { id: number; role: string; content: string }[];
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-6 bg-white rounded-lg shadow overflow-y-auto">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const renderedContent = marked(msg.content); // Convert Markdown to HTML

        return (
          <div
            key={msg.id}
            className={`p-3 my-2 rounded-lg ${isUser
                ? "bg-textImportant text-white ml-auto max-w-[80%]"
                : "bg-background text-textPrimary"
              }`}
          >
            {/* Render the formatted HTML safely */}
            <div
              dangerouslySetInnerHTML={{ __html: renderedContent }}
              className={`${isUser ? "text-white" : "prose max-w-none"
                }`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChatWindow;
