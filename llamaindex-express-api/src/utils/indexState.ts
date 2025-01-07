import { VectorStoreIndex } from "llamaindex";

interface IndexState {
  index: VectorStoreIndex | null;
  isInitialized: boolean;
}

const state: IndexState = {
  index: null,
  isInitialized: false
};

export const getIsInitialized = (): boolean => state.isInitialized;

export const setIsInitialized = (initialized: boolean): void => {
  state.isInitialized = initialized;
};
export const getIndex = (): VectorStoreIndex | null => state.index;

export const setIndex = (newIndex: VectorStoreIndex): void => {
  state.index = newIndex;
};

export const clearIndex = (): void => {
  state.index = null;
};