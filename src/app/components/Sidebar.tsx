import React from "react";

type SidebarProps = {
  conversations: { id: number; title: string }[];
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ conversations, onSelectConversation, onNewConversation }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-64 max-w-xs h-screen flex flex-col">
      <button
        onClick={onNewConversation}
        className="bg-textImportant text-white py-2 px-4 rounded-full mb-4 hover:bg-opacity-90"
      >
        + New Chat
      </button>
      <ul className="flex-1 overflow-y-auto space-y-2">
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="p-3 rounded-lg bg-background hover:bg-textImportant hover:text-white transition cursor-pointer"
          >
            {conv.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
