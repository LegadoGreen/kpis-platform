import axios from "axios";
import OpenAI from "openai";
import { toFile } from "openai";
import { PDF } from "../interfaces/pdf";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const createAssistant = async () => {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Legado - Generador de KPIs",
      instructions: "Este GPT es un generador especializado en Key Performance Indicators (KPIs) de alta calidad. Su propósito es interactuar con los usuarios para entender los detalles de sus proyectos y ofrecer KPIs personalizados y ajustados a los objetivos y características del proyecto. Puede procesar datos provenientes de archivos PDF dados en la instruccion, para extraer información relevante y construir KPIs más precisos y útiles. Estos PDFs, contienen información clave como indicadores temáticos y temáticas de impacto. Al generar los KPIs, utiliza la siguiente estructura estándar para cada uno: (Nombre KPI: - Tipo, - Definición, - Fórmula/Cálculo, - Rango, - Fuente); Adicionalmente, puede incluir otros elementos relevantes según las necesidades del proyecto, como periodicidad, unidad de medida y herramientas recomendadas para su seguimiento. El GPT solicita información clave, como el propósito del proyecto, los resultados esperados, las áreas clave de desempeño y los recursos disponibles, para generar KPIs claros, relevantes y accionables. Responde de manera profesional, clara y con un enfoque orientado a resultados, manteniendo un tono accesible y útil. Proporciona orientación adicional, ejemplos o plantillas si el usuario lo solicita.",
      tools: [{ type: "file_search" }], // Include the file search tool
      model: "gpt-4o-mini",
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
    // 1. Fetch your PDF metadata from wherever you store them
    const { data: pdfs } = await axios.get(
      "https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t/pdfs"
    );

    // 2. Download each PDF file as an array buffer, then convert it to a "File"
    const files = await Promise.all(
      pdfs.map(async (pdf: PDF) => {
        // a) Get raw bytes
        const response = await axios.get(pdf.file.url, {
          responseType: "arraybuffer", // ensures we get binary data
        });

        // b) Convert that binary data into a File with the correct type
        //    Pass the PDF name and MIME type so that it's a valid PDF.
        const file = await toFile(response.data, pdf.file.name, {
          type: "application/pdf",
        });
        return file;
      })
    );

    console.log("Files to upload:", files);

    // 3. Create the vector store
    const vectorStore = await openai.beta.vectorStores.create({
      name: "Uploaded PDFs",
    });

    // 4. Upload the files to the vector store
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files,
    });

    // 5. Link the vector store to the assistant
    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: { vector_store_ids: [vectorStore.id] },
      },
    });

    const fileIds = [];
    for await (const file of openai.beta.vectorStores.files.list(
      vectorStore.id,
    )) {
      fileIds.push(file.id);
    }

    console.log("Vector store created and linked:", vectorStore.id);
    console.log("Files uploaded:", fileIds);
    return vectorStore.id;
  } catch (error) {
    console.error("Error creating vector store:", error);
    throw error;
  }
};
// everything else can remain the same
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
