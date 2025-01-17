import React, { useState } from "react";
import { FiSend } from "react-icons/fi";

type ChatInputProps = {
  onSendMessage: (content: string) => void;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4">
      <div className="relative mx-auto w-3/4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-3 pr-12 border rounded-full focus:outline-none focus:ring-2 focus:ring-textImportant"
        />
        <button
          onClick={handleSend}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textImportant hover:text-opacity-90"
        >
          <FiSend size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
