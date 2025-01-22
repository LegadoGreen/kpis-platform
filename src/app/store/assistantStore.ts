import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { createAssistant, createVectorStore } from "../utils/openai";
import { AssistantState } from "../interfaces/assistant";

export const useAssistantStore = create(
  persist<AssistantState>(
    (set, get) => ({
      assistantId: null,
      vectorStoreId: null,
      pdfs: [],
      setAssistantId: (id: string) => set({ assistantId: id }),

      initializeAssistant: async () => {
        try {
          const state = get();
          const authToken = localStorage.getItem("authToken");

          if (!authToken) {
            throw new Error("Authorization token is missing.");
          }

          // Fetch assistant details from the API
          const { data: assistantData } = await axios.get(
            "https://xz9q-ubfs-tc3s.n7d.xano.io/api:3sOKW1_l/assistant/1",
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          console.log("Fetched Assistant Data:", assistantData);

          // Check if the assistant and PDFs match the current data
          const currentPDFs = await fetchPDFs();
          if (
            state.assistantId &&
            state.vectorStoreId &&
            JSON.stringify(state.pdfs) === JSON.stringify(currentPDFs)
          ) {
            console.log("Reusing existing assistant and vector store.");
            return;
          }

          // Create new assistant and vector store if needed
          const assistantId = await createAssistant(assistantData);
          const vectorStoreId = await createVectorStore(assistantId);

          // Update state with new assistant and vector store
          set({ assistantId, vectorStoreId, pdfs: currentPDFs });

          console.log("Assistant and vector store initialized:", {
            assistantId,
            vectorStoreId,
          });
        } catch (error) {
          console.error("Error initializing assistant:", error);
        }
      },
    }),
    {
      name: "assistant-store", // Key for localStorage
      partialize: (state) => ({
        assistantId: state.assistantId,
        vectorStoreId: state.vectorStoreId,
        pdfs: state.pdfs,
        initializeAssistant: state.initializeAssistant,
        setAssistantId: state.setAssistantId,
      }),
    }
  )
);

// Helper function to fetch PDF metadata
const fetchPDFs = async (): Promise<string[]> => {
  const { data } = await axios.get("https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs");
  return data.map((pdf: any) => pdf.file.url); // Extract only PDF URLs
};
