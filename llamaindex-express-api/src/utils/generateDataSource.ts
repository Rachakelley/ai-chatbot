import { SimpleDirectoryReader, storageContextFromDefaults, VectorStoreIndex } from "llamaindex";
import path from 'path';
import fs from 'fs';
import { setIndex } from "./indexState";

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export async function generateDatasource(): Promise<boolean> {
  try {
    console.log(`Generating storage context...`);
    // Split documents, create embeddings and store them in the storage context
    const persistDir = '/storage';

    const storageContext = await storageContextFromDefaults({
      persistDir,
    });

    // Load uploaded documents using SimpleDirectoryReader
    const documents = await new SimpleDirectoryReader().loadData({
      directoryPath: dataDir,
    });

    const index = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    setIndex(index);
    console.log(`Storage context successfully generated.`);

    return true;
  } catch (error) {
    console.error('Generation failed:', error);
    return false;
  }
};