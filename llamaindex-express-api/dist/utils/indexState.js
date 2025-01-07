"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearIndex = exports.setIndex = exports.getIndex = exports.setIsInitialized = exports.getIsInitialized = void 0;
const state = {
    index: null,
    isInitialized: false
};
const getIsInitialized = () => state.isInitialized;
exports.getIsInitialized = getIsInitialized;
const setIsInitialized = (initialized) => {
    state.isInitialized = initialized;
};
exports.setIsInitialized = setIsInitialized;
const getIndex = () => state.index;
exports.getIndex = getIndex;
const setIndex = (newIndex) => {
    state.index = newIndex;
};
exports.setIndex = setIndex;
const clearIndex = () => {
    state.index = null;
};
exports.clearIndex = clearIndex;
