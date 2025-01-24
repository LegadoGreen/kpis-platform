import React from "react";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import "katex/dist/katex.min.css";

type ChatWindowProps = {
  messages: {
    id: number;
    role: "user" | "assistant";
    type: "text" | "image";
    content: string; // text or base64 data URL
    fileId?: string;   // store file ID if needed
  }[];
};

marked.use(
  markedKatex({
    throwOnError: false,
    output: "html",
  })
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-6 bg-white rounded-lg shadow overflow-y-auto">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        // TEXT MESSAGE?
        if (msg.type === "text") {
          // Convert Markdown (with possible KaTeX) to HTML
          const renderedContent = marked(msg.content);
          return (
            <div
              key={msg.id}
              className={`p-3 my-2 rounded-lg ${
                isUser
                  ? "bg-textImportant text-white ml-auto max-w-[80%]"
                  : "bg-background text-textPrimary"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: renderedContent }}
                className={`${isUser ? "text-white" : "prose max-w-none"}`}
              />
            </div>
          );
        }
        // IMAGE MESSAGE?
        else if (msg.type === "image") {
          return (
            <div
              key={msg.id}
              className={`p-3 my-2 rounded-lg ${
                isUser
                  ? "bg-textImportant ml-auto max-w-[80%]"
                  : "bg-background"
              }`}
            >
              {/* Render the image */}
              <img
                src={msg.content} // The base64 data URI
                alt="AI Generated"
                className="max-w-full h-auto rounded"
              />
            </div>
          );
        }
        // UNKNOWN
        else {
          return (
            <div key={msg.id} className="p-3 my-2 rounded-lg bg-red-100">
              <em>Unknown message type</em>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ChatWindow;
