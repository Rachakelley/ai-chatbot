import {
  Document,
  IngestionPipeline,
  SentenceSplitter,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

export async function runPipeline(
  currentIndex: VectorStoreIndex | null,
  documents: Document[],
) {
  // Use ingestion pipeline to process the documents into nodes and add them to the vector store
  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({
        chunkSize: Settings.chunkSize,
        chunkOverlap: Settings.chunkOverlap,
      }),
      Settings.embedModel,
    ],
  });

  try {
    const nodes = await pipeline.run({ documents });

    if (currentIndex) {
      if (!nodes || nodes.length === 0) {
        throw new Error('No valid nodes to insert into existing index');
      }

      console.log(`Inserting ${nodes.length} nodes into existing index...`);
      await currentIndex.insertNodes(nodes);
      await currentIndex.storageContext.docStore.persist();
      console.log("Successfully added and persisted nodes to vector store");

      return documents.map((document) => document.id_);
    } else {
      // Initialize a new index with the documents
      console.log("Creating new index with documents...");

      if (!documents || documents.length === 0) {
        throw new Error('No documents found to create a new index');
      }

      const storageContext = await storageContextFromDefaults({
        persistDir: './storage',
      });

      try {
        console.log(`Creating index with ${documents.length} documents...`);
        const newIndex = await VectorStoreIndex.fromDocuments(documents, {
          storageContext,
        });

        await newIndex.storageContext.docStore.persist();
        console.log("Successfully created and persisted new index");

        return documents.map((document) => document.id_);
      } catch (error) {
        console.error('Failed to create vector store index:', error);
        throw new Error('Failed to initialize vector store index: ' + error);
      }
    }
  } catch (error) {
    console.error('Error running ingestion pipeline:', error);
    throw new Error('Error running ingestion pipeline: ' + error);
  }
}