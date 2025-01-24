"use client";

import React, { useEffect, useState } from "react";
import axios from "axios"; // If you need it, ensure to install: `yarn add axios`
import AgentForm from "../../components/AgentForm";
import LogoMessage from "@/app/components/LogoMessage";

const AGENT_ID = 1; // Or obtain from env/params if multiple agents
const AGENT_API_BASE = "https://xz9q-ubfs-tc3s.n7d.xano.io/api:3sOKW1_l/assistant";

interface Agent {
  id: number;
  name: string;
  instructions: string;
  model: string;
  created_at: number;
}

const AgentPage: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authorization token is missing.");
      }
      const res = await axios.get(`${AGENT_API_BASE}/${AGENT_ID}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setAgent(res.data);
    } catch (err) {
      console.error("Error fetching agent:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);

  const handleSave = async (updatedAgent: Partial<Agent>) => {
    if (!agent) return;
    // Example: PUT or PATCH to update
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authorization token is missing.");
      }
      const res = await axios.put(`${AGENT_API_BASE}/${agent.id}`,
        updatedAgent,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      setAgent(res.data);
      alert("Agent updated successfully!");
    } catch (err) {
      console.error("Error updating agent:", err);
      alert("Failed to update agent.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LogoMessage message="Cargando..." />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LogoMessage message="No se ha encontrado agente" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-textImportant mb-6">
        Manejo de Agente
      </h1>
      <AgentForm agent={agent} onSave={handleSave} />
    </div>
  );
};

export default AgentPage;
