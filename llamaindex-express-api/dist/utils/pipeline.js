"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
const llamaindex_1 = require("llamaindex");
function runPipeline(currentIndex, documents) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use ingestion pipeline to process the documents into nodes and add them to the vector store
        const pipeline = new llamaindex_1.IngestionPipeline({
            transformations: [
                new llamaindex_1.SentenceSplitter({
                    chunkSize: llamaindex_1.Settings.chunkSize,
                    chunkOverlap: llamaindex_1.Settings.chunkOverlap,
                }),
                llamaindex_1.Settings.embedModel,
            ],
        });
        try {
            const nodes = yield pipeline.run({ documents });
            if (currentIndex) {
                if (!nodes || nodes.length === 0) {
                    throw new Error('No valid nodes to insert into existing index');
                }
                console.log(`Inserting ${nodes.length} nodes into existing index...`);
                yield currentIndex.insertNodes(nodes);
                yield currentIndex.storageContext.docStore.persist();
                console.log("Successfully added and persisted nodes to vector store");
                return documents.map((document) => document.id_);
            }
            else {
                // Initialize a new index with the documents
                console.log("Creating new index with documents...");
                if (!documents || documents.length === 0) {
                    throw new Error('No documents found to create a new index');
                }
                const storageContext = yield (0, llamaindex_1.storageContextFromDefaults)({
                    persistDir: './storage',
                });
                try {
                    console.log(`Creating index with ${documents.length} documents...`);
                    const newIndex = yield llamaindex_1.VectorStoreIndex.fromDocuments(documents, {
                        storageContext,
                    });
                    yield newIndex.storageContext.docStore.persist();
                    console.log("Successfully created and persisted new index");
                    return documents.map((document) => document.id_);
                }
                catch (error) {
                    console.error('Failed to create vector store index:', error);
                    throw new Error('Failed to initialize vector store index: ' + error);
                }
            }
        }
        catch (error) {
            console.error('Error running ingestion pipeline:', error);
            throw new Error('Error running ingestion pipeline: ' + error);
        }
    });
}
