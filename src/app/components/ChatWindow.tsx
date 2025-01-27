import React from "react";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import "katex/dist/katex.min.css";
import { LocalMessage } from "../interfaces/assistant";

marked.use(
  markedKatex({
    throwOnError: false,
    output: "html",
  })
);

const ChatWindow: React.FC<{ messages: LocalMessage[] }> = ({ messages }) => {
  return (
    <div className="flex-1 p-6 bg-white rounded-lg shadow overflow-y-auto markdown">
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        // 1) TEXT MESSAGE
        if (msg.type === "text") {
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
        // 2) IMAGE MESSAGE
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
              <picture>
                <img
                  src={msg.content}
                  alt="AI Generated"
                  className="max-w-full h-auto rounded"
                />
              </picture>
            </div>
          );
        }
        // 3) THINKING MESSAGE
        else if (msg.type === "thinking") {
          return (
            <div
              key={msg.id}
              className={`p-3 my-2 rounded-lg bg-background text-textPrimary`}
            >
              <span>Creando respuesta</span>
              {/* animated dots */}
              <span className="typing-indicator"></span>
            </div>
          );
        }
        // 4) UNKNOWN
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
