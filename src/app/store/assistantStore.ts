import { create } from "zustand";
import axios from "axios";
import { createAssistant, createVectorStore } from "../utils/openai";
import { AssistantState } from "../interfaces/assistant";

export const useAssistantStore = create<AssistantState>((set, get) => ({
  assistantId: null,
  vectorStoreId: null,
  pdfs: [],
  setAssistantId: (id: string) => set({ assistantId: id }),

  initializeAssistant: async () => {
    try {
      const state = get();
      // Retrieve the token from localStorage or Zustand
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("Authorization token is missing.");
      }

      // Fetch assistant details from API
      const { data: assistantData } = await axios.get(
        "https://xz9q-ubfs-tc3s.n7d.xano.io/api:3sOKW1_l/assistant/1",
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Add Bearer token here
          },
        }
      );

      console.log("Fetched Assistant Data:", assistantData);

      // If assistant already exists and PDFs haven't changed, reuse
      if (state.assistantId && JSON.stringify(state.pdfs) === JSON.stringify(await fetchPDFs())) {
        console.log("Using existing assistant and vector store.");
        return;
      }

      // Create the assistant using fetched data
      const assistantId = await createAssistant(assistantData);
      console.log("Created Assistant ID:", assistantId);

      // Fetch current PDFs
      const pdfs = await fetchPDFs();

      // Create a vector store linked to the assistant
      const vectorStoreId = await createVectorStore(assistantId);
      console.log("Created Vector Store ID:", vectorStoreId);

      // Update Zustand state
      set({ assistantId, vectorStoreId, pdfs });
    } catch (error) {
      console.error("Error initializing assistant:", error);
    }
  },
}));

// Helper function to fetch PDF metadata
const fetchPDFs = async (): Promise<string[]> => {
  const { data } = await axios.get("https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs");
  return data.map((pdf: any) => pdf.file.url); // Extract only PDF URLs
};
