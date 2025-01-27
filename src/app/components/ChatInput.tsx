import React, { useState } from "react";
import { FiSend } from "react-icons/fi";

type ChatInputProps = {
  onSendMessage: (content: string) => void;
  isWaiting: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isWaiting }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSendMessage(trimmed);
      setMessage("");
    }
  };

  // Capture "Enter" key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="relative mx-auto w-3/4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isWaiting} // disable while waiting
          className="w-full p-3 pr-12 border rounded-full 
                     focus:outline-none focus:ring-2
                     focus:ring-textImportant
                     disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isWaiting} // also disable the send button
          className="absolute right-3 top-1/2 transform 
                     -translate-y-1/2 text-textImportant 
                     hover:text-opacity-90 disabled:cursor-not-allowed"
        >
          <FiSend size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
