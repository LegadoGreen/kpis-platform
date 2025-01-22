export type AssistantState = {
  assistantId: string | null;
  vectorStoreId: string | null;
  pdfs: string[]; // Array of PDF URLs to track changes
  initializeAssistant: () => Promise<void>;
  setAssistantId: (id: string) => void;
};