"use client";

import React, { useState } from "react";
import { Agent } from "@/app/interfaces/assistant";

interface AgentFormProps {
  agent: Agent;
  onSave: (updatedAgent: Partial<Agent>) => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSave }) => {
  const [name, setName] = useState(agent.name);
  const [instructions, setInstructions] = useState(agent.instructions);
  const [model, setModel] = useState(agent.model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      instructions,
      model,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold mb-1" htmlFor="agent-name">
          Nombre
        </label>
        <input
          id="agent-name"
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Model */}
      <div>
        <label
          className="block text-sm font-semibold mb-1"
          htmlFor="agent-model"
        >
          Modelo
        </label>
        <input
          id="agent-model"
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      {/* Instructions */}
      <div>
        <label
          className="block text-sm font-semibold mb-1"
          htmlFor="agent-instructions"
        >
          Intrucciones
        </label>
        <textarea
          id="agent-instructions"
          className="w-full border border-gray-300 rounded p-2 h-36"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-textImportant text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </form>
  );
};

export default AgentForm;
