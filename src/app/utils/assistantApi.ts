import { Conversation, Message, GetMessages } from "../interfaces/assistant";
import { apiConversation } from "./api";
/**
 * Creates a new conversation in Xano.
 */
export async function createConversation(
  assistantId: string,
  threadId: string,
  title: string
): Promise<Conversation> {
  apiConversation.defaults.headers.common["Authorization"] = localStorage.getItem("authToken");
  const response = await apiConversation.post('/conversations', {
    assistant_id: assistantId,
    thread_id: threadId,
    title
  });
  return response.data; // newly created conversation
}

/**
 * Fetch all conversations from Xano.
 */
export async function getAllConversations(): Promise<Conversation[]> {
  apiConversation.defaults.headers.common["Authorization"] = localStorage.getItem("authToken");
  const response = await apiConversation.get('/conversations');
  return response.data.result; // array of conversations
}

/**
 * Fetch a single conversation by ID.
 */
export async function getConversationById(id: number): Promise<Conversation> {
  apiConversation.defaults.headers.common["Authorization"] = localStorage.getItem("authToken");
  const response = await apiConversation.get(`/conversations/${id}`);
  return response.data;
}

/**
 * Create a new message for a conversation.
 */
export async function createMessage(
  conversationId: number,
  role: string,
  content: string
): Promise<Message> {
  apiConversation.defaults.headers.common["Authorization"] = localStorage.getItem("authToken");
  const response = await apiConversation.post(
    `/conversations/${conversationId}/message`,
    { role, 
      content,
      conversations_id: conversationId
    }
  );
  return response.data;
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getMessages(
  conversationId: number
): Promise<GetMessages> {
  apiConversation.defaults.headers.common["Authorization"] = localStorage.getItem("authToken");
  const response = await apiConversation.get(
    `/conversations/${conversationId}/messages`
  );
  return response.data; // array of messages
}
