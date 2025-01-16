import React from "react";

type SidebarProps = {
  conversations: { id: number; title: string }[];
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ conversations, onSelectConversation, onNewConversation }) => {
  return (
    <div className="bg-gray-100 w-1/4 h-full p-4 border-r">
      <button
        onClick={onNewConversation}
        className="w-full bg-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-600"
      >
        New Chat
      </button>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            className="p-2 mb-2 cursor-pointer hover:bg-gray-200 rounded"
            onClick={() => onSelectConversation(conv.id)}
          >
            {conv.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
