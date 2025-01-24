"use client";
import axios from "axios";
import OpenAI from "openai";
import { toFile } from "openai";
import { PDF } from "../interfaces/pdf";
import { Agent } from "../interfaces/assistant";
import { useAssistantStore } from "../store/assistantStore";
import { withLock } from "./lock";

// Determine environment
const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === "development";

// Configure OpenAI client
const openai = isDevelopment
  ? new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "Access-Control-Allow-Origin": "*",
      Origin: "https://legadogreen.github.io",
      Referer: "https://legadogreen.github.io",
    },
  })
  : new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT,
    dangerouslyAllowBrowser: true,
  });


export const createAssistant = async (assistantData: Agent) => {
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
          responseType: "arraybuffer",
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
      expires_after: {
        anchor: "last_active_at",
        days: 3
      }
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


export const updateAssistantWithVectorStore = async (
  assistantId: string,
  vectorStoreId: string
) => {
  try {
    // Update the assistant with the existing vector store
    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: { vector_store_ids: [vectorStoreId] },
      },
    });

    console.log(`Updated Assistant ${assistantId} with Vector Store ${vectorStoreId}`);
  } catch (error) {
    console.error("Error updating assistant with vector store:", error);
    throw error;
  }
};

export const initializeAssistantAndStore = async (): Promise<{ assistantId: string | null; vectorStoreId: string | null }> => {
  return await withLock(async () => {
    const assistantStore = useAssistantStore.getState();

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

    // Check if assistant data or PDFs have changed
    const hasAssistantDataChanged =
      JSON.stringify(assistantStore.assistantData) !==
      JSON.stringify(fetchedAssistantData);
    const havePDFsChanged =
      JSON.stringify(assistantStore.pdfs) !== JSON.stringify(currentPDFs);

    console.log("Assistant Data Changed:", hasAssistantDataChanged);
    console.log("PDFs Changed:", havePDFsChanged);

    if (!hasAssistantDataChanged && !havePDFsChanged) {
      console.log("Using cached assistant and vector store.");
      return {
        assistantId: assistantStore.assistantId,
        vectorStoreId: assistantStore.vectorStoreId,
      };
    }

    let assistantId = assistantStore.assistantId;
    let vectorStoreId = assistantStore.vectorStoreId;

    // If assistant data has changed, create a new assistant and link the vector store
    if (hasAssistantDataChanged) {
      assistantId = await createAssistant(fetchedAssistantData);

      if (vectorStoreId) {
        await updateAssistantWithVectorStore(assistantId, vectorStoreId);
      }

      console.log("Created new Assistant ID and linked Vector Store:", assistantId);
    }

    // If PDFs have changed, create a new vector store and associate it
    if (havePDFsChanged) {
      vectorStoreId = await createVectorStore(assistantId!);
      console.log("Created new Vector Store ID:", vectorStoreId);
    }

    // Update Zustand store with the latest data
    useAssistantStore.setState({
      assistantId,
      vectorStoreId,
      assistantData: fetchedAssistantData,
      pdfs: currentPDFs,
    });

    console.log("To return:", {
      assistantId,
      vectorStoreId,
    });

    return { assistantId, vectorStoreId };
  });
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
