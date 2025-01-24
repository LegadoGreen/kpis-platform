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
      assistantData: null, // New field for assistant data
      setAssistantId: (id: string) => set({ assistantId: id }),

      setVectorStoreId: (id: string) => set({ vectorStoreId: id }),
      setAssistantData: (data: any) => set({ assistantData: data }),

      initializeAssistant: async () => {
        try {
          const state = get();
          const authToken = localStorage.getItem("authToken");

          if (!authToken) {
            throw new Error("Authorization token is missing.");
          }

          // Fetch current assistant data and PDFs
          const [assistantResponse, currentPDFs] = await Promise.all([
            axios.get("https://xz9q-ubfs-tc3s.n7d.xano.io/api:3sOKW1_l/assistant/1", {
              headers: { Authorization: `Bearer ${authToken}` },
            }),
            fetchPDFs(),
          ]);

          const fetchedAssistantData = assistantResponse.data;
          console.log("Fetched Assistant Data:", fetchedAssistantData);

          // Check if assistant data or PDFs have changed
          const hasAssistantDataChanged =
            JSON.stringify(state.assistantData) !== JSON.stringify(fetchedAssistantData);
          const havePDFsChanged =
            JSON.stringify(state.pdfs) !== JSON.stringify(currentPDFs);

          console.log("Assistant Data Changed:", hasAssistantDataChanged);
          console.log("PDFs Changed:", havePDFsChanged);

          if (!hasAssistantDataChanged && !havePDFsChanged) {
            console.log("Using existing assistant and vector store.");
            return;
          }

          // Create new assistant if necessary
          let assistantId = state.assistantId;
          if (hasAssistantDataChanged || havePDFsChanged) {
            assistantId = await createAssistant(fetchedAssistantData);
            console.log("Created New Assistant ID:", assistantId);
          }

          let vectorStoreId = state.vectorStoreId;
          vectorStoreId = await createVectorStore(assistantId!);
          if (havePDFsChanged) {
            if (assistantId) {
              vectorStoreId = await createVectorStore(assistantId);
            } else {
              throw new Error("Assistant ID is null.");
            }
            console.log("Created New Vector Store ID:", vectorStoreId);
          }

          // Update Zustand state
          set({
            assistantId,
            vectorStoreId,
            assistantData: fetchedAssistantData,
            pdfs: currentPDFs,
          });
        } catch (error) {
          console.error("Error initializing assistant:", error);
        }
      },
    }),
    {
      name: "assistant-store",
      partialize: (state) => ({
        assistantId: state.assistantId,
        vectorStoreId: state.vectorStoreId,
        pdfs: state.pdfs,
        assistantData: state.assistantData,
        initializeAssistant: state.initializeAssistant,
        setAssistantId: state.setAssistantId,
        setVectorStoreId: state.setVectorStoreId,
        setAssistantData: state.setAssistantData,
      }),
    }
  )
);


// Helper function to fetch PDF metadata
const fetchPDFs = async (): Promise<string[]> => {
  const { data } = await axios.get("https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs");
  return data.map((pdf: any) => pdf.file.url); // Extract only PDF URLs
};
