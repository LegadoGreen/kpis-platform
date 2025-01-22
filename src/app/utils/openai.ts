"use client";
import axios from "axios";
import OpenAI from "openai";
import { toFile } from "openai";
import { PDF } from "../interfaces/pdf";
import { useAssistantStore } from "../store/assistantStore";

const openai = new OpenAI({ 
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT,
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.openai.com/v1"
});

export const createAssistant = async (assistantData: any) => {
  try {
    const assistant = await openai.beta.assistants.create({
      name: assistantData.name,
      instructions: assistantData.instructions,
      tools: [{ type: "file_search" }], // Include the file search tool
      model: assistantData.model,
    });

    console.log("Assistant Created:", assistant.id);
    return assistant.id;
  } catch (error) {
    console.error("Error creating assistant:", error);
    throw error;
  }
};

export const createVectorStore = async (assistantId: string) => {
  try {
    // Fetch the PDFs
    const { data: pdfs } = await axios.get(
      "https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs"
    );

    const files = await Promise.all(
      pdfs.map(async (pdf: PDF) => {
        const response = await axios.get(pdf.file.url, {
          responseType: "arraybuffer", // Ensure binary data
        });

        const file = await toFile(response.data, pdf.file.name, {
          type: "application/pdf",
        });
        return file;
      })
    );

    console.log("Files to upload:", files);

    const vectorStore = await openai.beta.vectorStores.create({
      name: "Uploaded PDFs",
    });

    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files,
    });

    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: { vector_store_ids: [vectorStore.id] },
      },
    });

    console.log("Vector Store created and linked:", vectorStore.id);
    return vectorStore.id;
  } catch (error) {
    console.error("Error creating vector store:", error);
    throw error;
  }
};

// New function to initialize an assistant and vector store dynamically
export const initializeAssistantAndStore = async () => {
  const assistantStore = useAssistantStore.getState();
  // Retrieve the token from localStorage or Zustand
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("Authorization token is missing.");
  }

  // Fetch assistant details with Bearer token
  const { data: assistantData } = await axios.get(
    "https://xz9q-ubfs-tc3s.n7d.xano.io/api:3sOKW1_l/assistant/1",
    {
      headers: {
        Authorization: `Bearer ${authToken}`, // Add Bearer token here
      },
    }
  );

  console.log("Fetched Assistant Data:", assistantData);

  // Check if the assistant and PDFs are already initialized
  if (
    assistantStore.assistantId &&
    JSON.stringify(assistantStore.pdfs) === JSON.stringify(await fetchPDFs())
  ) {
    console.log("Using cached assistant and vector store.");
    return {
      assistantId: assistantStore.assistantId,
      vectorStoreId: assistantStore.vectorStoreId,
    };
  }

  // Create a new assistant
  const assistantId = await createAssistant(assistantData);

  // Create a new vector store and link PDFs
  const vectorStoreId = await createVectorStore(assistantId);

  // Fetch current PDFs and cache them
  const pdfs = await fetchPDFs();

  // Update the Zustand store with new assistant and vector store details
  assistantStore.setAssistantId(assistantId);
  useAssistantStore.setState({ vectorStoreId, pdfs });

  console.log("Initialized Assistant and Vector Store:", {
    assistantId,
    vectorStoreId,
  });

  return { assistantId, vectorStoreId };
};

export const createThread = async (message: string) => {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });
    console.log("Thread Created:", thread.id);
    return thread.id;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};

export const addMessageToThread = async (threadId: string, message: string) => {
  try {
    const response = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    console.log("Message Added to Thread:", response.id);
    return response.id;
  } catch (error) {
    console.error("Error adding message to thread:", error);
    throw error;
  }
};

export const runAssistantOnThread = async (threadId: string, assistantId: string) => {
  try {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    console.log("Run Completed:", run.status);
    console.log("Run ID:", run.id);
    return run.status === "completed" ? run.id : null;
  } catch (error) {
    console.error("Error running assistant:", error);
    throw error;
  }
};

export const fetchThreadMessages = async (threadId: string, runId: string) => {
  try {
    const messages = await openai.beta.threads.messages.list(threadId, {
      run_id: runId,
    });

    console.log("Fetched Thread Messages:", messages.data);
    console.log("Fetched Thread Messages content:", messages.data[0].content);
    return messages.data;
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    throw error;
  }
};

// Helper function to fetch PDF URLs
const fetchPDFs = async (): Promise<string[]> => {
  const { data } = await axios.get("https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs");
  return data.map((pdf: PDF) => pdf.file.url);
};
