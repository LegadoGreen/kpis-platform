"use server";
import OpenAI from "openai";
import { toFile } from "openai";
import axios from "axios";
import { PDF } from "../interfaces/pdf";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const createAssistant = async () => {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "PDF Assistant",
      instructions: "You are a helpful assistant that provides context and answers using PDF data.",
      tools: [{ type: "file_search" }], // Include the file search tool
      model: "gpt-4o",
    });

    // Save the assistant ID for future use
    console.log("Assistant Created:", assistant.id);
    return assistant.id;
  } catch (error) {
    console.error("Error creating assistant:", error);
    throw error;
  }
};

export const createVectorStore = async (assistant: string) => {
  try {
    // Step 1: Fetch PDFs from your backend
    const { data: pdfs } = await axios.get("https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs");

    // Step 2: Download PDFs and convert to Blobs
    const fileBlobs = await Promise.all(
      pdfs.map(async (pdf: PDF) => {
        const response = await axios.get(pdf.file.url, { responseType: "arraybuffer" });
        return new Blob([response.data], { type: pdf.file.mime });
      })
    );

    // convert to file type using toFile for openai
    const files = await Promise.all(fileBlobs.map((blob, index) => {
      return toFile(blob, pdfs[index].file.name);
    }));

    console.log('files', files);

    // Step 3: Create the vector store
    const vectorStore = await openai.beta.vectorStores.create({
      name: "Uploaded PDFs",
    });

    // Step 4: Upload the file Blobs to the vector store
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files });

    // Step 5: Link the vector store to the assistant
    await openai.beta.assistants.update(assistant, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    console.log("Vector store created and linked:", vectorStore.id);
    return vectorStore.id;
  } catch (error) {
    console.error("Error creating vector store:", error);
    throw error;
  }
};

export const createThread = async (message: string) => {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: message,
        }
      ]
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
      run_id: runId
    });

    console.log("Fetched Thread Messages:", messages.data);

    return messages.data;
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    throw error;
  }
};

