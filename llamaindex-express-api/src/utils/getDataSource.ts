import { SimpleDocumentStore, storageContextFromDefaults, VectorStoreIndex } from "llamaindex";
import { setIndex } from "./indexState";

export async function getDataSource(): Promise<VectorStoreIndex | null> {
  const persistDir = './storage';

  const storageContext = await storageContextFromDefaults({
    persistDir,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    return null;
  }

  const index = await VectorStoreIndex.init({
    storageContext,
  });

  setIndex(index);

  return index;
}
