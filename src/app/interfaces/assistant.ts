export type AssistantState = {
  assistantId: string | null;
  vectorStoreId: string | null;
  pdfs: string[]; // Array of PDF URLs to track changes
  assistantData: Record<string, any> | null; // Assistant metadata (from the API)
  initializeAssistant: () => Promise<void>; // Initializes the assistant and vector store
  setAssistantId: (id: string) => void; // Updates the assistant ID
  setVectorStoreId: (id: string) => void; // Updates the vector store ID
  setAssistantData: (data: Record<string, any>) => void; // Updates the assistant metadata
};

export interface ConversationResponse {
  result: Conversation[];
}

export interface Conversation {
  id: number;
  assistant_id: string;
  thread_id: string;
  title?: string;
  created_at?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  created_at?: string;
}

export interface GetMessages extends Conversation {
  messages: Message[];
}